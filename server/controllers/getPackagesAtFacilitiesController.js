import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getPackagesAtFacilitiesController = async (req, res) => {
  let connection;
  try {
    const queryObject = url.parse(req.url, true).query;
    const facilityId = queryObject.facilityId;

    connection = await pool.getConnection();

    let query = `
      SELECT
        p.package_id,
        p.tracking_number,
        p.package_status,
        p.weight,
        p.created_at,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        f.facility_name,
        f.facility_id,
        CONCAT(courier.first_name, ' ', courier.last_name) as courier_name
      FROM package p
      LEFT JOIN customer sender ON p.sender_id = sender.customer_id
      LEFT JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN facility f ON p.current_location = f.facility_id
      LEFT JOIN employee courier ON p.courier_id = courier.employee_id
      WHERE 1=1
    `;

    const params = [];

    if (facilityId) {
      query += ' AND p.current_location = ?';
      params.push(facilityId);
    }

    query += ' ORDER BY p.created_at DESC';

    const [packages] = await connection.execute(query, params);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, packages }));
  }
  catch (error) {
    console.error('Error fetching packages at facilities:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
