import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Clerk approves a courier's package request
export const approveCourierRequestController = async (req, res) => {
  let requestId, authId, destinationType, destinationFacilityId;

  try {
    const body = await getJSONRequestBody(req);
    requestId = body.requestId;
    authId = body.authId;
    destinationType = body.destinationType || 'recipient_address';
    destinationFacilityId = body.destinationFacilityId || null;

    if (!requestId || !authId) {
      return badClientRequest(res, { message: 'Missing required fields' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get clerk info
    const [[clerk]] = await connection.execute(
      `SELECT employee_id, account_type
       FROM employee
       WHERE auth_id = ? AND account_type = 'clerk'`,
      [authId]
    );

    if (!clerk) {
      await connection.rollback();
      return badClientRequest(res, { message: 'User is not a clerk' });
    }

    // Get request details
    const [[request]] = await connection.execute(
      `SELECT request_id, package_id, courier_id, request_status
       FROM courier_package_request
       WHERE request_id = ?`,
      [requestId]
    );

    if (!request) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Request not found' });
    }

    if (request.request_status !== 'pending') {
      await connection.rollback();
      return badClientRequest(res, { message: 'Request already processed' });
    }

    // Check if package is still available
    const [[pkg]] = await connection.execute(
      `SELECT package_id, package_status FROM package WHERE package_id = ?`,
      [request.package_id]
    );

    if (!pkg || pkg.package_status !== 'processing') {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package is no longer available' });
    }

    // Update request status
    await connection.execute(
      `UPDATE courier_package_request
       SET request_status = 'approved',
           reviewed_by = ?,
           review_date = NOW(),
           updated_by = ?
       WHERE request_id = ?`,
      [clerk.employee_id, authId, requestId]
    );

    // Create package assignment
    await connection.execute(
      `INSERT INTO package_assignment
       (package_id, courier_id, assigned_by, destination_type, destination_facility_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [request.package_id, request.courier_id, clerk.employee_id, destinationType, destinationFacilityId, authId, authId]
    );

    // Update package status
    await connection.execute(
      `UPDATE package
       SET package_status = 'pre-shipment',
           updated_by = ?
       WHERE package_id = ?`,
      [authId, request.package_id]
    );

    // Create notification for courier
    await connection.execute(
      `INSERT INTO courier_notification
       (courier_id, notification_type, package_id, message, created_by, updated_by)
       VALUES (?, 'request_approved', ?, ?, ?, ?)`,
      [
        request.courier_id,
        request.package_id,
        'Your request to deliver this package has been approved!',
        authId,
        authId
      ]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Package request approved and assigned to courier'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in approveCourierRequestController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
