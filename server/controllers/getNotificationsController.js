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

    // check if user is a customer
    const [[customer]] = await connection.execute(
      `SELECT customer_id FROM customer WHERE auth_id = ?`,
      [authId]
    );
    if (customer) {
      const [notifications] = await connection.execute(
        `SELECT 
          notification_id,
          notification_type,
          tracking_number,
          message,
          package_status,
          is_read,
          created_at,
          read_at
         FROM customer_notifications
         WHERE customer_id = ? AND is_read = FALSE
         ORDER BY created_at DESC
         LIMIT 20`,
        [customer.customer_id]
      );

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        notifications: notifications,
        userType: 'customer'
      }));
      return;
    }

    // If not a customer, check if employee JUAN HERE ----------------
    const [[employee]] = await connection.execute(
      `SELECT email FROM employee e
       JOIN authentication a ON e.auth_id = a.auth_id
       WHERE e.auth_id = ?`,
      [authId]
    );

    if (employee) {
      // This is an employee - get from email_queue table
      const [notifications] = await connection.execute(
        `SELECT email_id as notification_id, subject, body, created_at
         FROM email_queue
         WHERE recipient_email = ? AND status = 'sent'
         ORDER BY created_at DESC
         LIMIT 20`,
        [employee.email]
      );

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        notifications: notifications,
        userType: 'employee'
      }));
      return;
    }

    // User not found
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'User not found' }));

  } catch (error) {
    console.error('Get notifications error:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
