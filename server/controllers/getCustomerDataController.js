import pool from '../config/database.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { parse } from 'node:url'

export const getCustomerDataController = async (req, res) => {
  const connection = await pool.getConnection(); 

  try {
    // Get authId from query or body
    const url = parse(req.url, true);
    const authId = url.query.authId;

    if (!authId) {
      return badClientRequest(res, 'authId is required');
    }

    // SQL to get customer info, address, and authentication info
    const sql = `
      SELECT 
        c.first_name, c.middle_name, c.last_name, c.address_id, c.phone_number,
        c.auth_id, c.account_type, c.birth_date, c.customer_id,
        a.street_name, a.city_name, a.state_name, a.zip_code,
        au.email, au.password
      FROM customer c
      LEFT JOIN address a ON c.address_id = a.address_id
      LEFT JOIN authentication au ON c.auth_id = au.auth_id
      WHERE c.auth_id = ?
    `;

    const [rows] = await connection.execute(sql, [authId]);

    if (rows.length === 0) {
      return badClientRequest(res, 'Customer not found');
    }

    // Return the first (and only) row
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      customer: rows[0]
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
};
