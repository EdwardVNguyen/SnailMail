import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const deleteEmployeeController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
    const { employeeId, deletedBy } = body;

    if (!employeeId) {
      return badServerRequest(res, 'Employee ID is required');
    }

    connection = await pool.getConnection();

    // Delete employee (hard delete)
    const sql = 'DELETE FROM employee WHERE employee_id = ?';
    const [result] = await connection.query(sql, [employeeId]);

    if (result.affectedRows === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Employee not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Employee deleted successfully' }));
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
