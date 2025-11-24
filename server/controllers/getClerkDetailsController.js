import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getClerkDetailsController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Parse query parameters
    const queryObject = url.parse(req.url, true).query;
    const employeeId = queryObject.employeeId;
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

    // Get clerk information
    const [clerkInfo] = await connection.execute(
      `SELECT
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as clerk_name,
        f.facility_name
      FROM employee e
      LEFT JOIN facility f ON e.facility_id = f.facility_id
      WHERE e.employee_id = ? AND e.account_type = 'clerk'`,
      [employeeId]
    );

    if (clerkInfo.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Clerk not found' }));
      return;
    }

    // Get auth_id for this clerk
    const [authInfo] = await connection.execute(
      `SELECT auth_id FROM employee WHERE employee_id = ?`,
      [employeeId]
    );
    const authId = authInfo[0]?.auth_id;

    // Reviews Approved
    const [reviewsApproved] = await connection.execute(
      `SELECT
        cpr.request_id,
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        cpr.review_date,
        CONCAT(courier.first_name, ' ', courier.last_name) as courier_name
      FROM courier_package_request cpr
      INNER JOIN package p ON cpr.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      INNER JOIN employee courier ON cpr.courier_id = courier.employee_id
      WHERE cpr.reviewed_by = ?
        AND cpr.request_status = 'approved'
        AND cpr.review_date BETWEEN ? AND ?
      ORDER BY cpr.review_date DESC`,
      [employeeId, startDate, endDate]
    );

    // Reviews Rejected
    const [reviewsRejected] = await connection.execute(
      `SELECT
        cpr.request_id,
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        cpr.review_date,
        CONCAT(courier.first_name, ' ', courier.last_name) as courier_name
      FROM courier_package_request cpr
      INNER JOIN package p ON cpr.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      INNER JOIN employee courier ON cpr.courier_id = courier.employee_id
      WHERE cpr.reviewed_by = ?
        AND cpr.request_status = 'rejected'
        AND cpr.review_date BETWEEN ? AND ?
      ORDER BY cpr.review_date DESC`,
      [employeeId, startDate, endDate]
    );

    // Tracking Events Created
    const [trackingEvents] = await connection.execute(
      `SELECT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        te.event_type,
        te.event_time
      FROM tracking_event te
      INNER JOIN package p ON te.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      WHERE te.created_by = ?
        AND te.event_time BETWEEN ? AND ?
      ORDER BY te.event_time DESC`,
      [authId, startDate, endDate]
    );

    // Problem Packages (unique packages with problem events, excluding resolved ones)
    const [problemPackages] = await connection.execute(
      `SELECT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        MAX(te.event_type) as event_type,
        MAX(te.event_time) as event_time
      FROM tracking_event te
      INNER JOIN package p ON te.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      WHERE te.created_by = ?
        AND te.event_type IN ('lost', 'undeliverable', 'failed-delivery', 'damaged')
        AND te.event_time BETWEEN ? AND ?
        AND NOT EXISTS (
          SELECT 1 FROM tracking_event te_latest
          WHERE te_latest.package_id = p.package_id
            AND te_latest.event_type = 'delivered'
            AND te_latest.event_time = (
              SELECT MAX(te3.event_time) FROM tracking_event te3 WHERE te3.package_id = p.package_id
            )
        )
      GROUP BY p.package_id, p.tracking_number, sender_name, recipient_name, p.package_type, p.weight, p.package_status
      ORDER BY event_time DESC`,
      [authId, startDate, endDate]
    );

    // Packages Processed (unique packages this clerk created tracking events for)
    const [packagesProcessed] = await connection.execute(
      `SELECT DISTINCT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        MIN(te.event_time) as first_processed
      FROM tracking_event te
      INNER JOIN package p ON te.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      WHERE te.created_by = ?
        AND te.event_time BETWEEN ? AND ?
      GROUP BY p.package_id, p.tracking_number, sender_name, recipient_name, p.package_type, p.weight, p.package_status
      ORDER BY first_processed DESC`,
      [authId, startDate, endDate]
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      clerk: clerkInfo[0],
      details: {
        reviewsApproved,
        reviewsRejected,
        trackingEvents,
        problemPackages,
        packagesProcessed
      }
    }));

  } catch (error) {
    console.error('Clerk details query failed', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
};
