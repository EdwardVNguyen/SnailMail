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

export const deleteFacilityController = async (req, res) => {
  let connection;

  try {
    const body = await parseRequestBody(req);
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
    badServerRequest(res, 'Error deleting facility');
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
};
