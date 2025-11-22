import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

export const markNotificationReadController = async (req, res) => {
  let emailId;

  try {
    const body = await getJSONRequestBody(req);
    emailId = body.emailId;

    if (!emailId) {
      return badClientRequest(res, { message: 'Missing emailId' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Update status to 'failed' to mark as read/dismissed
    await connection.execute(
      `UPDATE email_queue SET status = 'failed' WHERE email_id = ?`,
      [emailId]
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Notification marked as read'
    }));

  } catch (error) {
    console.error('Mark notification read error:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
