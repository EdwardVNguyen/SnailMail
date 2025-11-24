import pool from '../config/database.js';
import { badServerRequest, badClientRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const softDeleteFacilityController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
    const { facilityId, authId } = body;

    if (!facilityId) {
      return badClientRequest(res, 'Facility ID is required');
    }

    connection = await pool.getConnection();

    // Get the facility record and check if exists
    const [facilityRows] = await connection.query(
      `SELECT facility_id, facility_name
       FROM facility
       WHERE facility_id = ?`,
      [facilityId]
    );

    if (facilityRows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Facility not found'
      }));
      return;
    }

    const facility = facilityRows[0];

    // Perform soft delete (BEFORE DELETE trigger will archive the record)
    const [result] = await connection.query(
      `DELETE FROM facility WHERE facility_id = ?`,
      [facilityId]
    );

    if (result.affectedRows === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to delete facility'
      }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Facility deleted successfully'
    }));
  }
  catch (error) {
    console.error('Error deleting facility:', error);

    // Check for foreign key constraint violation
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Cannot delete facility: it has packages or employees associated with it. Please reassign or remove them first.'
      }));
      return;
    }

    badServerRequest(res, 'Error deleting facility');
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};
