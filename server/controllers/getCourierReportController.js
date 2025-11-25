import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getCourierReportController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Parse query parameters for date range
    const queryObject = url.parse(req.url, true).query;
    let endDate = queryObject.endDate;
    let startDate = queryObject.startDate;

    // If startDate is empty/null/undefined, set to a far past date for "all time"
    if (!startDate || startDate === '') {
      startDate = '1970-01-01';
    }

    // Ensure startDate is before endDate (swap if needed)
    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    // Add time to make startDate beginning of day and endDate end of day
    startDate = startDate + ' 00:00:00';
    endDate = endDate + ' 23:59:59';

    // Get comprehensive courier statistics
    const sql = `
      SELECT
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as courier_name,
        f.facility_name,

        -- Packages claimed (approved courier requests)
        IFNULL(packages_claimed.count, 0) as packages_claimed,

        -- Packages delivered (tracking events type='delivered' created by courier)
        IFNULL(packages_delivered.count, 0) as packages_delivered,

        -- Packages in transit (currently assigned to courier)
        IFNULL(packages_in_transit.count, 0) as packages_in_transit,

        -- Currently holding (all non-completed packages assigned to courier)
        IFNULL(currently_holding.count, 0) as currently_holding,

        -- Total moves (all deliveries by courier)
        IFNULL(total_moves.count, 0) as total_moves,

        -- Facility transfers (deliveries to facilities)
        IFNULL(facility_transfers.count, 0) as facility_transfers,

        -- Final deliveries (deliveries to recipients)
        IFNULL(final_deliveries.count, 0) as final_deliveries,

        -- Delivery success rate
        CASE
          WHEN IFNULL(packages_claimed.count, 0) > 0
          THEN ROUND((IFNULL(packages_delivered.count, 0) / IFNULL(packages_claimed.count, 0)) * 100, 2)
          ELSE 0
        END as delivery_success_rate,

        -- Lost packages (tracking events type='lost' created by courier)
        IFNULL(packages_lost.count, 0) as packages_lost,

        -- Late delivery packages (packages where courier was last handler)
        IFNULL(packages_late_delivery.count, 0) as packages_late_delivery,

        -- Lost package rate
        CASE
          WHEN IFNULL(packages_claimed.count, 0) > 0
          THEN ROUND((IFNULL(packages_lost.count, 0) / IFNULL(packages_claimed.count, 0)) * 100, 2)
          ELSE 0
        END as lost_package_rate,

        -- Average delivery time (from ship_date to delivery)
        IFNULL(delivery_time_stats.avg_delivery_days, 0) as avg_delivery_days,

        -- Average time between moves (courier-specific)
        IFNULL(move_time_stats.avg_time_between_moves, 0) as avg_time_between_moves,

        -- On-time rate (deliveries within 7 days)
        CASE
          WHEN IFNULL(packages_delivered.count, 0) > 0
          THEN ROUND((IFNULL(on_time_deliveries.count, 0) / IFNULL(packages_delivered.count, 0)) * 100, 2)
          ELSE 0
        END as on_time_rate,

        -- Request approval rate
        IFNULL(requests_approved.count, 0) as requests_approved,
        IFNULL(requests_rejected.count, 0) as requests_rejected,
        (IFNULL(requests_approved.count, 0) + IFNULL(requests_rejected.count, 0)) as total_requests,
        CASE
          WHEN (IFNULL(requests_approved.count, 0) + IFNULL(requests_rejected.count, 0)) > 0
          THEN ROUND((IFNULL(requests_approved.count, 0) / (IFNULL(requests_approved.count, 0) + IFNULL(requests_rejected.count, 0))) * 100, 2)
          ELSE 0
        END as request_approval_rate,

        -- Packages per day
        CASE
          WHEN DATEDIFF(?, ?) > 0
          THEN ROUND(IFNULL(packages_delivered.count, 0) / DATEDIFF(?, ?), 2)
          ELSE 0
        END as packages_per_day

      FROM employee e
      LEFT JOIN authentication auth ON e.auth_id = auth.auth_id
      LEFT JOIN facility f ON e.facility_id = f.facility_id

      -- Packages claimed (approved courier requests)
      LEFT JOIN (
        SELECT
          courier_id,
          COUNT(*) as count
        FROM courier_package_request
        WHERE request_status = 'approved'
          AND review_date BETWEEN ? AND ?
        GROUP BY courier_id
      ) packages_claimed ON e.employee_id = packages_claimed.courier_id

      -- Packages delivered by courier
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(DISTINCT package_id) as count
        FROM tracking_event
        WHERE event_type = 'delivered'
          AND event_time BETWEEN ? AND ?
        GROUP BY created_by
      ) packages_delivered ON auth.auth_id = packages_delivered.created_by

      -- Packages currently in transit for courier
      LEFT JOIN (
        SELECT
          courier_id,
          COUNT(*) as count
        FROM package
        WHERE package_status = 'in-transit'
          AND courier_id IS NOT NULL
        GROUP BY courier_id
      ) packages_in_transit ON e.employee_id = packages_in_transit.courier_id

      -- Currently holding (all non-completed packages)
      LEFT JOIN (
        SELECT
          courier_id,
          COUNT(*) as count
        FROM package
        WHERE courier_id IS NOT NULL
          AND package_status NOT IN ('delivered', 'returned', 'lost', 'undeliverable')
        GROUP BY courier_id
      ) currently_holding ON e.employee_id = currently_holding.courier_id

      -- Total moves (all tracking events by courier in date range)
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(*) as count
        FROM tracking_event
        WHERE event_time BETWEEN ? AND ?
        GROUP BY created_by
      ) total_moves ON auth.auth_id = total_moves.created_by

      -- Facility transfers (deliveries where location_id matches a facility address)
      LEFT JOIN (
        SELECT
          te.created_by,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        INNER JOIN facility f ON te.location_id = f.address_id
        WHERE te.event_type = 'delivered'
          AND te.event_time BETWEEN ? AND ?
        GROUP BY te.created_by
      ) facility_transfers ON auth.auth_id = facility_transfers.created_by

      -- Final deliveries (deliveries NOT to facilities)
      LEFT JOIN (
        SELECT
          te.created_by,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        LEFT JOIN facility f ON te.location_id = f.address_id
        WHERE te.event_type = 'delivered'
          AND te.event_time BETWEEN ? AND ?
          AND f.facility_id IS NULL
        GROUP BY te.created_by
      ) final_deliveries ON auth.auth_id = final_deliveries.created_by

      -- Problem packages (packages where courier was last courier to handle before problem status)
      LEFT JOIN (
        SELECT
          last_courier.employee_id as courier_id,
          COUNT(DISTINCT p.package_id) as count
        FROM package p
        LEFT JOIN (
          SELECT te.package_id, e.employee_id
          FROM tracking_event te
          INNER JOIN authentication auth ON te.created_by = auth.auth_id
          INNER JOIN employee e ON auth.auth_id = e.auth_id
          WHERE e.account_type = 'courier'
            AND te.event_time = (
              SELECT MAX(te2.event_time)
              FROM tracking_event te2
              INNER JOIN authentication auth2 ON te2.created_by = auth2.auth_id
              INNER JOIN employee e2 ON auth2.auth_id = e2.auth_id
              WHERE te2.package_id = te.package_id
                AND e2.account_type = 'courier'
            )
        ) last_courier ON p.package_id = last_courier.package_id
        WHERE p.package_status IN ('lost', 'undeliverable', 'failed-delivery', 'damaged')
          AND last_courier.employee_id IS NOT NULL
        GROUP BY last_courier.employee_id
      ) packages_lost ON e.employee_id = packages_lost.courier_id

      -- Late delivery packages (packages where courier was last to handle)
      LEFT JOIN (
        SELECT
          last_courier.employee_id as courier_id,
          COUNT(DISTINCT p.package_id) as count
        FROM package p
        LEFT JOIN (
          SELECT te.package_id, e.employee_id
          FROM tracking_event te
          INNER JOIN authentication auth ON te.created_by = auth.auth_id
          INNER JOIN employee e ON auth.auth_id = e.auth_id
          WHERE e.account_type = 'courier'
            AND te.event_time = (
              SELECT MAX(te2.event_time)
              FROM tracking_event te2
              INNER JOIN authentication auth2 ON te2.created_by = auth2.auth_id
              INNER JOIN employee e2 ON auth2.auth_id = e2.auth_id
              WHERE te2.package_id = te.package_id
                AND e2.account_type = 'courier'
            )
        ) last_courier ON p.package_id = last_courier.package_id
        WHERE p.package_status = 'late-delivery'
          AND last_courier.employee_id IS NOT NULL
        GROUP BY last_courier.employee_id
      ) packages_late_delivery ON e.employee_id = packages_late_delivery.courier_id

      -- Average delivery time
      LEFT JOIN (
        SELECT
          te.created_by,
          AVG(DATEDIFF(te.event_time, p.created_at)) as avg_delivery_days
        FROM tracking_event te
        INNER JOIN package p ON te.package_id = p.package_id
        WHERE te.event_type = 'delivered'
          AND te.event_time BETWEEN ? AND ?
        GROUP BY te.created_by
      ) delivery_time_stats ON auth.auth_id = delivery_time_stats.created_by

      -- Average time between moves (courier-specific calculation)
      LEFT JOIN (
        SELECT
          created_by,
          AVG(time_diff) as avg_time_between_moves
        FROM (
          SELECT
            created_by,
            package_id,
            event_time,
            LAG(event_time) OVER (PARTITION BY created_by, package_id ORDER BY event_time) as prev_event_time,
            TIMESTAMPDIFF(HOUR, LAG(event_time) OVER (PARTITION BY created_by, package_id ORDER BY event_time), event_time) as time_diff
          FROM tracking_event
          WHERE event_time BETWEEN ? AND ?
        ) time_diffs
        WHERE time_diff IS NOT NULL
        GROUP BY created_by
      ) move_time_stats ON auth.auth_id = move_time_stats.created_by

      -- On-time deliveries (within 7 days)
      LEFT JOIN (
        SELECT
          te.created_by,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        INNER JOIN package p ON te.package_id = p.package_id
        WHERE te.event_type = 'delivered'
          AND te.event_time BETWEEN ? AND ?
          AND DATEDIFF(te.event_time, p.created_at) <= 7
        GROUP BY te.created_by
      ) on_time_deliveries ON auth.auth_id = on_time_deliveries.created_by

      -- Requests approved
      LEFT JOIN (
        SELECT
          courier_id,
          COUNT(*) as count
        FROM courier_package_request
        WHERE request_status = 'approved'
          AND review_date BETWEEN ? AND ?
        GROUP BY courier_id
      ) requests_approved ON e.employee_id = requests_approved.courier_id

      -- Requests rejected
      LEFT JOIN (
        SELECT
          courier_id,
          COUNT(*) as count
        FROM courier_package_request
        WHERE request_status = 'rejected'
          AND review_date BETWEEN ? AND ?
        GROUP BY courier_id
      ) requests_rejected ON e.employee_id = requests_rejected.courier_id

      WHERE e.account_type = 'courier'
        AND (IFNULL(packages_claimed.count, 0) > 0 OR IFNULL(packages_delivered.count, 0) > 0 OR IFNULL(total_moves.count, 0) > 0)
      ORDER BY packages_delivered DESC
    `;

    const [rows] = await connection.execute(sql, [
      endDate, startDate,  // DATEDIFF for packages_per_day (1st)
      endDate, startDate,  // DATEDIFF for packages_per_day (2nd)
      startDate, endDate,  // packages_claimed
      startDate, endDate,  // packages_delivered
      startDate, endDate,  // total_moves
      startDate, endDate,  // facility_transfers
      startDate, endDate,  // final_deliveries
      startDate, endDate,  // delivery_time_stats
      startDate, endDate,  // move_time_stats
      startDate, endDate,  // on_time_deliveries
      startDate, endDate,  // requests_approved
      startDate, endDate   // requests_rejected
    ]);

    // Calculate summary statistics
    const totalClaimed = rows.reduce((sum, row) => sum + row.packages_claimed, 0);
    const totalDelivered = rows.reduce((sum, row) => sum + row.packages_delivered, 0);
    const totalInTransit = rows.reduce((sum, row) => sum + row.packages_in_transit, 0);
    const totalLost = rows.reduce((sum, row) => sum + row.packages_lost, 0);
    const totalLateDelivery = rows.reduce((sum, row) => sum + row.packages_late_delivery, 0);
    const totalFacilityTransfers = rows.reduce((sum, row) => sum + row.facility_transfers, 0);
    const totalFinalDeliveries = rows.reduce((sum, row) => sum + row.final_deliveries, 0);
    const totalApproved = rows.reduce((sum, row) => sum + row.requests_approved, 0);
    const totalRejected = rows.reduce((sum, row) => sum + row.requests_rejected, 0);
    const totalRequests = totalApproved + totalRejected;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      couriers: rows,
      count: rows.length,
      summary: {
        total_claimed: totalClaimed,
        total_delivered: totalDelivered,
        total_in_transit: totalInTransit,
        total_lost: totalLost,
        total_late_delivery: totalLateDelivery,
        total_facility_transfers: totalFacilityTransfers,
        total_final_deliveries: totalFinalDeliveries,
        overall_delivery_rate: totalClaimed > 0 ? ((totalDelivered / totalClaimed) * 100).toFixed(2) : '0',
        overall_approval_rate: totalRequests > 0 ? ((totalApproved / totalRequests) * 100).toFixed(2) : '0'
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
