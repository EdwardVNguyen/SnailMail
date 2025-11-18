import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Clerk approves a courier's package request
export const approveCourierRequestController = async (req, res) => {
  let requestId, authId;

  try {
    const body = await getJSONRequestBody(req);
    requestId = body.requestId;
    authId = body.authId;

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

    // Check if package is still available (package should not already have a courier)
    // Get facility's address_id for the tracking event
    const [[pkg]] = await connection.execute(
      `SELECT p.package_id, p.package_status, p.facility_id, p.courier_id, f.address_id AS facility_address_id
       FROM package p
       LEFT JOIN facility f ON p.facility_id = f.facility_id
       WHERE p.package_id = ?`,
      [request.package_id]
    );

    if (!pkg) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package not found' });
    }

    // Package should not already have a courier assigned
    if (pkg.courier_id !== null) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package already assigned to another courier' });
    }

    // Accept packages in 'processing' or 'out-for-delivery' status (clerk may have just created tracking event)
    if (pkg.package_status !== 'processing' && pkg.package_status !== 'out-for-delivery') {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package is no longer available for pickup' });
    }

    // Check courier's current package count before approving
    const [[{ package_count }]] = await connection.execute(
      `SELECT COUNT(*) as package_count
       FROM package
       WHERE courier_id = ?
       AND package_status NOT IN ('delivered', 'returned', 'lost', 'undeliverable')`,
      [request.courier_id]
    );

    if (package_count >= 5) {
      await connection.rollback();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Cannot approve request. Courier has reached the maximum limit of 5 packages.'
      }));
      return;
    }

    // 1. Update request status to approved
    await connection.execute(
      `UPDATE courier_package_request
       SET request_status = 'approved',
           reviewed_by = ?,
           review_date = NOW(),
           updated_by = ?
       WHERE request_id = ?`,
      [clerk.employee_id, authId, requestId]
    );

    // 2. Assign courier to package and set status to in-transit
    await connection.execute(
      `UPDATE package
       SET courier_id = ?,
           package_status = 'in-transit',
           updated_by = ?
       WHERE package_id = ?`,
      [request.courier_id, authId, request.package_id]
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

    // Check if error is from the courier package limit trigger
    if (error.sqlState === '45000' && error.message.includes('Courier cannot have more than 5 packages')) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Cannot approve request. Courier has reached the maximum limit of 5 packages.'
      }));
      return;
    }

    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
