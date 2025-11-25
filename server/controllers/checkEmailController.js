import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Check if email already exists in authentication table
export const checkEmailController = async (req, res) => {
  let email;

  // Parse request body
  try {
    const body = await getJSONRequestBody(req);
    email = body.email;

    if (!email) {
      return badClientRequest(res, 'Email is required');
    }
  } catch (err) {
    return badClientRequest(res, err.message || 'Invalid JSON body');
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Check if email exists in authentication table
    const [authRows] = await connection.execute(
      `SELECT auth_id
       FROM authentication
       WHERE LOWER(email) = LOWER(?)`,
      [email]
    );

    // Respond with whether email exists
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      exists: authRows.length > 0
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
