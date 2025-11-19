import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export async function getOutForDeliveryPackagesController(req, res) {
  try {
    const queryParams = url.parse(req.url, true).query;
    const facilityId = queryParams.facilityId;

    if (!facilityId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Facility ID is required'
      }));
      return;
    }

    // Query to get all packages with status "Out for Delivery" from the specified facility
    // Package table stores recipient info directly, join with address for location details
    // Join with tracking_event to filter by location (facility's address_id)
    const query = `
      SELECT DISTINCT
        p.package_id,
        p.tracking_number,
        p.recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        a.street_name AS recipient_address,
        a.city_name AS recipient_city,
        a.state_name AS recipient_state,
        a.zip_code AS recipient_zip
      FROM package p
      INNER JOIN address a ON p.recipient_address_id = a.address_id
      INNER JOIN tracking_event te ON p.package_id = te.package_id
      INNER JOIN facility f ON te.location_id = f.address_id
      WHERE p.package_status = 'Out for Delivery'
        AND f.facility_id = ?
        AND te.tracking_event_id = (
          SELECT MAX(te2.tracking_event_id)
          FROM tracking_event te2
          WHERE te2.package_id = p.package_id
        )
      ORDER BY a.zip_code ASC
    `;

    const [packages] = await pool.query(query, [facilityId]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      packages: packages
    }));

  } catch (err) {
    console.error('Database query failed', err);
    badServerRequest(res);
  }
}
