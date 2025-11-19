import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getClerkReportController = async (req, res) => {
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

    // Get comprehensive clerk statistics
    const sql = `
      SELECT
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as clerk_name,
        f.facility_name,

        -- Total reviews (approved + rejected courier requests)
        IFNULL(reviews_approved.count, 0) as reviews_approved,
        IFNULL(reviews_rejected.count, 0) as reviews_rejected,
        (IFNULL(reviews_approved.count, 0) + IFNULL(reviews_rejected.count, 0)) as total_reviews,

        -- Approval rate
        CASE
          WHEN (IFNULL(reviews_approved.count, 0) + IFNULL(reviews_rejected.count, 0)) > 0
          THEN ROUND((IFNULL(reviews_approved.count, 0) / (IFNULL(reviews_approved.count, 0) + IFNULL(reviews_rejected.count, 0))) * 100, 2)
          ELSE 0
        END as approval_rate,

        -- Tracking events created by type
        IFNULL(events_processing.count, 0) as events_processing,
        IFNULL(events_out_for_delivery.count, 0) as events_out_for_delivery,
        IFNULL(events_delivered.count, 0) as events_delivered,
        IFNULL(events_total.count, 0) as events_total,

        -- Problem events (lost, returned, undeliverable, failed-delivery, damaged)
        IFNULL(events_problem.count, 0) as problem_packages,

        -- Unique packages processed (via tracking events)
        IFNULL(unique_packages.count, 0) as unique_packages_processed,

        -- Average review time in hours
        IFNULL(review_time.avg_hours, 0) as avg_review_time_hours,

        -- Activity rate (reviews + events) per day
        CASE
          WHEN DATEDIFF(?, ?) > 0
          THEN ROUND((IFNULL(reviews_approved.count, 0) + IFNULL(reviews_rejected.count, 0) + IFNULL(events_total.count, 0)) / DATEDIFF(?, ?), 2)
          ELSE 0
        END as activity_per_day

      FROM employee e
      LEFT JOIN facility f ON e.facility_id = f.facility_id
      LEFT JOIN authentication auth ON e.auth_id = auth.auth_id

      -- Approved reviews
      LEFT JOIN (
        SELECT
          reviewed_by,
          COUNT(*) as count
        FROM courier_package_request
        WHERE request_status = 'approved'
          AND review_date BETWEEN ? AND ?
        GROUP BY reviewed_by
      ) reviews_approved ON e.employee_id = reviews_approved.reviewed_by

      -- Rejected reviews
      LEFT JOIN (
        SELECT
          reviewed_by,
          COUNT(*) as count
        FROM courier_package_request
        WHERE request_status = 'rejected'
          AND review_date BETWEEN ? AND ?
        GROUP BY reviewed_by
      ) reviews_rejected ON e.employee_id = reviews_rejected.reviewed_by

      -- Processing events
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(*) as count
        FROM tracking_event
        WHERE event_type = 'processing'
          AND event_time BETWEEN ? AND ?
        GROUP BY created_by
      ) events_processing ON auth.auth_id = events_processing.created_by

      -- Out for delivery events
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(*) as count
        FROM tracking_event
        WHERE event_type = 'out-for-delivery'
          AND event_time BETWEEN ? AND ?
        GROUP BY created_by
      ) events_out_for_delivery ON auth.auth_id = events_out_for_delivery.created_by

      -- Delivered events
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(*) as count
        FROM tracking_event
        WHERE event_type = 'delivered'
          AND event_time BETWEEN ? AND ?
        GROUP BY created_by
      ) events_delivered ON auth.auth_id = events_delivered.created_by

      -- Total events
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(*) as count
        FROM tracking_event
        WHERE event_time BETWEEN ? AND ?
        GROUP BY created_by
      ) events_total ON auth.auth_id = events_total.created_by

      -- Problem packages (unique packages with problem events, excluding resolved ones)
      LEFT JOIN (
        SELECT
          te.created_by,
          COUNT(DISTINCT te.package_id) as count
        FROM tracking_event te
        INNER JOIN package p ON te.package_id = p.package_id
        WHERE te.event_type IN ('lost', 'undeliverable', 'failed-delivery', 'damaged')
          AND te.event_time BETWEEN ? AND ?
          AND p.package_status NOT IN ('delivered')
        GROUP BY te.created_by
      ) events_problem ON auth.auth_id = events_problem.created_by

      -- Unique packages processed
      LEFT JOIN (
        SELECT
          created_by,
          COUNT(DISTINCT package_id) as count
        FROM tracking_event
        WHERE event_time BETWEEN ? AND ?
        GROUP BY created_by
      ) unique_packages ON auth.auth_id = unique_packages.created_by

      -- Average review time
      LEFT JOIN (
        SELECT
          reviewed_by,
          AVG(TIMESTAMPDIFF(HOUR, request_date, review_date)) as avg_hours
        FROM courier_package_request
        WHERE request_status IN ('approved', 'rejected')
          AND review_date BETWEEN ? AND ?
        GROUP BY reviewed_by
      ) review_time ON e.employee_id = review_time.reviewed_by

      WHERE e.account_type = 'clerk'
        AND (IFNULL(reviews_approved.count, 0) + IFNULL(reviews_rejected.count, 0) > 0 OR IFNULL(events_total.count, 0) > 0)
      ORDER BY activity_per_day DESC
    `;

    const [rows] = await connection.execute(sql, [
      endDate, startDate,  // DATEDIFF for activity_per_day (1st)
      endDate, startDate,  // DATEDIFF for activity_per_day (2nd)
      startDate, endDate,  // reviews_approved
      startDate, endDate,  // reviews_rejected
      startDate, endDate,  // events_processing
      startDate, endDate,  // events_out_for_delivery
      startDate, endDate,  // events_delivered
      startDate, endDate,  // events_total
      startDate, endDate,  // events_problem
      startDate, endDate,  // unique_packages
      startDate, endDate   // review_time
    ]);

    // Calculate summary statistics
    const totalReviews = rows.reduce((sum, row) => sum + row.total_reviews, 0);
    const totalApproved = rows.reduce((sum, row) => sum + row.reviews_approved, 0);
    const totalRejected = rows.reduce((sum, row) => sum + row.reviews_rejected, 0);
    const totalEvents = rows.reduce((sum, row) => sum + row.events_total, 0);
    const totalProblemPackages = rows.reduce((sum, row) => sum + row.problem_packages, 0);
    const totalPackagesProcessed = rows.reduce((sum, row) => sum + row.unique_packages_processed, 0);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      clerks: rows,
      count: rows.length,
      summary: {
        total_reviews: totalReviews,
        total_approved: totalApproved,
        total_rejected: totalRejected,
        total_events: totalEvents,
        total_problem_packages: totalProblemPackages,
        total_packages_processed: totalPackagesProcessed,
        overall_approval_rate: totalReviews > 0 ? ((totalApproved / totalReviews) * 100).toFixed(2) : '0'
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
