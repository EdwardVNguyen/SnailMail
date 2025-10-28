import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const checkEmployeeUniquenessController = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Parse query parameters
    const queryObject = url.parse(req.url, true).query;
    const field = queryObject.field;
    const value = queryObject.value;
    const currentId = queryObject.currentId;

    let query;
    let params;

    if (field === 'employee_id') {
      // Check if employee_id exists (excluding current employee)
      query = 'SELECT employee_id FROM employee WHERE employee_id = ? AND employee_id != ?';
      params = [value, currentId];
    } else if (field === 'employee_ssn') {
      // Check if SSN exists (excluding current employee)
      query = 'SELECT employee_id FROM employee WHERE employee_ssn = ? AND employee_id != ?';
      params = [value, currentId];
    } else {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid field for uniqueness check'
      }));
      return;
    }

    const [rows] = await connection.execute(query, params);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      isUnique: rows.length === 0
    }));

  } catch (error) {
    console.error('Error in checkEmployeeUniquenessController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
