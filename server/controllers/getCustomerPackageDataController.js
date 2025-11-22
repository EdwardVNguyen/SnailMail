import pool from '../config/database.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { parse } from 'node:url'

export const getCustomerPackageDataController = async (req, res) => {
  const connection = await pool.getConnection(); 

  try {
    // Get authId from query or body (e.g. /getCustomerPackageData?authId=5)
    const url = parse(req.url, true);
    const authId = url.query.authId;
    const page = Number(url.query.page) || 1;    // what page the user wants
    const limit = Number(url.query.limit) || 15; // how many items per page
    const offset = (page - 1) * limit;           // how many items to skip in SQL

    if (!authId) {
      return badClientRequest(res, 'authId is required');
    }

    // Fetch total count (for knowing how many pages exist)
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) AS total FROM package p
       JOIN customer c ON p.sender_id = c.customer_id
       WHERE c.auth_id = ?`,
      [authId]
    );

    const total = countResult[0].total;

    // Fetch paginated packages
    const [rows] = await connection.execute(
      `
      SELECT
        p.package_id,
        p.tracking_number,
        p.package_type,
        p.weight,
        p.length,
        p.width,
        p.height,
        p.package_status,
        p.created_at,
        p.last_updated,

        r.first_name,
        r.last_name,

        ra.street_name,
        ra.city_name,
        ra.state_name,
        ra.zip_code,

        (SELECT MAX(te.event_time)
         FROM tracking_event te
         WHERE te.package_id = p.package_id) as last_tracking_event_time
      FROM package p
      INNER JOIN customer s on p.sender_id = s.customer_id
      INNER JOIN customer r ON p.recipient_id = r.customer_id
      INNER JOIN address ra ON r.address_id = ra.address_id
      WHERE s.auth_id = ?
      ORDER BY last_tracking_event_time DESC, p.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
      `,
      [authId]
    );

    // return empty array if no packages are found
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      packages: rows,
    })
  );

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
}
