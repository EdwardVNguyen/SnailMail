import pool from '../config/database.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { parse } from 'node:url'

export const getEmployeeDataController = async (req, res) => {
  const connection = await pool.getConnection(); 

  try {
    // Get authId from query or body
    const url = parse(req.url, true);
    const authId = url.query.authId;

    if (!authId) {
      return badClientRequest(res, 'authId is required');
    }

    // SQL to get employee info, address, and authentication info
    const sql = `
      SELECT
        e.first_name, e.last_name, e.address_id,
        e.auth_id, e.account_type, e.employee_id, e.employee_ssn, e.salary, e.profile_picture_url,
        a.street_name, a.city_name, a.state_name, a.zip_code,
        au.email, au.password
      FROM employee e
      LEFT JOIN address a ON e.address_id = a.address_id
      LEFT JOIN authentication au ON e.auth_id = au.auth_id
      WHERE e.auth_id = ?
    `;

    const [rows] = await connection.execute(sql, [authId]);

    if (rows.length === 0) {
      return badClientRequest(res, 'Employee not found');
    }

    // Return the first (and only) row
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      employee: rows[0]
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
};
