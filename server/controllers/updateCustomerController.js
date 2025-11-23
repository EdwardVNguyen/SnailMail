import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { toNullIfBlank } from '../utils/toNullIfBlank.js';

export const updateCustomerController = async (req, res) => {
  let authId,
      firstName,
      lastName,
      streetName,
      cityName,
      stateName,
      zipCode;

  try {
    const body = await getJSONRequestBody(req);
    authId = body.authId;
    firstName = body.firstName;
    lastName = body.lastName;
    streetName = body.streetName;
    cityName = body.cityName;
    stateName = body.stateName;
    zipCode = body.zipCode;

    if (!authId || !firstName || !lastName || !streetName || !cityName || !stateName || !zipCode) {
      return badClientRequest(res, { message: 'Missing required fields' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [customerRows] = await connection.execute(
      `SELECT address_id, customer_id FROM customer
       WHERE auth_id = ?`,
      [authId]
    );
    if (customerRows.length === 0) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Customer not found' });
    }
    const address_id = customerRows[0].address_id;
    const customer_id = customerRows[0].customer_id;

    await connection.execute(
      `UPDATE customer
       SET first_name = ?,
           last_name = ?,
           updated_by = ?,
           last_updated = CURRENT_TIMESTAMP
       WHERE auth_id = ?`,
      [firstName, lastName, authId, authId]
    );

    await connection.execute(
      `UPDATE address 
       SET street_name = ?, 
           city_name = ?, 
           state_name = ?, 
           zip_code = ?,
           updated_by = ?
       WHERE address_id = ?`,
      [streetName, cityName, stateName, zipCode, authId, address_id]
    );
    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Customer information updated successfully'
    }));
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Update customer error:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};