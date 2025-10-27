import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Functionality for user login (customer, manager, employee)
export const loginController = async (req, res) => {
  let email, password;

  // Parse request body
  try {
    const body = await getJSONRequestBody(req);
    email = body.email;
    password = body.password;

    if (!email || !password) {
      return badClientRequest(res, 'Email and password are required');
    }
  } catch (err) {
    return badClientRequest(res, err.message || 'Invalid JSON body');
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Find auth_id for the given email and password
    const [authRows] = await connection.execute(
      `SELECT auth_id 
       FROM authentication
       WHERE LOWER(email) = LOWER(?) AND password = ?`,
      [email, password]
    );

    if (authRows.length === 0) {
      return badClientRequest(res, 'Invalid email or password');
    }

    const authId = authRows[0].auth_id;

    // Find account_type from employee or customer tables
    let accountType = null;

    const [customerRows] = await connection.execute(
      `SELECT account_type FROM customer WHERE auth_id = ?`,
      [authId]
    );

    // check if auth_id exists in customer relation
    if (customerRows.length > 0) {
      accountType = customerRows[0].account_type;
    } 
    // check if auth_id exists in employee relation
    else {
      const [employeeRows] = await connection.execute(
        `SELECT account_type FROM employee WHERE auth_id = ?`,
        [authId]
      );

      if (employeeRows.length > 0) {
        accountType = employeeRows[0].account_type;
      }
    } 
    
    if (!accountType) {
      return badServerRequest(res, 'Account type not found');
    }

    // Respond with success
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Login success',
      account_type: accountType,
      auth_id: authId
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
