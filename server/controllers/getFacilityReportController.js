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

    // Add time to make startDate beginning of day and endDate end of day
    startDate = startDate + ' 00:00:00';
    endDate = endDate + ' 23:59:59';

    // Get comprehensive facility statistics
    const sql = `
      SELECT
        f.facility_id,
        f.facility_name,
        f.status,
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

        -- Packages sent to other facilities (transfers out)
        IFNULL(packages_sent.count, 0) as packages_sent,

        -- Status distribution
        IFNULL(status_processing.count, 0) as backlog,
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

      -- Problem packages: lost, undeliverable, failed-delivery, damaged where facility was last location
      LEFT JOIN (
        SELECT
          te_last.location_id,
          COUNT(DISTINCT p.package_id) as count
        FROM package p
        INNER JOIN tracking_event te_last ON te_last.package_id = p.package_id
        WHERE p.package_status IN ('lost', 'undeliverable', 'failed-delivery', 'damaged')
          AND te_last.event_time = (
            SELECT MAX(te2.event_time)
            FROM tracking_event te2
            WHERE te2.package_id = p.package_id
          )
        GROUP BY te_last.location_id
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

      -- Packages sent to other facilities (count packages that left this facility for another facility)
      LEFT JOIN (
        SELECT
          f_from.facility_id as from_facility_id,
          COUNT(DISTINCT te_dest.package_id) as count
        FROM tracking_event te_dest
        INNER JOIN facility f_to ON te_dest.location_id = f_to.address_id
        INNER JOIN tracking_event te_prev ON te_dest.package_id = te_prev.package_id
          AND te_prev.event_time = (
            SELECT MAX(te_inner.event_time)
            FROM tracking_event te_inner
            WHERE te_inner.package_id = te_dest.package_id
              AND te_inner.event_time < te_dest.event_time
          )
        INNER JOIN facility f_from ON te_prev.location_id = f_from.address_id
        WHERE te_dest.event_time BETWEEN ? AND ?
          AND f_from.facility_id != f_to.facility_id
        GROUP BY f_from.facility_id
      ) packages_sent ON f.facility_id = packages_sent.from_facility_id

      -- Status distribution: processing (packages whose latest tracking event at this facility is 'processing')
      LEFT JOIN (
        SELECT
          f_inner.facility_id,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        INNER JOIN facility f_inner ON te.location_id = f_inner.address_id
        WHERE te.event_type = 'processing'
          AND te.event_time = (
            SELECT MAX(te2.event_time)
            FROM tracking_event te2
            WHERE te2.package_id = te.package_id
          )
        GROUP BY f_inner.facility_id
      ) status_processing ON f.facility_id = status_processing.facility_id

      -- Status distribution: in-transit (packages whose latest tracking event at this facility is 'in-transit')
      LEFT JOIN (
        SELECT
          f_inner.facility_id,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        INNER JOIN facility f_inner ON te.location_id = f_inner.address_id
        WHERE te.event_type = 'in-transit'
          AND te.event_time = (
            SELECT MAX(te2.event_time)
            FROM tracking_event te2
            WHERE te2.package_id = te.package_id
          )
        GROUP BY f_inner.facility_id
      ) status_in_transit ON f.facility_id = status_in_transit.facility_id

      -- Status distribution: out-for-delivery
      LEFT JOIN (
        SELECT
          f_inner.facility_id,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        INNER JOIN facility f_inner ON te.location_id = f_inner.address_id
        WHERE te.event_type = 'out-for-delivery'
          AND te.event_time = (
            SELECT MAX(te2.event_time)
            FROM tracking_event te2
            WHERE te2.package_id = te.package_id
          )
        GROUP BY f_inner.facility_id
      ) status_out_for_delivery ON f.facility_id = status_out_for_delivery.facility_id

      ORDER BY packages_received DESC
    `;

    const [rows] = await connection.execute(sql, [
      startDate, endDate,  // packages_received
      startDate, endDate,  // packages_delivered (latest event)
      startDate, endDate,  // delivery_stats
      startDate, endDate   // packages_sent
    ]);

    // Calculate summary statistics
    const totalReceived = rows.reduce((sum, row) => sum + row.packages_received, 0);
    const totalSent = rows.reduce((sum, row) => sum + row.packages_sent, 0);
    const totalDelivered = rows.reduce((sum, row) => sum + row.packages_delivered, 0);
    const totalLost = rows.reduce((sum, row) => sum + row.packages_lost, 0);
    const totalBacklog = rows.reduce((sum, row) => sum + row.backlog, 0);
    const totalInTransit = rows.reduce((sum, row) => sum + row.status_in_transit, 0);
    const totalOutForDelivery = rows.reduce((sum, row) => sum + row.status_out_for_delivery, 0);
    const rowsWithDeliveryTime = rows.filter(row => row.avg_delivery_days > 0);
    const avgDeliveryTime = rowsWithDeliveryTime.length > 0
      ? rowsWithDeliveryTime.reduce((sum, row) => sum + row.avg_delivery_days, 0) / rowsWithDeliveryTime.length
      : 0;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      facilities: rows,
      count: rows.length,
      summary: {
        total_received: totalReceived,
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_lost: totalLost,
        total_backlog: totalBacklog,
        total_in_transit: totalInTransit,
        total_out_for_delivery: totalOutForDelivery
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
