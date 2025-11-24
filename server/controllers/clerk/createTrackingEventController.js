import pool from '../../config/database.js';
import { badServerRequest } from '../../utils/badRequest.js';
import { getJSONRequestBody } from '../../utils/getJSONRequestBody.js';

export const createTrackingEventController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { packageId, eventType, authId } = body;

    // Validate required fields
    if (!packageId || !eventType || !authId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Package ID, event type, and authId are required'
      }));
      return;
    }

    // Validate event type
    const validEventTypes = [
      'processing',
      'pre-shipment',
      'out-for-delivery',
      'delivered',
      'lost',
      'returned',
      'undeliverable',
      'failed-delivery',
      'damaged'
    ];
    if (!validEventTypes.includes(eventType)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid event type'
      }));
      return;
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get clerk's facility information
    const [[clerk]] = await connection.execute(
      `SELECT e.employee_id, e.facility_id, f.address_id AS facility_address_id
       FROM employee e
       JOIN facility f ON e.facility_id = f.facility_id
       WHERE e.auth_id = ? AND e.account_type = 'clerk'`,
      [authId]
    );

    if (!clerk) {
      await connection.rollback();
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'User is not a clerk'
      }));
      return;
    }

    // Verify the package is at the clerk's facility
    const [[pkg]] = await connection.execute(
      `SELECT package_id, facility_id
       FROM package
       WHERE package_id = ?`,
      [packageId]
    );

    if (!pkg) {
      await connection.rollback();
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Package not found'
      }));
      return;
    }

    // SECURITY: Verify package is at clerk's facility
    if (pkg.facility_id !== clerk.facility_id) {
      await connection.rollback();
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'You can only create events for packages at your facility'
      }));
      return;
    }

    // Create tracking event using clerk's facility address as location
    await connection.execute(
      `INSERT INTO tracking_event
       (package_id, event_type, location_id, event_time, created_by, updated_by)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [packageId, eventType, clerk.facility_address_id, authId, authId]
    );

    // Update package status based on event type
    let packageStatus;
    switch (eventType) {
      case 'processing':
        packageStatus = 'processing';
        break;
      case 'pre-shipment':
        packageStatus = 'pre-shipment';
        break;
      case 'out-for-delivery':
        packageStatus = 'out-for-delivery';
        break;
      case 'delivered':
        packageStatus = 'delivered';
        break;
      case 'lost':
        packageStatus = 'lost';
        break;
      case 'returned':
        packageStatus = 'returned';
        break;
      case 'undeliverable':
        packageStatus = 'undeliverable';
        break;
      case 'failed-delivery':
        packageStatus = 'failed-delivery';
        break;
      case 'damaged':
        packageStatus = 'damaged';
        break;
      default:
        packageStatus = 'processing';
    }

    await connection.execute(
      `UPDATE package
       SET package_status = ?, updated_by = ?
       WHERE package_id = ?`,
      [packageStatus, authId, packageId]
    );

    // Auto-reject pending courier requests for error status events
    const errorStatuses = ['lost', 'returned', 'undeliverable', 'failed-delivery', 'damaged'];
    if (errorStatuses.includes(eventType)) {
      await connection.execute(
        `UPDATE courier_package_request
         SET request_status = 'rejected',
             reviewed_by = ?,
             review_date = NOW(),
             updated_by = ?
         WHERE package_id = ? AND request_status = 'pending'`,
        [clerk.employee_id, authId, packageId]
      );
    }

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Tracking event created successfully'
    }));
  }
  catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating tracking event:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
