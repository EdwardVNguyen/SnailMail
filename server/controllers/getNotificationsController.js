import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getNotificationsController = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const authId = url.searchParams.get('authId');

  if (!authId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Missing authId' }));
    return;
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Get email directly from authentication table (works for all users)
    const [[user]] = await connection.execute(
      `SELECT email FROM authentication WHERE auth_id = ?`,
      [authId]
    );

    if (!user) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'User not found' }));
      return;
    }

    // Get notifications from email_queue where status is 'sent'
    const [notifications] = await connection.execute(
      `SELECT email_id, subject, body, created_at
       FROM email_queue
       WHERE recipient_email = ? AND status = 'sent'
       ORDER BY created_at DESC`,
      [user.email]
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      notifications: notifications
    }));

  } catch (error) {
    console.error('Get notifications error:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
