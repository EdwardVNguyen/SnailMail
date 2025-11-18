import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const updatePackageDimensionsController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { packageId, length, width, height, weight, authId } = body;

    // Validate required fields
    if (!packageId || !authId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Package ID and auth ID are required'
      }));
      return;
    }

    // Validate dimensions are positive numbers
    if (length && (isNaN(length) || parseFloat(length) <= 0)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Length must be a positive number'
      }));
      return;
    }

    if (width && (isNaN(width) || parseFloat(width) <= 0)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Width must be a positive number'
      }));
      return;
    }

    if (height && (isNaN(height) || parseFloat(height) <= 0)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Height must be a positive number'
      }));
      return;
    }

    if (weight && (isNaN(weight) || parseFloat(weight) <= 0)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Weight must be a positive number'
      }));
      return;
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Update package dimensions
    await connection.execute(
      `UPDATE package
       SET length = ?, width = ?, height = ?, weight = ?, updated_by = ?
       WHERE package_id = ?`,
      [
        length ? parseFloat(length) : null,
        width ? parseFloat(width) : null,
        height ? parseFloat(height) : null,
        weight ? parseFloat(weight) : null,
        authId,
        packageId
      ]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Package dimensions updated successfully'
    }));
  }
  catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating package dimensions:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
