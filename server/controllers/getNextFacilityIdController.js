import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getNextFacilityIdController = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT MAX(facility_id) as max_id FROM facility');
    const nextFacilityId = (rows[0].max_id || 0) + 1;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, nextFacilityId }));
  }
  catch (error) {
    console.error('Error fetching next facility ID:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
