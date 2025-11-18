import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getFacilityReportController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Parse query parameters for date range
    const queryObject = url.parse(req.url, true).query;
    let endDate = queryObject.endDate;
    let startDate = queryObject.startDate;

    // Ensure startDate is before endDate (swap if needed)
    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    // Get comprehensive facility statistics
    const sql = `
      SELECT
        f.facility_id,
        f.facility_name,
        CONCAT(a.street_name, ', ', a.city_name, ', ', a.state_name, ' ', a.zip_code) as facility_address,

        -- Packages received (tracking events at this facility in date range)
        IFNULL(packages_received.count, 0) as packages_received,

        -- Packages delivered (last tracking event was 'delivered' at this facility)
        IFNULL(packages_delivered.count, 0) as packages_delivered,

        -- Lost packages (packages marked as lost at this facility)
        IFNULL(packages_lost.count, 0) as packages_lost,

        -- Lost package rate
        CASE
          WHEN IFNULL(packages_received.count, 0) > 0
          THEN ROUND((IFNULL(packages_lost.count, 0) / IFNULL(packages_received.count, 0)) * 100, 2)
          ELSE 0
        END as lost_package_rate,

        -- Average delivery time for packages delivered from this facility
        IFNULL(delivery_stats.avg_delivery_days, 0) as avg_delivery_days,

        -- Current backlog (packages at facility not delivered/lost/returned)
        IFNULL(current_backlog.count, 0) as current_backlog,

        -- Status distribution
        IFNULL(status_processing.count, 0) as status_processing,
        IFNULL(status_in_transit.count, 0) as status_in_transit,
        IFNULL(status_out_for_delivery.count, 0) as status_out_for_delivery

      FROM facility f
      LEFT JOIN address a ON f.address_id = a.address_id

      -- Packages received: all tracking events at this facility in date range
      LEFT JOIN (
        SELECT
          a.address_id,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        INNER JOIN address a ON te.location_id = a.address_id
        WHERE te.event_time BETWEEN ? AND ?
        GROUP BY a.address_id
      ) packages_received ON f.address_id = packages_received.address_id

      -- Packages delivered: packages whose LAST tracking event was 'delivered' at this facility
      LEFT JOIN (
        SELECT
          te_latest.location_id,
          COUNT(DISTINCT te_latest.package_id) as count
        FROM (
          SELECT
            te.package_id,
            te.event_type,
            te.location_id,
            te.event_time
          FROM tracking_event te
          INNER JOIN (
            SELECT
              package_id,
              MAX(event_time) as max_event_time
            FROM tracking_event
            WHERE event_time BETWEEN ? AND ?
            GROUP BY package_id
          ) latest ON te.package_id = latest.package_id
                 AND te.event_time = latest.max_event_time
        ) te_latest
        WHERE te_latest.event_type = 'delivered'
        GROUP BY te_latest.location_id
      ) packages_delivered ON f.address_id = packages_delivered.location_id

      -- Lost packages: packages marked as lost at this facility
      LEFT JOIN (
        SELECT
          te.location_id,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        WHERE te.event_type = 'lost'
          AND te.event_time BETWEEN ? AND ?
        GROUP BY te.location_id
      ) packages_lost ON f.address_id = packages_lost.location_id

      -- Average delivery time for packages delivered from this facility
      LEFT JOIN (
        SELECT
          te_delivered.location_id,
          AVG(DATEDIFF(te_delivered.event_time, p.created_at)) as avg_delivery_days
        FROM tracking_event te_delivered
        INNER JOIN package p ON te_delivered.package_id = p.package_id
        INNER JOIN (
          SELECT
            package_id,
            MAX(event_time) as max_event_time
          FROM tracking_event
          WHERE event_time BETWEEN ? AND ?
            AND event_type = 'delivered'
          GROUP BY package_id
        ) latest ON te_delivered.package_id = latest.package_id
               AND te_delivered.event_time = latest.max_event_time
        WHERE te_delivered.event_type = 'delivered'
        GROUP BY te_delivered.location_id
      ) delivery_stats ON f.address_id = delivery_stats.location_id

      -- Current backlog: packages currently at this facility (not delivered/lost/returned)
      LEFT JOIN (
        SELECT
          p.facility_id,
          COUNT(DISTINCT p.package_id) as count
        FROM package p
        WHERE p.package_status NOT IN ('delivered', 'lost', 'returned')
        GROUP BY p.facility_id
      ) current_backlog ON f.facility_id = current_backlog.facility_id

      -- Status distribution: processing
      LEFT JOIN (
        SELECT
          p.facility_id,
          COUNT(DISTINCT p.package_id) as count
        FROM package p
        WHERE p.package_status = 'processing'
        GROUP BY p.facility_id
      ) status_processing ON f.facility_id = status_processing.facility_id

      -- Status distribution: in-transit
      LEFT JOIN (
        SELECT
          p.facility_id,
          COUNT(DISTINCT p.package_id) as count
        FROM package p
        WHERE p.package_status = 'in-transit'
        GROUP BY p.facility_id
      ) status_in_transit ON f.facility_id = status_in_transit.facility_id

      -- Status distribution: out-for-delivery
      LEFT JOIN (
        SELECT
          p.facility_id,
          COUNT(DISTINCT p.package_id) as count
        FROM package p
        WHERE p.package_status = 'out-for-delivery'
        GROUP BY p.facility_id
      ) status_out_for_delivery ON f.facility_id = status_out_for_delivery.facility_id

      ORDER BY packages_received DESC
    `;

    const [rows] = await connection.execute(sql, [
      startDate, endDate,  // packages_received
      startDate, endDate,  // packages_delivered (latest event)
      startDate, endDate,  // packages_lost
      startDate, endDate   // delivery_stats
    ]);

    // Calculate summary statistics
    const totalReceived = rows.reduce((sum, row) => sum + row.packages_received, 0);
    const totalDelivered = rows.reduce((sum, row) => sum + row.packages_delivered, 0);
    const totalLost = rows.reduce((sum, row) => sum + row.packages_lost, 0);
    const totalBacklog = rows.reduce((sum, row) => sum + row.current_backlog, 0);
    const rowsWithDeliveryTime = rows.filter(row => row.avg_delivery_days > 0);
    const avgDeliveryTime = rowsWithDeliveryTime.length > 0
      ? rows.reduce((sum, row) => sum + row.avg_delivery_days, 0) / rowsWithDeliveryTime.length
      : 0;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      facilities: rows,
      count: rows.length,
      summary: {
        total_received: totalReceived,
        total_delivered: totalDelivered,
        total_lost: totalLost,
        total_backlog: totalBacklog,
        avg_delivery_days: avgDeliveryTime ? avgDeliveryTime.toFixed(1) : '0',
        overall_lost_rate: totalReceived > 0 ? ((totalLost / totalReceived) * 100).toFixed(2) : '0'
      }
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
