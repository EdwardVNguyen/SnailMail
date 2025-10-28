import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      }
      catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

export const addFacilityController = async (req, res) => {
  let connection;
  try {
    // Add new facility
    const body = await parseRequestBody(req);
    const {
      facilityId,
      facilityName,
      facilityType,
      status,
      daysOfWeek,
      openingHours,
      closingHours,
      managerId,
      streetName,
      cityName,
      stateName,
      zipCode,
      createdBy
    } = body;

    // Validate required fields
    if (!facilityId || !facilityName || !facilityType || !status || !daysOfWeek ||
        !openingHours || !closingHours || !streetName || !cityName || !stateName || !zipCode) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
      return;
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if facility_id already exists
    const [existingFacility] = await connection.execute(
      'SELECT facility_id FROM facility WHERE facility_id = ?',
      [facilityId]
    );

    if (existingFacility.length > 0) {
      await connection.rollback();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Facility ID already exists' }));
      return;
    }

    // Create address record
    const [addressResult] = await connection.execute(
      'INSERT INTO address (street_name, city_name, state_name, zip_code, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
      [streetName, cityName, stateName, zipCode, createdBy, createdBy]
    );

    const addressId = addressResult.insertId;

    // Create facility record
    await connection.execute(
      'INSERT INTO facility (facility_id, facility_name, facility_type, status, days_of_week, opening_hours, closing_hours, manager_id, address_id, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [facilityId, facilityName, facilityType, status, daysOfWeek, openingHours, closingHours, managerId || null, addressId, createdBy, createdBy]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Facility added successfully' }));
  }
  catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error adding facility:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
