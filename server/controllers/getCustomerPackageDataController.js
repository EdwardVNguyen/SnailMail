import pool from '../config/database.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { parse } from 'node:url'

export const getCustomerPackageDataController = async (req, res) => {
  const connection = await pool.getConnection(); 

  try {
    // Get authId from query or body (e.g. /getCustomerPackageData?authId=5)
    const url = parse(req.url, true);
    const authId = url.query.authId;
    const page = Number(url.query.page) || 1; // what page the user wants
    const limit = Number(url.query.limit) || 15; // how many items per page
    const offset = (page - 1) * limit; // how many items to skip in SQL

    if (!authId) {
      return badClientRequest(res, 'authId is required');
    }

    // Fetch total count (for knowing how many pages exist)
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) AS total FROM package p
       JOIN customer c ON p.sender_customer_id = c.customer_id
       WHERE c.auth_id = ?`,
      [authId]
    );

    const total = countResult[0].total;

    // Fetch paginated packages
    const [rows] = await connection.execute(
      `
      SELECT 
        p.package_id, p.sender_name, p.sender_email, p.sender_address_id,
        p.recipient_name, p.recipient_email, p.recipient_address_id,
        p.package_type, p.weight, p.length, p.width, p.height,
        p.package_status, p.created_at, p.last_updated
      FROM package p
      JOIN customer c ON p.sender_customer_id = c.customer_id
      WHERE c.auth_id = ?
      ORDER BY p.created_at DESC
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
