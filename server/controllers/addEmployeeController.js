import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

export const addEmployeeController = async (req, res) => {
  let connection;

  try {
    const body = await parseRequestBody(req);

    const {
      employeeId,
      firstName,
      middleName,
      lastName,
      accountType,
      email,
      password,
      streetName,
      cityName,
      stateName,
      zipCode,
      phoneNumber,
      birthDate,
      salary,
      ethnicity,
      employeeSsn,
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

    // Check if SSN already exists
    const [ssnCheck] = await connection.execute(
      'SELECT employee_id FROM employee WHERE employee_ssn = ?',
      [employeeSsn]
    );

    if (ssnCheck.length > 0) {
      await connection.rollback();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'SSN already exists in the system'
      }));
      return;
    }

    // Check if employee_id already exists (if user provided custom ID)
    const [idCheck] = await connection.execute(
      'SELECT employee_id FROM employee WHERE employee_id = ?',
      [employeeId]
    );

    if (idCheck.length > 0) {
      await connection.rollback();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Employee ID already exists. Please use a different ID.'
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

    // Step 3: Create employee record with specified employee_id
    await connection.execute(
      `INSERT INTO employee
       (employee_id, first_name, middle_name, last_name, account_type, address_id,
        phone_number, birth_date, salary, ethnicity, employee_ssn, auth_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        firstName,
        middleName,
        lastName,
        accountType,
        addressId,
        phoneNumber,
        birthDate,
        salary,
        ethnicity,
        employeeSsn,
        authId,
        createdBy,
        createdBy
      ]
    );

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
