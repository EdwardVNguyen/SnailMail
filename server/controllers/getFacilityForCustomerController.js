import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getFacilityForCustomerController = async (req, res) => {
  const sql = `
    SELECT facility_name, facility_id
    FROM facility
    WHERE status = 'active' AND facility_type = 'post_office'
    `;

  try {
    const [results] = await pool.execute(sql);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      facilities: results
    }));
  } catch (err) {
    console.error('Error fetching facilities:', err);
    badServerRequest(res);
  }
};
