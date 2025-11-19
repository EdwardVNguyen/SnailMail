import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const deliverPackageController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { packageId, deliveryType, deliveryFacilityId, authId } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let finalStatus;
    let eventType;
    let locationAddressId = null;

    if (deliveryType === 'facility') {
      // Transfer to another facility
      finalStatus = 'processing';
      eventType = 'processing';

      // Get the facility's address_id for the tracking event
      const [[facilityData]] = await connection.execute(
        `SELECT address_id FROM facility WHERE facility_id = ?`,
        [deliveryFacilityId]
      );

      if (facilityData && facilityData.address_id) {
        locationAddressId = facilityData.address_id;
      }

      // Update package: change status back to processing, update location, clear courier
      await connection.execute(
        `UPDATE package
         SET package_status = ?, facility_id = ?, courier_id = NULL, updated_by = ?
         WHERE package_id = ?`,
        [finalStatus, deliveryFacilityId, authId, packageId]
      );
    } else {
      // Deliver to recipient
      finalStatus = 'delivered';
      eventType = 'delivered';

      // Get recipient's address_id for the tracking event
      const [[packageData]] = await connection.execute(
        `SELECT c.address_id
         FROM package p
         JOIN customer c ON p.recipient_id = c.customer_id
         WHERE p.package_id = ?`,
        [packageId]
      );

      if (packageData && packageData.address_id) {
        locationAddressId = packageData.address_id;
      }

      // Update package: mark as delivered
      await connection.execute(
        `UPDATE package
         SET package_status = ?, updated_by = ?
         WHERE package_id = ?`,
        [finalStatus, authId, packageId]
      );
    }

    // Add tracking event with location_id pointing to address (either facility or recipient)
    await connection.execute(
      `INSERT INTO tracking_event (package_id, event_type, location_id, event_time, created_by, updated_by)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [packageId, eventType, locationAddressId, authId, authId]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Package delivered successfully' }));
  }
  catch (error) {
    if (connection) await connection.rollback();
    console.error('Error delivering package:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
