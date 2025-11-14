import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

// Get packages assigned to the logged-in courier
export const getMyCourierPackagesController = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Parse query parameters to get authId
    const queryObject = url.parse(req.url, true).query;
    const authId = queryObject.authId;

    if (!authId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Missing authId parameter'
      }));
      return;
    }

    // Get courier_id from auth_id
    const [[courier]] = await connection.execute(
      `SELECT employee_id FROM employee WHERE auth_id = ? AND account_type = 'courier'`,
      [authId]
    );

    if (!courier) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'User is not a courier'
      }));
      return;
    }

    const query = `
      SELECT
        p.package_id,
        p.tracking_number,
        p.package_type,
        p.weight,
        p.package_status,

        -- Recipient info
        rc.first_name AS recipient_first_name,
        rc.last_name AS recipient_last_name,
        ra.street_name AS recipient_street,
        ra.city_name AS recipient_city,
        ra.state_name AS recipient_state,
        ra.zip_code AS recipient_zip,

        -- Assignment info
        pa.assignment_id,
        pa.assigned_date,
        pa.delivery_status,
        pa.destination_type,
        pa.notes,

        -- Destination facility (if going to facility)
        df.facility_name AS destination_facility_name,
        dfa.city_name AS destination_facility_city,
        dfa.state_name AS destination_facility_state

      FROM package_assignment pa
      JOIN package p ON pa.package_id = p.package_id
      JOIN customer rc ON p.recipient_id = rc.customer_id
      JOIN address ra ON rc.address_id = ra.address_id
      LEFT JOIN facility df ON pa.destination_facility_id = df.facility_id
      LEFT JOIN address dfa ON df.address_id = dfa.address_id

      WHERE pa.courier_id = ?
      AND pa.delivery_status NOT IN ('delivered', 'failed')

      ORDER BY pa.assigned_date DESC
    `;

    const [packages] = await connection.execute(query, [courier.employee_id]);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      packages
    }));

  } catch (error) {
    console.error('Error in getMyCourierPackagesController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
