import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Courier requests to claim a package (requires clerk approval)
export const requestPackageController = async (req, res) => {
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

    // Get courier_id from auth_id
    const [[courier]] = await connection.execute(
      `SELECT employee_id, account_type, facility_id
       FROM employee
       WHERE auth_id = ? AND account_type = 'courier'`,
      [authId]
    );

    if (!courier) {
      await connection.rollback();
      return badClientRequest(res, { message: 'User is not a courier' });
    }

    // Check if package exists and is available
    const [[pkg]] = await connection.execute(
      `SELECT package_id, package_status, facility_id
       FROM package
       WHERE package_id = ? AND package_status = 'processing'`,
      [packageId]
    );

    if (!pkg) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package not available' });
    }

    // Check if package is already assigned
    const [[existing]] = await connection.execute(
      `SELECT assignment_id FROM package_assignment WHERE package_id = ?`,
      [packageId]
    );

    if (existing) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Package already assigned' });
    }

    // Check if courier already has a pending request for this package
    const [[existingRequest]] = await connection.execute(
      `SELECT request_id FROM courier_package_request
       WHERE package_id = ? AND courier_id = ? AND request_status = 'pending'`,
      [packageId, courier.employee_id]
    );

    if (existingRequest) {
      await connection.rollback();
      return badClientRequest(res, { message: 'You already have a pending request for this package' });
    }

    // Create package request
    await connection.execute(
      `INSERT INTO courier_package_request
       (package_id, courier_id, request_status, created_by, updated_by)
       VALUES (?, ?, 'pending', ?, ?)`,
      [packageId, courier.employee_id, authId, authId]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Package request submitted. Waiting for clerk approval.'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in requestPackageController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
