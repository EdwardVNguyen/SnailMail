import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { toNullIfBlank } from '../utils/toNullIfBlank.js';

// Generate random alphanumeric tracking number
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let tracking_number = 'TRK';
  for (let i = 0; i < 12; i++) {
    tracking_number += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return tracking_number;
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
      recipientName,
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
    senderFirstName = body.senderFirstName;
    senderMiddleName = body.senderMiddleName;
    senderLastName = body.senderLastName;
    senderPhone = body.senderPhone;
    senderEmail = body.senderEmail;
    senderStreet = body.senderStreet;
    senderCity = body.senderCity;
    senderState = body.senderState;
    senderZipCode = body.senderZipCode;
    recipientName = body.recipientName;
    recipientPhone = body.recipientPhone;
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

    // Validate required fields
    if (!senderFirstName || !senderLastName || !senderEmail || 
        !senderStreet || !senderCity || !senderState || !senderZipCode ||
        !recipientName || !recipientEmail || !recipientStreet || 
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
    const [senderAddressResult] = await connection.execute(
      `INSERT INTO address (street_name, city_name, state_name, zip_code, created_by, updated_by)
       VALUES (?, ?, ?, ?, NULL, NULL)`,
      [senderStreet, senderCity, senderState, senderZipCode]
    );
    const sender_address_id = senderAddressResult.insertId;

    // Create sender full name
    const sender_full_name = senderMiddleName 
      ? `${senderFirstName} ${senderMiddleName} ${senderLastName}`
      : `${senderFirstName} ${senderLastName}`;

    // Insert sender as guest customer
    const [senderCustomerResult] = await connection.execute(
      `INSERT INTO customer (
        first_name, 
        middle_name, 
        last_name, 
        phone_number, 
        account_type, 
        address_id, 
        auth_id, 
        created_by, 
        updated_by
      ) VALUES (?, ?, ?, ?, 'guest', ?, NULL, NULL, NULL)`,
      [
        senderFirstName,
        toNullIfBlank(senderMiddleName),
        senderLastName,
        toNullIfBlank(senderPhone),
        sender_address_id
      ]
    );
    const sender_customer_id = senderCustomerResult.insertId;

    // Insert recipient address into address table
    const [recipientAddressResult] = await connection.execute(
      `INSERT INTO address (street_name, city_name, state_name, zip_code, created_by, updated_by)
       VALUES (?, ?, ?, ?, NULL, NULL)`,
      [recipientStreet, recipientCity, recipientState, recipientZipCode]
    );
    const recipient_address_id = recipientAddressResult.insertId;

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
        sender_customer_id,
        sender_name,
        sender_phone,
        sender_email,
        sender_address_id,
        recipient_name,
        recipient_phone,
        recipient_email,
        recipient_address_id,
        package_type,
        weight,
        length,
        width,
        height,
        package_status,
        tracking_number,
        created_by,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', ?, NULL, NULL)`,
      [
        sender_customer_id,
        sender_full_name,
        toNullIfBlank(senderPhone),
        senderEmail,
        sender_address_id,
        recipientName,
        toNullIfBlank(recipientPhone),
        recipientEmail,
        recipient_address_id,
        packageType,
        weight,
        toNullIfBlank(length),
        toNullIfBlank(width),
        toNullIfBlank(height),
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