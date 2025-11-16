import pool from '../../config/database.js';
import { badServerRequest } from '../../utils/badRequest.js';
import url from 'url';

export const getPackageTrackingHistoryController = async (req, res) => {
  let connection;
  try {
    const queryObject = url.parse(req.url, true).query;
    const packageId = queryObject.packageId;

    if (!packageId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Package ID is required'
      }));
      return;
    }

    connection = await pool.getConnection();

    // Get tracking history
    const [trackingEvents] = await connection.execute(
      `SELECT
        te.tracking_event_id,
        te.package_id,
        te.event_type,
        te.event_time,
        te.location_id,
        f.facility_name,
        CONCAT(a.street_name, ', ', a.city_name, ', ', a.state_name, ' ', a.zip_code) as location_address
      FROM tracking_event te
      LEFT JOIN facility f ON te.location_id = f.facility_id
      LEFT JOIN address a ON f.address_id = a.address_id
      WHERE te.package_id = ?
      ORDER BY te.event_time DESC`,
      [packageId]
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, trackingEvents }));
  }
  catch (error) {
    console.error('Error fetching tracking history:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
