import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getFacilityDetailsController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Parse query parameters
    const queryObject = url.parse(req.url, true).query;
    const facilityId = queryObject.facilityId;
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

    // Get facility information
    const [facilityInfo] = await connection.execute(
      `SELECT
        f.facility_id,
        f.facility_name,
        CONCAT(a.street_name, ', ', a.city_name, ', ', a.state_name, ' ', a.zip_code) as facility_address
      FROM facility f
      LEFT JOIN address a ON f.address_id = a.address_id
      WHERE f.facility_id = ?`,
      [facilityId]
    );

    if (facilityInfo.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Facility not found' }));
      return;
    }

    // Packages Received: all packages with tracking events at this facility in date range
    const [packagesReceived] = await connection.execute(
      `SELECT DISTINCT
        p.package_id,
        p.tracking_number,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.package_status,
        first_event.event_time as received_date,
        CONCAT(package_courier.first_name, ' ', package_courier.last_name) as courier_name
      FROM (
        SELECT
          te.package_id,
          MIN(te.event_time) as event_time
        FROM tracking_event te
        INNER JOIN address a ON te.location_id = a.address_id
        INNER JOIN facility f ON f.address_id = a.address_id
        WHERE f.facility_id = ?
          AND te.event_time BETWEEN ? AND ?
        GROUP BY te.package_id
      ) min_events
      INNER JOIN tracking_event first_event ON min_events.package_id = first_event.package_id
        AND min_events.event_time = first_event.event_time
      INNER JOIN package p ON first_event.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN authentication ON first_event.created_by = authentication.auth_id
      LEFT JOIN employee package_courier ON authentication.auth_id = package_courier.auth_id
      ORDER BY first_event.event_time DESC`,
      [facilityId, startDate, endDate]
    );

    // Packages Delivered: packages whose last tracking event was 'delivered' at this facility
    const [packagesDelivered] = await connection.execute(
      `SELECT
        p.package_id,
        p.tracking_number,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        te_latest.event_time as delivery_date,
        CONCAT(courier.first_name, ' ', courier.last_name) as delivered_by
      FROM package p
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      INNER JOIN (
        SELECT
          te.package_id,
          te.event_type,
          te.location_id,
          te.event_time,
          te.created_by
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
      ) te_latest ON p.package_id = te_latest.package_id
      INNER JOIN facility f ON te_latest.location_id = f.address_id
      LEFT JOIN authentication ON te_latest.created_by = authentication.auth_id
      LEFT JOIN employee courier ON authentication.auth_id = courier.auth_id
      WHERE te_latest.event_type = 'delivered'
        AND f.facility_id = ?
      ORDER BY te_latest.event_time DESC`,
      [startDate, endDate, facilityId]
    );

    // Problem Packages: all lost, undeliverable, failed-delivery, damaged packages at this facility
    const [packagesLost] = await connection.execute(
      `SELECT
        p.package_id,
        p.tracking_number,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.package_status,
        marked_by.event_time,
        CONCAT(marked_by.first_name, ' ', marked_by.last_name) as marked_by,
        CONCAT(last_courier.first_name, ' ', last_courier.last_name) as last_courier
      FROM package p
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      INNER JOIN facility f ON f.facility_id = ?
      -- Employee who marked it as lost/damaged (created the problem event)
      LEFT JOIN (
        SELECT te.package_id, e.first_name, e.last_name, te.event_time
        FROM tracking_event te
        INNER JOIN authentication auth ON te.created_by = auth.auth_id
        INNER JOIN employee e ON auth.auth_id = e.auth_id
        WHERE te.event_type IN ('lost', 'undeliverable', 'failed-delivery', 'damaged')
          AND te.event_time = (
            SELECT MAX(te2.event_time)
            FROM tracking_event te2
            WHERE te2.package_id = te.package_id
              AND te2.event_type IN ('lost', 'undeliverable', 'failed-delivery', 'damaged')
          )
      ) marked_by ON p.package_id = marked_by.package_id
      -- Last courier to handle this package
      LEFT JOIN (
        SELECT te.package_id, e.first_name, e.last_name
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
        AND p.facility_id = f.facility_id
        AND marked_by.event_time BETWEEN ? AND ?
      ORDER BY marked_by.event_time DESC`,
      [facilityId, startDate, endDate]
    );

    // Late Delivery Packages: packages delivered late at this facility
    const [packagesLateDelivery] = await connection.execute(
      `SELECT
        p.package_id,
        p.tracking_number,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        te_delivered.event_time as late_date,
        CONCAT(courier.first_name, ' ', courier.last_name) as delivered_by
      FROM package p
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      INNER JOIN facility f ON f.facility_id = ?
      LEFT JOIN (
        SELECT te.package_id, te.event_time, te.created_by
        FROM tracking_event te
        WHERE te.event_type = 'delivered'
          AND te.event_time = (
            SELECT MAX(te2.event_time)
            FROM tracking_event te2
            WHERE te2.package_id = te.package_id
              AND te2.event_type = 'delivered'
          )
      ) te_delivered ON p.package_id = te_delivered.package_id
      LEFT JOIN authentication ON te_delivered.created_by = authentication.auth_id
      LEFT JOIN employee courier ON authentication.auth_id = courier.auth_id
      WHERE p.package_status = 'late-delivery'
        AND p.facility_id = f.facility_id
        AND p.last_updated BETWEEN ? AND ?
      ORDER BY p.last_updated DESC`,
      [facilityId, startDate, endDate]
    );

    // Status: In-Transit (packages with status 'in-transit' at this facility)
    const [statusInTransit] = await connection.execute(
      `SELECT
        p.package_id,
        p.tracking_number,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        latest_event.event_time,
        CONCAT(courier.first_name, ' ', courier.last_name) as courier_name
      FROM package p
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN employee courier ON p.courier_id = courier.employee_id
      LEFT JOIN (
        SELECT te.package_id, te.event_time
        FROM tracking_event te
        WHERE te.event_time = (
          SELECT MAX(te2.event_time)
          FROM tracking_event te2
          WHERE te2.package_id = te.package_id
        )
      ) latest_event ON p.package_id = latest_event.package_id
      WHERE p.package_status = 'in-transit'
        AND EXISTS (
          SELECT 1 FROM tracking_event te
          INNER JOIN facility f ON te.location_id = f.address_id
          WHERE te.package_id = p.package_id
            AND f.facility_id = ?
            AND te.event_time = (
              SELECT MAX(te2.event_time)
              FROM tracking_event te2
              WHERE te2.package_id = p.package_id
            )
        )
      ORDER BY latest_event.event_time DESC`,
      [facilityId]
    );

    // Status: Out-for-Delivery
    const [statusOutForDelivery] = await connection.execute(
      `SELECT
        p.package_id,
        p.tracking_number,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.weight,
        p.package_status,
        latest_event.event_time,
        CONCAT(courier.first_name, ' ', courier.last_name) as courier_name
      FROM package p
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN employee courier ON p.courier_id = courier.employee_id
      LEFT JOIN (
        SELECT te.package_id, te.event_time
        FROM tracking_event te
        WHERE te.event_time = (
          SELECT MAX(te2.event_time)
          FROM tracking_event te2
          WHERE te2.package_id = te.package_id
        )
      ) latest_event ON p.package_id = latest_event.package_id
      WHERE p.package_status = 'out-for-delivery'
        AND EXISTS (
          SELECT 1 FROM tracking_event te
          INNER JOIN facility f ON te.location_id = f.address_id
          WHERE te.package_id = p.package_id
            AND f.facility_id = ?
            AND te.event_time = (
              SELECT MAX(te2.event_time)
              FROM tracking_event te2
              WHERE te2.package_id = p.package_id
            )
        )
      ORDER BY latest_event.event_time DESC`,
      [facilityId]
    );

    // Packages Sent: packages that left this facility for another facility
    const [packagesSent] = await connection.execute(
      `SELECT DISTINCT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.package_status,
        f_to.facility_name as destination_facility,
        te_dest.event_time as sent_time
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
      INNER JOIN package p ON te_dest.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      WHERE f_from.facility_id = ?
        AND f_from.facility_id != f_to.facility_id
        AND te_dest.event_time BETWEEN ? AND ?
      ORDER BY te_dest.event_time DESC`,
      [facilityId, startDate, endDate]
    );

    // Clerk Created Events: most recent tracking event per package created by clerks at this facility
    const [clerkCreatedEvents] = await connection.execute(
      `SELECT DISTINCT
        p.tracking_number,
        p.package_id,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        p.package_type,
        p.package_status,
        latest_event.event_time,
        CONCAT(clerk.first_name, ' ', clerk.last_name) as clerk_name
      FROM (
        SELECT
          te.package_id,
          te.event_type,
          te.event_time,
          te.created_by,
          te.location_id
        FROM tracking_event te
        INNER JOIN (
          SELECT
            te2.package_id,
            MAX(te2.event_time) as max_event_time
          FROM tracking_event te2
          INNER JOIN address a2 ON te2.location_id = a2.address_id
          INNER JOIN facility f2 ON f2.address_id = a2.address_id
          LEFT JOIN authentication auth2 ON te2.created_by = auth2.auth_id
          LEFT JOIN employee e2 ON auth2.auth_id = e2.auth_id
          WHERE f2.facility_id = ?
            AND te2.event_time BETWEEN ? AND ?
            AND e2.account_type = 'clerk'
          GROUP BY te2.package_id
        ) latest ON te.package_id = latest.package_id
               AND te.event_time = latest.max_event_time
      ) latest_event
      INNER JOIN address a ON latest_event.location_id = a.address_id
      INNER JOIN facility f ON f.address_id = a.address_id
      INNER JOIN package p ON latest_event.package_id = p.package_id
      INNER JOIN customer sender ON p.sender_id = sender.customer_id
      INNER JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN authentication ON latest_event.created_by = authentication.auth_id
      LEFT JOIN employee clerk ON authentication.auth_id = clerk.auth_id
      WHERE f.facility_id = ?
      ORDER BY latest_event.event_time DESC`,
      [facilityId, startDate, endDate, facilityId]
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      facility: facilityInfo[0],
      details: {
        packagesReceived,
        packagesDelivered,
        packagesLost,
        packagesLateDelivery,
        packagesSent,
        statusInTransit,
        statusOutForDelivery,
        clerkCreatedEvents
      }
    }));

  } catch (error) {
    console.error('Facility details query failed', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
};
