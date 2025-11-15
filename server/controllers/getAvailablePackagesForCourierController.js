import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getAvailablePackagesForCourierController = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get packages that are 'processing' at facilities and not assigned to any courier
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
        recipient_addr.state_name as recipient_state,
        f.facility_name,
        f.facility_id
      FROM package p
      LEFT JOIN customer sender ON p.sender_id = sender.customer_id
      LEFT JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN address recipient_addr ON recipient.customer_id = recipient_addr.customer_id
      LEFT JOIN facility f ON p.current_location = f.facility_id
      WHERE p.package_status = 'processing'
      AND p.courier_id IS NULL
      ORDER BY p.created_at DESC
    `;

    const [packages] = await connection.execute(query);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, packages }));
  }
  catch (error) {
    console.error('Error fetching available packages:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
