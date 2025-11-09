import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getEmployeesController = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Parse query parameters
    const queryObject = url.parse(req.url, true).query;
    const role = queryObject.role;
    const status = queryObject.status;

    let query = `
      SELECT
        e.employee_id,
        e.first_name,
        e.middle_name,
        e.last_name,
        e.account_type,
        e.phone_number,
        e.birth_date,
        e.salary,
        e.ethnicity,
        e.employee_ssn,
        a.email
      FROM employee e
      JOIN authentication a ON e.auth_id = a.auth_id
    `;

    let params = [];
    let conditions = [];

    if (role && role !== 'all') {
      conditions.push('e.account_type = ?');
      params.push(role);
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        conditions.push('e.account_type != ?');
        params.push('archived');
      } else if (status === 'archived') {
        conditions.push('e.account_type = ?');
        params.push('archived');
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.employee_id ASC';

    const [employees] = await connection.execute(query, params);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, employees }));

  } catch (error) {
    console.error('Error in getEmployeesController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
