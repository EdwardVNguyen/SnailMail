import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

export const markNotificationReadController = async (req, res) => {
  let notificationId, userType;

  try {
    const body = await getJSONRequestBody(req);
    notificationId = body.notificationId;
    userType = body.userType; // 'customer' or 'employee'

    if (!notificationId) {
      return badClientRequest(res, { message: 'Missing notificationId' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();

    if (userType === 'customer') {
      // Mark customer notification as read
      await connection.execute(
        `UPDATE customer_notifications 
         SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
         WHERE notification_id = ?`,
        [notificationId]
      );
    } 
    // JUAN HERE ----------------
    else if (userType === 'employee') {
      // Mark employee notification as dismissed (set status to 'failed')
      await connection.execute(
        `UPDATE email_queue SET status = 'failed' WHERE email_id = ?`,
        [notificationId]
      );
    } else {
      return badClientRequest(res, { message: 'Invalid userType' });
    }

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
