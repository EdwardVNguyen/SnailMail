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
      console.log(`Fetching notifications for customer ${customer.customer_id}`);
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

    // If not a customer, check if employee
    const [[employee]] = await connection.execute(
      `SELECT employee_id, account_type FROM employee WHERE auth_id = ?`,
      [authId]
    );

    if (employee) {
      if (employee.account_type === 'manager') {
        console.log(`Fetching notifications for manager ${employee.employee_id}`);
        const [notifications] = await connection.execute(
          `SELECT
            log_id as notification_id,
            manager_id,
            employee_name,
            package_number,
            type,
            is_read
          FROM packages_log
          WHERE manager_id = ? AND is_read = FALSE
          LIMIT 20`,
          [employee.employee_id]
        );

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          notifications: notifications,
          userType: 'employee'
        }));
        return;

      } else {
        // Clerk or Courier
        console.log(`User is ${employee.account_type}, no notifications needed`);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          notifications: [],
          userType: 'employee'
        }));
        return;
      }
    }

    // If neither customer nor employee
    console.warn(`No customer or employee found for authId: ${authId}`);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'User not found' }));

  } catch (error) {
    console.error('Get notifications error for authId', authId, ':', error);
    console.error('Error stack:', error.stack);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
