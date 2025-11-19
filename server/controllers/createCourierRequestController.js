import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Courier creates a request to pick up a package
export const createCourierRequestController = async (req, res) => {
  let packageId, authId;

  try {
    const body = await getJSONRequestBody(req);
    packageId = body.packageId;
    authId = body.authId;

    if (!packageId || !authId) {
      return badClientRequest(res, { message: 'Missing required fields' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get courier info and facility
    const [[courier]] = await connection.execute(
      `SELECT employee_id, facility_id, account_type
       FROM employee
       WHERE auth_id = ? AND account_type = 'courier'`,
      [authId]
    );

    if (!courier) {
      await connection.rollback();
      return badClientRequest(res, { message: 'User is not a courier' });
    }

    // Get package info
    const [[pkg]] = await connection.execute(
      `SELECT package_id, package_status, facility_id, courier_id
       FROM package
       WHERE package_id = ?`,
      [packageId]
    );

    if (!pkg) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package not found' });
    }

    // Verify package is at courier's facility
    if (pkg.facility_id !== courier.facility_id) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package is not at your facility' });
    }

    // Verify package is available (processing status and no courier assigned)
    if (pkg.package_status !== 'processing' || pkg.courier_id !== null) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package is not available for pickup' });
    }

    // Check if courier already has a pending request for this package
    const [[existingRequest]] = await connection.execute(
      `SELECT request_id
       FROM courier_package_request
       WHERE package_id = ? AND courier_id = ? AND request_status = 'pending'`,
      [packageId, courier.employee_id]
    );

    if (existingRequest) {
      await connection.rollback();
      return badClientRequest(res, { message: 'You already have a pending request for this package' });
    }

    // Create courier package request
    await connection.execute(
      `INSERT INTO courier_package_request
       (package_id, courier_id, request_status, request_date, created_by, updated_by)
       VALUES (?, ?, 'pending', NOW(), ?, ?)`,
      [packageId, courier.employee_id, authId, authId]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Package pickup request submitted successfully'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in createCourierRequestController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
