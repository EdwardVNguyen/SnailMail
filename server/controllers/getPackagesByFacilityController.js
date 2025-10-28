import pool from '../config/database.js';
import { parse } from 'url';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Get all packages currently at a facility (based on latest tracking event)
export const getPackagesByFacilityController = async (req, res) => {
  const url = parse(req.url, true);
  const facilityId = url.query.facilityId;

  if (!facilityId) {
    return badClientRequest(res, 'facilityId query parameter is required');
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Get packages where the latest tracking event location_id matches the facility's address_id
    // Only show packages that are in transit (not delivered)
    const [packages] = await connection.execute(
      `SELECT DISTINCT p.*
       FROM package p
       INNER JOIN tracking_event te ON p.package_id = te.package_id
       INNER JOIN facility f ON te.location_id = f.address_id
       WHERE f.facility_id = ?
       AND p.package_status IN ('in transit', 'pre-shipment', 'out for delivery')
       AND te.tracking_event_id = (
         SELECT MAX(te2.tracking_event_id)
         FROM tracking_event te2
         WHERE te2.package_id = p.package_id
       )
       ORDER BY p.last_updated DESC`,
      [facilityId]
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      packages: packages
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
