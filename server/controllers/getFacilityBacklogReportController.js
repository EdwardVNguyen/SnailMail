import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getFacilityBacklogReportController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Get facility backlog statistics
    const sql = `
      SELECT
        f.facility_id,
        f.facility_name,
        CONCAT(a.street_name, ', ', a.city_name, ', ', a.state_name, ' ', a.zip_code) as facility_address,
        COUNT(DISTINCT CASE WHEN te_in.tracking_event_id IS NOT NULL THEN te_in.package_id END) as packages_in,
        COUNT(DISTINCT CASE WHEN te_out.tracking_event_id IS NOT NULL THEN te_out.package_id END) as packages_out,
        COUNT(DISTINCT CASE WHEN te_in.tracking_event_id IS NOT NULL THEN te_in.package_id END) -
        COUNT(DISTINCT CASE WHEN te_out.tracking_event_id IS NOT NULL THEN te_out.package_id END) as backlog
      FROM facility f
      LEFT JOIN address a ON f.address_id = a.address_id
      LEFT JOIN tracking_event te_in ON f.facility_id = te_in.location_id
        AND te_in.event_type = 'in transit'
        AND te_in.event_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      LEFT JOIN tracking_event te_out ON f.facility_id = te_out.location_id
        AND te_out.event_type IN ('out for delivery', 'delivered')
        AND te_out.event_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY f.facility_id, f.facility_name, facility_address
      ORDER BY backlog DESC
    `;

    const [rows] = await connection.execute(sql);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      facilities: rows,
      count: rows.length
    }));

  }
  catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  }
  finally {
    connection.release();
  }
};
