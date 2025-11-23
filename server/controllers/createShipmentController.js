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

      facility_id,
      price;

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
    price = body.price;

    // Validate required fields
    if (!authId || !recipientFirstName || !recipientLastName || !recipientEmail || !recipientStreet ||
        !recipientCity || !recipientState || !recipientZipCode ||
        !packageType || !weight || !facility_id || !price) {
      return badClientRequest(res, { message: 'Missing required fields' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // get sender_id and validate payment information
    const [[customerData] = []] = await connection.execute(
      `SELECT customer_id, card_number, security_code, expiration_date FROM customer
       WHERE auth_id = ? AND (is_deleted = FALSE OR is_deleted IS NULL)`,
      [authId]
    );

    if (!customerData) throw new Error('Sender not found');
    const sender_id = customerData.customer_id;

    // Validate payment information - customer must have card on file
    const isEmpty = (value) => {
      if (value === null || value === undefined) return true;
      const stringValue = String(value).trim();
      return stringValue === '' || stringValue.length === 0;
    };

    const hasCardNumber = !isEmpty(customerData.card_number);
    const hasSecurityCode = !isEmpty(customerData.security_code);
    const hasExpirationDate = !isEmpty(customerData.expiration_date);

    // Build specific error message
    const missingFields = [];
    if (!hasCardNumber) missingFields.push('card number');
    if (!hasSecurityCode) missingFields.push('security code');
    if (!hasExpirationDate) missingFields.push('expiration date');

    if (missingFields.length > 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: `Payment information required. Please add your ${missingFields.join(', ')} to your profile before creating a shipment.`,
        errorType: 'missing_payment_info',
        missingFields: missingFields
      }));
      return;
    }

    // Additional validation: check card number has at least 13 digits
    const cardDigits = String(customerData.card_number).replace(/\D/g, '');
    if (cardDigits.length < 13) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid card number. Please update your payment information in your profile.',
        errorType: 'invalid_payment_info'
      }));
      return;
    }

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
        auth_id
      ) VALUES (?, ?, ?, NULL)`,
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
    const [packageResult] = await connection.execute(
      `INSERT INTO package (
        sender_id,
        recipient_id,
        recipient_email,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing', ?, ?, ?, ?)`,
      [
        sender_id,
        recipient_id,
        recipientEmail,
        packageType,
        weight,
        length || 0,
        width || 0,
        height || 0,
        tracking_number,
        authId,
        authId,
        facility_id
      ]
    );

    const package_id = packageResult.insertId;

    // Create transaction record
    await connection.execute(
      `INSERT INTO transaction (package_id, date_time, cost_fee)
       VALUES (?, NOW(), ?)`,
      [package_id, price]
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
