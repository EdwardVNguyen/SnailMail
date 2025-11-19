import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

// Get packages available for couriers to request
// Packages must be in 'processing' status and not already assigned to a courier
export const getAvailablePackagesController = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Parse query parameters to optionally filter by facility
    const queryObject = url.parse(req.url, true).query;
    const facilityId = queryObject.facility_id;

    let query = `
      SELECT
        p.package_id,
        p.tracking_number,
        p.package_type,
        p.weight,
        p.package_status,
        p.created_at,

        -- Sender info
        sc.first_name AS sender_first_name,
        sc.last_name AS sender_last_name,
        sa.street_name AS sender_street,
        sa.city_name AS sender_city,
        sa.state_name AS sender_state,
        sa.zip_code AS sender_zip,

        -- Recipient info
        rc.first_name AS recipient_first_name,
        rc.last_name AS recipient_last_name,
        ra.street_name AS recipient_street,
        ra.city_name AS recipient_city,
        ra.state_name AS recipient_state,
        ra.zip_code AS recipient_zip,

        -- Facility info
        f.facility_id,
        f.facility_name,
        fa.city_name AS facility_city,
        fa.state_name AS facility_state

      FROM package p

      -- Sender joins
      JOIN customer sc ON p.sender_id = sc.customer_id
      JOIN address sa ON sc.address_id = sa.address_id

      -- Recipient joins
      JOIN customer rc ON p.recipient_id = rc.customer_id
      JOIN address ra ON rc.address_id = ra.address_id

      -- Facility joins
      JOIN facility f ON p.facility_id = f.facility_id
      JOIN address fa ON f.address_id = fa.address_id

      -- Exclude packages already assigned to couriers
      LEFT JOIN package_assignment pa ON p.package_id = pa.package_id

      WHERE p.package_status = 'processing'
      AND pa.assignment_id IS NULL
    `;

    const params = [];

    // Filter by facility if provided
    if (facilityId) {
      query += ' AND p.facility_id = ?';
      params.push(facilityId);
    }

    query += ' ORDER BY p.created_at ASC';

    const [packages] = await connection.execute(query, params);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      packages
    }));

  } catch (error) {
    console.error('Error in getAvailablePackagesController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
