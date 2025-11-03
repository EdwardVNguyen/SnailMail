import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Generate random alphanumeric tracking number
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let tracking_number = 'TRK';
  for (let i = 0; i < 12; i++) {
    tracking_number += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return tracking_number;
};

export const createShipmentController = async (req, res) => {
  let authId,
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
    authId = body.authId;
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
    if (!authId || !recipientName || !recipientEmail || !recipientStreet || 
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

    // Get sender information from customer and authentication tables
    const [senderRows] = await connection.execute(
      `SELECT 
        c.customer_id,
        CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) as sender_name,
        c.phone_number as sender_phone,
        c.address_id as sender_address_id,
        a.email as sender_email
      FROM customer c
      JOIN authentication a ON c.auth_id = a.auth_id
      WHERE c.auth_id = ?`,
      [authId]
    );

    if (senderRows.length === 0) {
      await connection.rollback();
      return badClientRequest(res, { message: 'Sender not found' });
    }

    const sender_data = senderRows[0];

    // Insert recipient address into address table
    const [addressResult] = await connection.execute(
      `INSERT INTO address (street_name, city_name, state_name, zip_code, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recipientStreet, recipientCity, recipientState, recipientZipCode, authId, authId]
    );
    const recipient_address_id = addressResult.insertId;

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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sender_data.customer_id,
        sender_data.sender_name,
        sender_data.sender_phone || null,
        sender_data.sender_email,
        sender_data.sender_address_id,
        recipientName,
        recipientPhone || null,
        recipientEmail,
        recipient_address_id,
        packageType,
        weight,
        length,
        width,
        height,
        'processing',
        tracking_number,
        authId,
        authId
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
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};