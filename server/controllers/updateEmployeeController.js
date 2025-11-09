import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

export const updateEmployeeController = async (req, res) => {
  let connection;

  try {
    const body = await parseRequestBody(req);
    let { employeeId, field, value, updatedBy } = body;

    // Convert undefined to null for SQL
    if (value === undefined || value === '') {
      value = null;
    }

    connection = await pool.getConnection();

    // Map frontend field names to database column names
    const fieldMap = {
      'employee_id': 'employee_id',
      'first_name': 'first_name',
      'middle_name': 'middle_name',
      'last_name': 'last_name',
      'account_type': 'account_type',
      'phone_number': 'phone_number',
      'salary': 'salary',
      'ethnicity': 'ethnicity',
      'employee_ssn': 'employee_ssn'
    };

    // Check if field is editable
    if (!fieldMap[field] && field !== 'email') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Field cannot be edited'
      }));
      return;
    }

    const dbField = fieldMap[field];

    // Special handling for email (need to update authentication table)
    if (field === 'email') {
      // Get auth_id for this employee
      const [employeeRows] = await connection.execute(
        'SELECT auth_id FROM employee WHERE employee_id = ?',
        [employeeId]
      );

      if (employeeRows.length === 0) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Employee not found'
        }));
        return;
      }

      const authId = employeeRows[0].auth_id;

      // Check if new email already exists
      const [emailCheck] = await connection.execute(
        'SELECT auth_id FROM authentication WHERE email = ? AND auth_id != ?',
        [value, authId]
      );

      if (emailCheck.length > 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Email already exists'
        }));
        return;
      }

      // Update authentication table
      await connection.execute(
        'UPDATE authentication SET email = ? WHERE auth_id = ?',
        [value, authId]
      );
    } else {
      // Update employee table
      const query = `UPDATE employee SET ${dbField} = ?, updated_by = ?, last_updated = CURRENT_TIMESTAMP WHERE employee_id = ?`;
      await connection.execute(query, [value, updatedBy, employeeId]);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Employee updated successfully'
    }));

  } catch (error) {
    console.error('Error in updateEmployeeController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
