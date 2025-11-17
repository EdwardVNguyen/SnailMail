import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const addEmployeeController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);

    const {
      firstName,
      lastName,
      accountType,
      email,
      password,
      streetName,
      cityName,
      stateName,
      zipCode,
      salary,
      facilityId,
      createdBy
    } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if email already exists
    const [emailCheck] = await connection.execute(
      'SELECT auth_id FROM authentication WHERE email = ?',
      [email]
    );

    if (emailCheck.length > 0) {
      await connection.rollback();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Email already exists in the system'
      }));
      return;
    }

    // Generate a unique SSN (placeholder format: XXX-XX-XXXX)
    // Keep trying until we find a unique one
    let employeeSsn;
    let ssnIsUnique = false;
    let attempts = 0;
    while (!ssnIsUnique && attempts < 10) {
      // Generate random SSN
      const part1 = Math.floor(Math.random() * 900 + 100); // 100-999
      const part2 = Math.floor(Math.random() * 90 + 10);   // 10-99
      const part3 = Math.floor(Math.random() * 9000 + 1000); // 1000-9999
      employeeSsn = `${part1}-${part2}-${part3}`;

      // Check if SSN already exists
      const [ssnCheck] = await connection.execute(
        'SELECT employee_id FROM employee WHERE employee_ssn = ?',
        [employeeSsn]
      );

      if (ssnCheck.length === 0) {
        ssnIsUnique = true;
      }
      attempts++;
    }

    if (!ssnIsUnique) {
      await connection.rollback();
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Unable to generate unique SSN'
      }));
      return;
    }

    // Step 1: Create authentication record
    const [authResult] = await connection.execute(
      'INSERT INTO authentication (email, password) VALUES (?, ?)',
      [email, password]
    );
    const authId = authResult.insertId;

    // Step 2: Create address record
    const [addressResult] = await connection.execute(
      `INSERT INTO address (street_name, city_name, state_name, zip_code, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [streetName, cityName, stateName, zipCode, createdBy, createdBy]
    );
    const addressId = addressResult.insertId;

    // Step 3: Create employee record (employee_id is auto-generated)
    const [employeeResult] = await connection.execute(
      `INSERT INTO employee
       (first_name, last_name, account_type, address_id,
        salary, employee_ssn, auth_id, facility_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        accountType,
        addressId,
        salary,
        employeeSsn,
        authId,
        facilityId,
        createdBy,
        createdBy
      ]
    );
    const employeeId = employeeResult.insertId;

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Employee added successfully',
      employeeId: employeeId,
      authId: authId
    }));

  } catch (error) {
    console.error('Error in addEmployeeController:', error);
    if (connection) {
      await connection.rollback();
    }
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
