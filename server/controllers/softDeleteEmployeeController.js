import pool from '../config/database.js';
import { badServerRequest, badClientRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const softDeleteEmployeeController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
    const { employeeId, authId } = body;

    if (!employeeId) {
      return badClientRequest(res, 'Employee ID is required');
    }

    connection = await pool.getConnection();

    // Get the employee record and check if exists
    const [employeeRows] = await connection.query(
      `SELECT employee_id, first_name, last_name
       FROM employee
       WHERE employee_id = ?`,
      [employeeId]
    );

    if (employeeRows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Employee not found'
      }));
      return;
    }

    const employee = employeeRows[0];

    // Perform soft delete (BEFORE DELETE trigger will archive the record)
    const [result] = await connection.query(
      `DELETE FROM employee WHERE employee_id = ?`,
      [employeeId]
    );

    if (result.affectedRows === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to delete employee'
      }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Employee deleted successfully'
    }));
  }
  catch (error) {
    console.error('Error deleting employee:', error);
    badServerRequest(res, 'Error deleting employee');
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};
