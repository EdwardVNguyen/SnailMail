import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';

export const getAvailablePackagesForCourierController = async (req, res) => {
  let connection;
  try {
    const body = await getJSONRequestBody(req);
    const { authId } = body;

    if (!authId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Auth ID required' }));
      return;
    }

    connection = await pool.getConnection();

    // Get courier's facility_id and employee_id
    const [courierRows] = await connection.execute(
      'SELECT facility_id, employee_id FROM employee WHERE auth_id = ?',
      [authId]
    );

    if (courierRows.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Courier not found' }));
      return;
    }

    const courierFacilityId = courierRows[0].facility_id;
    const courierId = courierRows[0].employee_id;

    // Get packages that are 'processing' at courier's facility and not assigned to any courier
    // Exclude packages that this courier has already requested
    const query = `
      SELECT
        p.package_id,
        p.tracking_number,
        p.package_status,
        p.weight,
        CONCAT(sender.first_name, ' ', sender.last_name) as sender_name,
        CONCAT(recipient.first_name, ' ', recipient.last_name) as recipient_name,
        recipient_addr.street_name as recipient_street,
        recipient_addr.city_name as recipient_city,
        recipient_addr.state_name as recipient_state,
        f.facility_name,
        f.facility_id
      FROM package p
      LEFT JOIN customer sender ON p.sender_id = sender.customer_id
      LEFT JOIN customer recipient ON p.recipient_id = recipient.customer_id
      LEFT JOIN address recipient_addr ON recipient.address_id = recipient_addr.address_id
      LEFT JOIN facility f ON p.facility_id = f.facility_id
      WHERE p.facility_id = ?
      AND p.package_status = 'processing'
      AND p.courier_id IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM courier_package_request cpr
        WHERE cpr.package_id = p.package_id
        AND cpr.courier_id = ?
        AND cpr.request_status = 'pending'
      )
      ORDER BY p.created_at DESC
    `;

    const [packages] = await connection.execute(query, [courierFacilityId, courierId]);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, packages }));
  }
  catch (error) {
    console.error('Error fetching available packages:', error);
    badServerRequest(res);
  }
  finally {
    if (connection) connection.release();
  }
};
