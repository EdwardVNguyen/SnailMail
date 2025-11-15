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

    let query = `
      SELECT
        e.employee_id,
        e.first_name,
        e.middle_name,
        e.last_name,
        e.account_type,
        e.salary,
        e.employee_ssn,
        e.facility_id,
        f.facility_name,
        a.email,
        addr.street_name,
        addr.city_name,
        addr.state_name,
        addr.zip_code
      FROM employee e
      JOIN authentication a ON e.auth_id = a.auth_id
      JOIN address addr ON e.address_id = addr.address_id
      JOIN facility f ON e.facility_id = f.facility_id
    `;

    let params = [];
    let conditions = [];

    if (role && role !== 'all') {
      conditions.push('e.account_type = ?');
      params.push(role);
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
