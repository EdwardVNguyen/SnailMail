import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Courier confirms package delivery (with optional photo for house deliveries)
export const confirmDeliveryController = async (req, res) => {
  let packageId, authId, deliveryType, deliveryPhotoUrl, deliveryNotes, recipientName;

  try {
    const body = await getJSONRequestBody(req);
    packageId = body.packageId;
    authId = body.authId;
    deliveryType = body.deliveryType; // 'facility' or 'recipient_address'
    deliveryPhotoUrl = body.deliveryPhotoUrl || null;
    deliveryNotes = body.deliveryNotes || null;
    recipientName = body.recipientName || null;

    if (!packageId || !authId || !deliveryType) {
      return badClientRequest(res, { message: 'Missing required fields' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get courier info
    const [[courier]] = await connection.execute(
      `SELECT employee_id, account_type
       FROM employee
       WHERE auth_id = ? AND account_type = 'courier'`,
      [authId]
    );

    if (!courier) {
      await connection.rollback();
      return badClientRequest(res, { message: 'User is not a courier' });
    }

    // Check if courier is assigned to this package
    const [[assignment]] = await connection.execute(
      `SELECT assignment_id, delivery_status, destination_facility_id
       FROM package_assignment
       WHERE package_id = ? AND courier_id = ?`,
      [packageId, courier.employee_id]
    );

    if (!assignment) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package not assigned to you' });
    }

    // Create delivery confirmation
    await connection.execute(
      `INSERT INTO package_delivery_confirmation
       (package_id, courier_id, delivery_type, delivery_photo_url, delivery_notes, recipient_name, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [packageId, courier.employee_id, deliveryType, deliveryPhotoUrl, deliveryNotes, recipientName, authId, authId]
    );

    // Update package assignment
    await connection.execute(
      `UPDATE package_assignment
       SET delivery_status = 'delivered',
           updated_by = ?
       WHERE assignment_id = ?`,
      [authId, assignment.assignment_id]
    );

    // Determine the final package status and update
    let finalStatus;
    let eventType;
    let locationId = null;

    if (deliveryType === 'facility') {
      // Delivered to a facility - package goes back to processing
      finalStatus = 'processing';
      eventType = 'in transit';
      locationId = assignment.destination_facility_id;

      // Update package facility location
      await connection.execute(
        `UPDATE package
         SET package_status = ?,
             facility_id = ?,
             updated_by = ?
         WHERE package_id = ?`,
        [finalStatus, assignment.destination_facility_id, authId, packageId]
      );
    } else {
      // Delivered to recipient address - package is delivered
      finalStatus = 'delivered';
      eventType = 'delivered';

      await connection.execute(
        `UPDATE package
         SET package_status = ?,
             updated_by = ?
         WHERE package_id = ?`,
        [finalStatus, authId, packageId]
      );
    }

    // Create tracking event
    await connection.execute(
      `INSERT INTO tracking_event
       (package_id, location_id, event_type, event_time, created_by, updated_by)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [packageId, locationId, eventType, authId, authId]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: deliveryType === 'facility'
        ? 'Package delivered to facility successfully'
        : 'Package delivered to recipient successfully'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in confirmDeliveryController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
