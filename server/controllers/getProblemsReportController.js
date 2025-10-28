import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getProblemsReportController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Get packages with problem statuses
    const sql = `
      SELECT
        p.package_id,
        p.recipient_name,
        p.package_status,
        p.package_type,
        p.weight,
        p.created_at,
        p.last_updated,
        CONCAT(sa.street_name, ', ', sa.city_name, ', ', sa.state_name, ' ', sa.zip_code) as sender_address,
        CONCAT(ra.street_name, ', ', ra.city_name, ', ', ra.state_name, ' ', ra.zip_code) as recipient_address,
        DATEDIFF(NOW(), p.created_at) as days_since_creation
      FROM package p
      LEFT JOIN address sa ON p.sender_address_id = sa.address_id
      LEFT JOIN address ra ON p.recipient_address_id = ra.address_id
      WHERE p.package_status IN ('Returned', 'Undeliverable', 'Failed Delivery', 'Lost', 'Damaged')
      ORDER BY p.last_updated DESC
    `;

    const [rows] = await connection.execute(sql);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      packages: rows,
      count: rows.length
    }));

  }
  catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  }
  finally {
    connection.release();
  }
};
