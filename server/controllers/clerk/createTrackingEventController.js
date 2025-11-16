import pool from '../../config/database.js';
import { badServerRequest } from '../../utils/badRequest.js';
import { getJSONRequestBody } from '../../utils/getJSONRequestBody.js';

export const createTrackingEventController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { packageId, eventType, locationId, authId } = body;

    // Validate required fields
    if (!packageId || !eventType || !locationId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Package ID, event type, and location ID are required'
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

    // Create tracking event
    await connection.execute(
      `INSERT INTO tracking_event
       (package_id, event_type, location_id, event_time, created_by, updated_by)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [packageId, eventType, locationId || null, authId, authId]
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
