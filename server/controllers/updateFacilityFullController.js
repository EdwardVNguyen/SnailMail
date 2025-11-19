import pool from '../config/database.js';
import { badServerRequest, badClientRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const updateFacilityFullController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
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
      updatedBy
    } = body;

    // Validate required fields
    if (!facilityId || !facilityName || !facilityType || !status || !daysOfWeek ||
        !openingHours || !closingHours || !streetName || !cityName || !stateName || !zipCode || !updatedBy) {
      return badClientRequest(res, 'Missing required fields');
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get facility's current data
    const [facilityRows] = await connection.execute(
      'SELECT address_id FROM facility WHERE facility_id = ?',
      [facilityId]
    );

    if (facilityRows.length === 0) {
      await connection.rollback();
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Facility not found'
      }));
      return;
    }

    const addressId = facilityRows[0].address_id;

    // Update address
    await connection.execute(
      `UPDATE address
       SET street_name = ?, city_name = ?, state_name = ?, zip_code = ?,
           updated_by = ?, last_updated = CURRENT_TIMESTAMP
       WHERE address_id = ?`,
      [streetName, cityName, stateName, zipCode, updatedBy, addressId]
    );

    // Update facility table
    await connection.execute(
      `UPDATE facility
       SET facility_name = ?, facility_type = ?, status = ?, days_of_week = ?,
           opening_hours = ?, closing_hours = ?, manager_id = ?,
           updated_by = ?, last_updated = CURRENT_TIMESTAMP
       WHERE facility_id = ?`,
      [
        facilityName,
        facilityType,
        status,
        daysOfWeek,
        openingHours,
        closingHours,
        managerId || null,
        updatedBy,
        facilityId
      ]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Facility updated successfully'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in updateFacilityFullController:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
