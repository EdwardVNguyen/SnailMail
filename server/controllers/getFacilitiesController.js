import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

// Get all facilities
export const getFacilitiesController = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [facilities] = await connection.execute(
      `SELECT facility_id, facility_name, facility_type, status, address_id
       FROM facility
       WHERE status = 'active'
       ORDER BY facility_name ASC`
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      facilities: facilities
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
