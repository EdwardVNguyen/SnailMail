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
    badServerRequest(res, 'Error deleting employee');
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};
