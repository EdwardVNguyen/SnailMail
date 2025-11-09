import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const checkFacilityUniquenessController = async (req, res) => {
  let connection;
  try {
    const queryObject = url.parse(req.url, true).query;
    const field = queryObject.field;
    const value = queryObject.value;
    const currentId = queryObject.currentId;

    if (!field || !value || !currentId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Missing required parameters' }));
      return;
    }

    connection = await pool.getConnection();

    let query;
    let params;

    if (field === 'facility_id') {
      query = 'SELECT facility_id FROM facility WHERE facility_id = ? AND facility_id != ?';
      params = [value, currentId];
    }
    else {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Invalid field for uniqueness check' }));
      return;
    }

    const [rows] = await connection.execute(query, params);

    const isUnique = rows.length === 0;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, isUnique }));
  }
  catch (error) {
    console.error('Error checking facility uniqueness:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
