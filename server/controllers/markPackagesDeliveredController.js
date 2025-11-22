import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

export async function markPackagesDeliveredController(req, res) {
  try {
    const body = await getJSONRequestBody(req);
    const { packageIds, courierId } = body;

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Package IDs array is required'
      }));
      return;
    }

    if (!courierId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Courier ID is required'
      }));
      return;
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Look up employee_id from auth_id (courierId is actually auth_id)
      const [employeeRows] = await connection.query(
        `SELECT employee_id FROM employee WHERE auth_id = ?`,
        [courierId]
      );

      if (employeeRows.length === 0) {
        await connection.rollback();
        connection.release();
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Courier employee not found'
        }));
        return;
      }

      const employeeId = employeeRows[0].employee_id;

      // Update each package status to "Delivered" and assign courier
      for (const packageId of packageIds) {
        // Update package status and courier_id
        await connection.query(
          `UPDATE package
           SET package_status = 'Delivered',
               courier_id = ?,
               updated_by = ?,
               last_updated = NOW()
           WHERE package_id = ?`,
          [employeeId, courierId, packageId]
        );

        // Add a tracking event for delivery
        // Note: event_type uses spaces: 'delivered' (not 'Delivered')
        // location_id should be NULL for final delivery (at recipient address, not a facility)
        await connection.query(
          `INSERT INTO tracking_event
           (package_id, event_type, event_time, location_id, created_by)
           VALUES (?, 'delivered', NOW(), NULL, ?)`,
          [packageId, courierId]
        );
      }

      await connection.commit();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: `${packageIds.length} package(s) marked as delivered`
      }));

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error('Database query failed', err);
    badServerRequest(res);
  }
}
