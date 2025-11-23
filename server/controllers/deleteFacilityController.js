import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const deleteFacilityController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
    const { facilityId, deletedBy } = body;

    if (!facilityId) {
      return badServerRequest(res, 'Facility ID is required');
    }

    connection = await pool.getConnection();

    // Delete facility (hard delete)
    const sql = 'DELETE FROM facility WHERE facility_id = ?';
    const [result] = await connection.query(sql, [facilityId]);

    if (result.affectedRows === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Facility not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Facility deleted successfully' }));
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
