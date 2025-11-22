import pool from '../config/database.js';
import { parse } from 'url';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Get employee_id from auth_id
export const getEmployeeIdController = async (req, res) => {
  const url = parse(req.url, true);
  const authId = url.query.authId;

  if (!authId) {
    return badClientRequest(res, 'authId query parameter is required');
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const [employeeRows] = await connection.execute(
      `SELECT
        e.employee_id,
        e.facility_id,
        e.account_type,
        f.address_id AS facility_address_id,
        f.facility_name
       FROM employee e
       LEFT JOIN facility f ON e.facility_id = f.facility_id
       WHERE e.auth_id = ?`,
      [authId]
    );

    if (employeeRows.length === 0) {
      return badClientRequest(res, 'Employee not found for this auth_id');
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      employee: employeeRows[0]
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
