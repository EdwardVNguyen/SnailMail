import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const deliverPackageController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { packageId, deliveryType, deliveryFacilityId, photoUrl, authId } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let finalStatus;
    let eventType;
    let newLocation = null;

    if (deliveryType === 'facility') {
      // Transfer to another facility
      finalStatus = 'processing';
      eventType = 'in transit';
      newLocation = deliveryFacilityId;

      // Update package: change status back to processing, update location, clear courier
      await connection.execute(
        `UPDATE package
         SET package_status = ?, current_location = ?, courier_id = NULL, updated_by = ?
         WHERE package_id = ?`,
        [finalStatus, newLocation, authId, packageId]
      );
    } else {
      // Deliver to recipient
      finalStatus = 'delivered';
      eventType = 'delivered';

      // Update package: mark as delivered
      await connection.execute(
        `UPDATE package
         SET package_status = ?, updated_by = ?
         WHERE package_id = ?`,
        [finalStatus, authId, packageId]
      );

      // If photo URL provided, could store it somewhere (optional)
      if (photoUrl) {
        // Could add a delivery_photo column to package table or create a separate table
        // For now, we'll just log it or skip it
        console.log(`Delivery photo for package ${packageId}: ${photoUrl}`);
      }
    }

    // Add tracking event
    const locationForEvent = newLocation || (await connection.execute(
      'SELECT current_location FROM package WHERE package_id = ?',
      [packageId]
    ))[0][0]?.current_location;

    await connection.execute(
      `INSERT INTO tracking_event (package_id, event_type, location, event_date, created_by, updated_by)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [packageId, eventType, locationForEvent, authId, authId]
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
