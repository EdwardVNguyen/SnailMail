import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const addFacilityController = async (req, res) => {
  let connection;
  try {
    // Add new facility
    const body = await getJSONRequestBody(req);
    const {
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
    if (!facilityName || !facilityType || !status || !daysOfWeek ||
        !openingHours || !closingHours || !streetName || !cityName || !stateName || !zipCode) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
      return;
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Create address record
    const [addressResult] = await connection.execute(
      'INSERT INTO address (street_name, city_name, state_name, zip_code, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
      [streetName, cityName, stateName, zipCode, createdBy, createdBy]
    );

    const addressId = addressResult.insertId;

    // Create facility record (facility_id is AUTO_INCREMENT)
    await connection.execute(
      'INSERT INTO facility (facility_name, facility_type, status, days_of_week, opening_hours, closing_hours, manager_id, address_id, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [facilityName, facilityType, status, daysOfWeek, openingHours, closingHours, managerId || null, addressId, createdBy, createdBy]
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
