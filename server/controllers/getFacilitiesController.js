import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getFacilitiesController = async (req, res) => {
  let connection;
  try {
    const queryObject = url.parse(req.url, true).query;
    const type = queryObject.type;
    const status = queryObject.status;

    connection = await pool.getConnection();

    let query = `
      SELECT
        f.facility_id,
        f.facility_name,
        f.facility_type,
        f.status,
        f.days_of_week,
        f.opening_hours,
        f.closing_hours,
        f.manager_id,
        CONCAT(e.first_name, ' ', e.last_name) as manager_name,
        a.street_name,
        a.city_name,
        a.state_name,
        a.zip_code
      FROM facility f
      LEFT JOIN address a ON f.address_id = a.address_id
      LEFT JOIN employee e ON f.manager_id = e.employee_id
    `;

    const conditions = [];
    const params = [];

    if (type && type !== 'all') {
      conditions.push('f.facility_type = ?');
      params.push(type);
    }

    if (status && status !== 'all') {
      conditions.push('f.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY f.facility_id';

    const [facilities] = await connection.execute(query, params);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, facilities }));
  }
  catch (error) {
    console.error('Error fetching facilities:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
