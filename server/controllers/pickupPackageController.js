import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const pickupPackageController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { packageId, authId } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get courier's employee_id
    const [courierRows] = await connection.execute(
      'SELECT employee_id FROM employee WHERE auth_id = ?',
      [authId]
    );

    if (courierRows.length === 0) {
      await connection.rollback();
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Courier not found' }));
      return;
    }

    const courierId = courierRows[0].employee_id;

    // Update package: assign courier and change status to 'in-transit'
    await connection.execute(
      `UPDATE package
       SET courier_id = ?, package_status = 'in-transit', updated_by = ?
       WHERE package_id = ? AND package_status = 'processing' AND courier_id IS NULL`,
      [courierId, authId, packageId]
    );

    // Add tracking event
    await connection.execute(
      `INSERT INTO tracking_event (package_id, event_type, location_id, event_time, created_by, updated_by)
       VALUES (?, 'processing', (SELECT facility_id FROM package WHERE package_id = ?), NOW(), ?, ?)`,
      [packageId, packageId, authId, authId]
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Package picked up successfully' }));
  }
  catch (error) {
    if (connection) await connection.rollback();
    console.error('Error picking up package:', error);

    // Check if error is from the courier package limit trigger
    if (error.sqlState === '45000' && error.message.includes('Courier cannot have more than 5 packages')) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'You cannot pick up more packages. Maximum limit of 5 packages reached.'
      }));
      return;
    }

    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
