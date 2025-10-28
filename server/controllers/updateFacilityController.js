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

export const updateFacilityController = async (req, res) => {
  let connection;
  try {
    const body = await parseRequestBody(req);
    const { facilityId, field, value, updatedBy } = body;

    if (!facilityId || !field) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
      return;
    }

    connection = await pool.getConnection();

    // Convert undefined or empty string to null
    let finalValue = value;
    if (value === undefined || value === '') {
      finalValue = null;
    }

    // Whitelist allowed fields to prevent SQL injection
    const addressFields = ['street_name', 'city_name', 'state_name', 'zip_code'];
    const facilityFields = ['facility_id', 'facility_name', 'facility_type', 'status', 'days_of_week', 'opening_hours', 'closing_hours', 'manager_id'];

    if (addressFields.includes(field)) {
      // Get the address_id for this facility
      const [facilityRows] = await connection.execute(
        'SELECT address_id FROM facility WHERE facility_id = ?',
        [facilityId]
      );

      if (facilityRows.length === 0) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Facility not found' }));
        return;
      }

      const addressId = facilityRows[0].address_id;

      // Update the address field using proper parameterization
      const updateAddressQuery = `UPDATE address SET ${connection.escapeId(field)} = ?, updated_by = ? WHERE address_id = ?`;
      await connection.execute(updateAddressQuery, [finalValue, updatedBy, addressId]);
    }
    else if (facilityFields.includes(field)) {
      // Update the facility field directly using proper parameterization
      const updateFacilityQuery = `UPDATE facility SET ${connection.escapeId(field)} = ?, updated_by = ? WHERE facility_id = ?`;
      await connection.execute(updateFacilityQuery, [finalValue, updatedBy, facilityId]);
    }
    else {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Invalid field name' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Facility updated successfully' }));
  }
  catch (error) {
    console.error('Error updating facility:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
