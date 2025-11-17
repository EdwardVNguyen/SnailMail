import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Clerk rejects a courier's package request
export const rejectCourierRequestController = async (req, res) => {
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

    // Update request status to rejected
    await connection.execute(
      `UPDATE courier_package_request
       SET request_status = 'rejected',
           reviewed_by = ?,
           review_date = NOW(),
           updated_by = ?
       WHERE request_id = ?`,
      [clerk.employee_id, authId, requestId]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Package request rejected'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in rejectCourierRequestController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
