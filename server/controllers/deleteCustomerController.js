import pool from '../config/database.js';
import { badServerRequest, badClientRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const deleteCustomerController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
    const { authId } = body;

    if (!authId) {
      return badClientRequest(res, 'Authentication ID is required');
    }

    connection = await pool.getConnection();

    // First, verify that the authId belongs to a customer (not an employee)
    const [employeeCheck] = await connection.query(
      'SELECT employee_id FROM employee WHERE auth_id = ?',
      [authId]
    );

    if (employeeCheck.length > 0) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Employees cannot delete their accounts through this endpoint'
      }));
      return;
    }

    // Get the customer record and check if it exists
    const [customerRows] = await connection.query(
      `SELECT customer_id
       FROM customer
       WHERE auth_id = ?`,
      [authId]
    );

    if (customerRows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Customer not found'
      }));
      return;
    }

    const customer = customerRows[0];

    // Perform soft delete (BEFORE DELETE trigger will archive the record)
    const [result] = await connection.query(
      `DELETE FROM customer WHERE customer_id = ?`,
      [customer.customer_id]
    );

    if (result.affectedRows === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to delete account'
      }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Account deleted successfully'
    }));
  }
  catch (error) {
    console.error('Error deleting customer account:', error);
    badServerRequest(res, 'Error deleting account');
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};
