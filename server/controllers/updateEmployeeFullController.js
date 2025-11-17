import pool from '../config/database.js';
import { badServerRequest, badClientRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const updateEmployeeFullController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
    const {
      employeeId,
      firstName,
      lastName,
      accountType,
      email,
      streetName,
      cityName,
      stateName,
      zipCode,
      salary,
      facilityId,
      updatedBy
    } = body;

    // Validate required fields
    if (!employeeId || !firstName || !lastName || !accountType || !email ||
        !streetName || !cityName || !stateName || !zipCode || !salary ||
        !facilityId || !updatedBy) {
      return badClientRequest(res, 'Missing required fields');
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get employee's current data
    const [employeeRows] = await connection.execute(
      'SELECT auth_id, address_id FROM employee WHERE employee_id = ?',
      [employeeId]
    );

    if (employeeRows.length === 0) {
      await connection.rollback();
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Employee not found'
      }));
      return;
    }

    const authId = employeeRows[0].auth_id;
    const addressId = employeeRows[0].address_id;

    // Check if new email already exists (if changed)
    const [emailCheck] = await connection.execute(
      'SELECT auth_id FROM authentication WHERE email = ? AND auth_id != ?',
      [email, authId]
    );

    if (emailCheck.length > 0) {
      await connection.rollback();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Email already exists'
      }));
      return;
    }

    // Update authentication table (email)
    await connection.execute(
      'UPDATE authentication SET email = ?, last_updated = CURRENT_TIMESTAMP WHERE auth_id = ?',
      [email, authId]
    );

    // Update address
    await connection.execute(
      `UPDATE address
       SET street_name = ?, city_name = ?, state_name = ?, zip_code = ?,
           updated_by = ?, last_updated = CURRENT_TIMESTAMP
       WHERE address_id = ?`,
      [streetName, cityName, stateName, zipCode, updatedBy, addressId]
    );

    // Update employee table
    await connection.execute(
      `UPDATE employee
       SET first_name = ?, last_name = ?, account_type = ?,
           salary = ?, facility_id = ?,
           updated_by = ?, last_updated = CURRENT_TIMESTAMP
       WHERE employee_id = ?`,
      [
        firstName,
        lastName,
        accountType,
        salary,
        facilityId,
        updatedBy,
        employeeId
      ]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Employee updated successfully'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in updateEmployeeFullController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
