import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getNextEmployeeIdController = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Get the maximum employee_id
    const [rows] = await connection.execute(
      'SELECT MAX(employee_id) as max_id FROM employee'
    );

    const nextEmployeeId = (rows[0].max_id || 0) + 1;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, nextEmployeeId }));

  } catch (error) {
    console.error('Error in getNextEmployeeIdController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
