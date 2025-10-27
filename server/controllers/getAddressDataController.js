import pool from '../config/database.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';
import { parse } from 'node:url'

export const getAddressDataController = async (req, res) => {
  const connection = await pool.getConnection();

    try {
      // Get addressId from query
      const url = parse(req.url, true);
      const addressId = url.query.addressId;

      if (!addressId) {
        return badClientRequest(res, 'addressId is required');
      }

      // SQL to get all address attributes
      const sql = `
        SELECT *
        FROM address
        WHERE address_id = ?
      `;

      const [rows] = await connection.execute(sql, [addressId]);

      if (rows.length === 0) {
        return badClientRequest(res, 'Address not found');
      }

      // Return the first (and only) row
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        address: rows[0]
      }));

    } catch (error) {
      console.error('Database query failed', error);
      badServerRequest(res);
    } finally {
      connection.release();
    }
}
