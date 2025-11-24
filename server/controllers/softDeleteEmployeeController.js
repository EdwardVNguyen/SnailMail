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

    // Delete employee record
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

    // Check for foreign key constraint violation
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Cannot delete employee: they have packages or requests associated with them. Please reassign or complete them first.'
      }));
      return;
    }

    badServerRequest(res, 'Error deleting employee');
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};
