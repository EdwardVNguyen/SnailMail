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

export const createPackageController = async (req, res) => {
  let senderFirstName,
      senderMiddleName,
      senderLastName,
      senderPhone,
      senderEmail,
      senderStreet,
      senderCity,
      senderState,
      senderZipCode,
      
      recipientFirstName, 
      recipientMiddleName,
      recipientLastName,
      recipientPhone,
      recipientEmail,
      recipientStreet,
      recipientCity,
      recipientState,
      recipientZipCode,

      packageType,
      weight,
      length,
      width,
      height;

  // Parse request body
  try {
    const body = await getJSONRequestBody(req);

    // sender information - derived from a customer relation
    senderFirstName = body.senderFirstName;
    senderMiddleName = body.senderMiddleName;
    senderLastName = body.senderLastName;
    senderPhone = body.senderPhone;
    senderEmail = body.senderEmail;
    senderStreet = body.senderStreet;
    senderCity = body.senderCity;
    senderState = body.senderState;
    senderZipCode = body.senderZipCode;
    
    // recipient information - derived from a customer relation
    recipientFirstName = body.recipientFirstName;
    recipientMiddleName = body.recipientMiddleName;
    recipientLastName = body.recipientLastName;
    recipientPhone = body.recipientPhone;
    recipientEmail = body.recipientEmail;
    recipientStreet = body.recipientStreet;
    recipientCity = body.recipientCity;
    recipientState = body.recipientState;
    recipientZipCode = body.recipientZipCode;

    // package type and dimensions
    packageType = body.packageType;
    weight = body.weight;
    length = body.length;
    width = body.width;
    height = body.height;

    // Validate required fields
    if (!senderFirstName || !senderLastName || !senderEmail || 
        !senderStreet || !senderCity || !senderState || !senderZipCode ||
        !recipientFirstName || !recipientLastName || !recipientEmail || !recipientStreet || 
        !recipientCity || !recipientState || !recipientZipCode || 
        !packageType || !weight) {
      return badClientRequest(res, { message: 'Missing required fields' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert sender address into address table
    // NOTE: created_by and updated_by is NULL for now, must create guest account then alter table to modify those attributes
    const [senderAddressResult] = await connection.execute(
      `INSERT INTO address (street_name, city_name, state_name, zip_code)
       VALUES (?, ?, ?, ?)`,
      [senderStreet, senderCity, senderState, senderZipCode]
    );
    const sender_address_id = senderAddressResult.insertId;

    // Insert sender as guest customer
    const [senderCustomerResult] = await connection.execute(
      `INSERT INTO customer (
        first_name, 
        middle_name, 
        last_name, 
        phone_number, 
        account_type, 
        address_id, 
        auth_id 
      ) VALUES (?, ?, ?, ?, 'guest', ?, NULL)`,
      [
        senderFirstName,
        toNullIfBlank(senderMiddleName),
        senderLastName,
        toNullIfBlank(senderPhone),
        sender_address_id
      ]
    );
    const sender_id = senderCustomerResult.insertId;

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
        middle_name, 
        last_name, 
        phone_number, 
        account_type, 
        address_id, 
        auth_id 
      ) VALUES (?, ?, ?, ?, 'guest', ?, NULL)`,
      [
        recipientFirstName,
        toNullIfBlank(recipientMiddleName),
        recipientLastName,
        toNullIfBlank(recipientPhone),
        recipient_address_id
      ]
    );
    const recipient_id = recipientCustomerResult.insertId;

    // Generate unique tracking number, makes sure there isn't an already existing tracking number
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
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'processing', ?, NULL, NULL)`, 
      [
        sender_id,
        recipient_id,
        packageType,
        weight,
        length,
        width,
        height,
        tracking_number
      ]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Package created successfully',
      tracking_number: tracking_number
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Create package error:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
