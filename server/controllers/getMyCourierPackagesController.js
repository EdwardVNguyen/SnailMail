import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const getMyCourierPackagesController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { authId } = body;

    connection = await pool.getConnection();

    // Get courier's employee_id from auth_id
    const [courierRows] = await connection.execute(
      'SELECT employee_id FROM employee WHERE auth_id = ?',
      [authId]
    );

    if (courierRows.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Courier not found' }));
      return;
    }

    const courierId = courierRows[0].employee_id;

    // Get packages assigned to this courier that are in transit or out for delivery
    const query = `
      SELECT
        p.package_id,
        p.tracking_number,
        p.package_status,
        p.weight,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        recipient_addr.street_name as recipient_street,
        recipient_addr.city_name as recipient_city,
        recipient_addr.state_name as recipient_state
      FROM package p
      LEFT JOIN customer sender ON p.sender_id = sender.customer_id
      LEFT JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN address recipient_addr ON recipient.address_id = recipient_addr.address_id
      WHERE p.courier_id = ?
      AND p.package_status IN ('in-transit', 'out-for-delivery')
      ORDER BY p.created_at DESC
    `;

    const [packages] = await connection.execute(query, [courierId]);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, packages }));
  }
  catch (error) {
    console.error('Error fetching courier packages:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
