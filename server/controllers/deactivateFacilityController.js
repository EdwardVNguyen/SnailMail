import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const toggleFacilityStatusController = async (req, res) => {
  let connection;

  try {
    const body = await getJSONRequestBody(req);
    const { facilityId, status } = body;

    if (!facilityId) {
      return badServerRequest(res, 'Facility ID is required');
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      return badServerRequest(res, 'Valid status is required (active or inactive)');
    }

    connection = await pool.getConnection();

    // Update facility status
    const sql = 'UPDATE facility SET status = ? WHERE facility_id = ?';
    const [result] = await connection.query(sql, [status, facilityId]);

    if (result.affectedRows === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Facility not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `Facility ${status === 'active' ? 'activated' : 'deactivated'} successfully` }));
  }
  catch (error) {
    console.error('Error updating facility status:', error);
    badServerRequest(res, 'Error updating facility status');
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};
