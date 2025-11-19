import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { toNullIfBlank } from '../utils/toNullIfBlank.js';
import crypto from 'crypto'; // for safer encryption for tracking number

// Generate random alphanumeric tracking number 
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(12);                                        // will hold random bytes (0-255)
  crypto.getRandomValues(array);                                           // randomize function 
  return 'TRK' + Array.from(array, x => chars[x % chars.length]).join(''); // set tracking number by appendin 'TRK' with random char array
};

export const createShipmentController = async (req, res) => {
  let authId,

      recipientFirstName,
      recipientLastName,
      recipientEmail,
      recipientStreet,
      recipientCity,
      recipientState,
      recipientZipCode,

      packageType,
      weight,
      length,
      width,
      height,

      facility_id;

  // Parse request body
  try {
    const body = await getJSONRequestBody(req);
    authId = body.authId;

    recipientFirstName = body.recipientFirstName;
    recipientLastName = body.recipientLastName;
    recipientEmail = body.recipientEmail;
    recipientStreet = body.recipientStreet;
    recipientCity = body.recipientCity;
    recipientState = body.recipientState;
    recipientZipCode = body.recipientZipCode;

    packageType = body.packageType;
    weight = body.weight;
    length = body.length;
    width = body.width;
    height = body.height;

    facility_id = body.facility_id;

    // Validate required fields
    if (!authId || !recipientFirstName || !recipientLastName || !recipientEmail || !recipientStreet || 
        !recipientCity || !recipientState || !recipientZipCode || 
        !packageType || !weight || !facility_id) {
      return badClientRequest(res, { message: 'Missing required fields' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // get sender_id
    const [[{ customer_id: sender_id } = {}]] = await connection.execute(
      `SELECT customer_id FROM customer WHERE auth_id = ?`,
      [authId]
    );
    if (!sender_id) throw new Error('Sender not found');

    // Insert recipient address into address table
    const [recipientAddressResult] = await connection.execute(
      `INSERT INTO address (street_name, city_name, state_name, zip_code)
       VALUES (?, ?, ?, ?)`,
      [recipientStreet, recipientCity, recipientState, recipientZipCode]
    );
    const recipient_address_id = recipientAddressResult.insertId;

    // Insert recipient as guest customer
    const [recipientCustomerResult] = await connection.execute(
      `INSERT INTO customer (
        first_name,
        last_name,
        address_id,
        auth_id,
        account_type
      ) VALUES (?, ?, ?, NULL, 'guest')`,
      [
        recipientFirstName,
        recipientLastName,
        recipient_address_id
      ]
    );
    const recipient_id = recipientCustomerResult.insertId;

    // Generate unique tracking number
    let tracking_number;
    let is_unique = false;
    
    while (!is_unique) {
      tracking_number = generateTrackingNumber();
      const [existingTracking] = await connection.execute(
        `SELECT tracking_number FROM package WHERE tracking_number = ?`,
        [tracking_number]
      );
      if (existingTracking.length === 0) {
        is_unique = true;
      }
    }

    // Insert package into package table
    await connection.execute(
      `INSERT INTO package (
        sender_id,
        recipient_id,
        package_type,
        weight,
        length,
        width,
        height,
        package_status,
        tracking_number,
        created_by,
        updated_by,
        facility_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sender_id,
        recipient_id,
        packageType,
        weight,
        length,
        width,
        height,
        'processing',
        tracking_number,
        authId,
        authId,
        facility_id
      ]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Shipment created successfully',
      tracking_number: tracking_number
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Create shipment error:', error);

    // Check if error is from the dimension/weight validation triggers
    if (error.sqlState === '45000') {
      if (error.message.includes('Package too large: Exceeds length')) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Package too large: Exceeds length (100in)',
          errorType: 'dimension_length'
        }));
        return;
      } else if (error.message.includes('Package too large: Exceeds width or height')) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Package too large: Exceeds width or height (35in)',
          errorType: 'dimension_width_height'
        }));
        return;
      } else if (error.message.includes('Package too heavy')) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Package too heavy: Weight exceeds limit (100lbs)',
          errorType: 'weight'
        }));
        return;
      }
    }

    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
