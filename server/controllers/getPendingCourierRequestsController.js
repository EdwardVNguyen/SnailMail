import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

// Get pending courier package requests (for clerks to review)
export const getPendingCourierRequestsController = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Parse query parameters
    const queryObject = url.parse(req.url, true).query;
    const facilityId = queryObject.facility_id;
    const page = Number(queryObject.page) || 1;
    const limit = Number(queryObject.limit) || 10;
    const offset = (page - 1) * limit;

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM courier_package_request cpr
      JOIN package p ON cpr.package_id = p.package_id
      WHERE cpr.request_status = 'pending'
    `;

    let query = `
      SELECT
        cpr.request_id,
        cpr.request_status,
        cpr.request_date,

        -- Package info
        p.package_id,
        p.tracking_number,
        p.package_type,
        p.weight,
        p.package_status,

        -- Courier info
        e.employee_id AS courier_id,
        e.first_name AS courier_first_name,
        e.last_name AS courier_last_name,
        e.facility_id AS courier_facility_id,

        -- Recipient info
        rc.first_name AS recipient_first_name,
        rc.last_name AS recipient_last_name,
        ra.city_name AS recipient_city,
        ra.state_name AS recipient_state,

        -- Package facility
        f.facility_id AS package_facility_id,
        f.facility_name AS package_facility_name

      FROM courier_package_request cpr
      JOIN package p ON cpr.package_id = p.package_id
      JOIN employee e ON cpr.courier_id = e.employee_id
      JOIN customer rc ON p.recipient_id = rc.customer_id
      JOIN address ra ON rc.address_id = ra.address_id
      JOIN facility f ON p.facility_id = f.facility_id

      WHERE cpr.request_status = 'pending'
    `;

    const params = [];

    // Filter by facility if provided
    if (facilityId) {
      countQuery += ' AND p.facility_id = ?';
      query += ' AND p.facility_id = ?';
      params.push(facilityId);
    }

    // Get total count
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY cpr.request_date ASC';
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [requests] = await connection.execute(query, params);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      requests
    }));

  } catch (error) {
    console.error('Error in getPendingCourierRequestsController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
