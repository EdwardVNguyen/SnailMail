import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getCourierDetailsController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Parse query parameters
    const queryObject = url.parse(req.url, true).query;
    const employeeId = queryObject.employeeId;
    let endDate = queryObject.endDate;
    let startDate = queryObject.startDate;

    // Ensure startDate is before endDate (swap if needed)
    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    // Add time to make startDate beginning of day and endDate end of day
    startDate = startDate + ' 00:00:00';
    endDate = endDate + ' 23:59:59';

    // Get courier information
    const [courierInfo] = await connection.execute(
      `SELECT
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as courier_name
      FROM employee e
      WHERE e.employee_id = ? AND e.account_type = 'courier'`,
      [employeeId]
    );

    if (courierInfo.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Courier not found' }));
      return;
    }

    // Get auth_id for this courier
    const [authInfo] = await connection.execute(
      `SELECT auth_id FROM employee WHERE employee_id = ?`,
      [employeeId]
    );
    const authId = authInfo[0]?.auth_id;

    // Packages Claimed (approved requests)
    const [packagesClaimed] = await connection.execute(
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
        CONCAT(clerk.first_name, ' ', clerk.last_name) as reviewed_by_name
      FROM courier_package_request cpr
      INNER JOIN package p ON cpr.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN employee clerk ON cpr.reviewed_by = clerk.employee_id
      WHERE cpr.courier_id = ?
        AND cpr.request_status = 'approved'
        AND cpr.review_date BETWEEN ? AND ?
      ORDER BY cpr.review_date DESC`,
      [employeeId, startDate, endDate]
    );

    // Packages Delivered
    const [packagesDelivered] = await connection.execute(
      `SELECT DISTINCT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        te.event_time as delivery_date
      FROM tracking_event te
      INNER JOIN package p ON te.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      WHERE te.created_by = ?
        AND te.event_type = 'delivered'
        AND te.event_time BETWEEN ? AND ?
      ORDER BY te.event_time DESC`,
      [authId, startDate, endDate]
    );

    // Facility Transfers (deliveries to facilities)
    const [facilityTransfers] = await connection.execute(
      `SELECT DISTINCT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        f.facility_name as destination_facility,
        te.event_time as delivery_time
      FROM tracking_event te
      INNER JOIN package p ON te.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      INNER JOIN facility f ON te.location_id = f.address_id
      WHERE te.created_by = ?
        AND te.event_type = 'delivered'
        AND te.event_time BETWEEN ? AND ?
      ORDER BY te.event_time DESC`,
      [authId, startDate, endDate]
    );

    // Packages In Transit (currently assigned)
    const [packagesInTransit] = await connection.execute(
      `SELECT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        p.last_updated
      FROM package p
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      WHERE p.courier_id = ?
        AND p.package_status = 'in-transit'
      ORDER BY p.last_updated DESC`,
      [employeeId]
    );

    // Packages Lost
    const [packagesLost] = await connection.execute(
      `SELECT DISTINCT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        te.event_time as lost_date
      FROM tracking_event te
      INNER JOIN package p ON te.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      WHERE te.created_by = ?
        AND te.event_type = 'lost'
        AND te.event_time BETWEEN ? AND ?
      ORDER BY te.event_time DESC`,
      [authId, startDate, endDate]
    );

    // Final Deliveries (deliveries to customers, not facilities)
    const [finalDeliveries] = await connection.execute(
      `SELECT DISTINCT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        te.event_time as delivery_time
      FROM tracking_event te
      INNER JOIN package p ON te.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN facility f ON te.location_id = f.address_id
      WHERE te.created_by = ?
        AND te.event_type = 'delivered'
        AND te.event_time BETWEEN ? AND ?
        AND f.facility_id IS NULL
      ORDER BY te.event_time DESC`,
      [authId, startDate, endDate]
    );

    // All Tracking Events
    const [allTrackingEvents] = await connection.execute(
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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      courier: courierInfo[0],
      details: {
        packagesClaimed,
        packagesDelivered,
        packagesInTransit,
        packagesLost,
        facilityTransfers,
        finalDeliveries,
        allTrackingEvents
      }
    }));

  } catch (error) {
    console.error('Courier details query failed', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
};
