import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

export const updateAccountTypeController = async (req, res) => {
  let authId, accountType;

  // Parse request body
  try {
    const body = await getJSONRequestBody(req);
    authId = body.authId;
    accountType = body.accountType;

    if (!authId || !accountType) {
      return badClientRequest(res, { message: 'Authentication ID and account type are required' });
    }

    // Validate account type
    const validTypes = ['individual', 'business', 'prime'];
    if (!validTypes.includes(accountType)) {
      return badClientRequest(res, { message: 'Invalid account type' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Update customer account type
    const [result] = await connection.execute(
      `UPDATE customer 
       SET account_type = ?,
           updated_by = ?,
           last_updated = CURRENT_TIMESTAMP
       WHERE auth_id = ?`,
      [accountType, authId, authId]
    );

    if (result.affectedRows === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Customer not found'
      }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Account type updated successfully'
    }));

  } catch (error) {
    console.error('Update account type error:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};