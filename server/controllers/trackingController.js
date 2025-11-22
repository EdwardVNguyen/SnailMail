import pool from '../config/database.js';
import { parse } from 'url';

export const trackingController = async (req, res) => {
    // Parse the URL to separate path and query string
    const url_obj = parse(req.url, true);
    const pathname = url_obj.pathname;
    
    // Split the pathname to get tracking number
    const url_parts = pathname.split('/');
    const trackingNumber = url_parts[2];
    const authId = url_obj.query.authId;

    //validate tracking number
    if (!trackingNumber) {
        res.StatusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Tracking number is required' }));
        return;
    }
    let connection;
    try {
        connection = await pool.getConnection();

        //get package details from database (excluding courier info for privacy)
        const package_sql = `
            SELECT
              p.package_id,
              p.tracking_number,
              p.package_type,
              p.weight,
              p.length,
              p.width,
              p.height,
              p.package_status,
              p.created_at,
              p.last_updated,
              a.street_name,
              a.city_name,
              a.state_name,
              a.zip_code,
              c.first_name,
              c.last_name
            FROM package p
            LEFT JOIN customer c ON p.recipient_id = c.customer_id
            LEFT JOIN address a ON c.address_id = a.address_id
            WHERE p.tracking_number = ?
        `;

        const [package_results] = await connection.execute(package_sql, [trackingNumber]);
        if (package_results.length === 0) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Package not found' }));
            return;
        }
        const package_data = package_results[0];

        //get tracking events from database
        const tracking_sql = `
            SELECT
                te.*,
                a.street_name,
                a.city_name,
                a.state_name,
                a.zip_code
            FROM tracking_event te
            LEFT JOIN address a ON te.location_id = a.address_id
            WHERE te.package_id = ?
            ORDER BY te.event_time DESC
        `;
        const [tracking_results] = await connection.execute(tracking_sql, [package_data.package_id]);

        //successful response
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: true,
            package: package_data,
            tracking_events: tracking_results
        }));
    } catch (error) {
        console.error('Database query error:', error);
        console.error('error stack:', error.stack);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
        success: false,
        message: 'Internal server error'
        }));
    } finally {
        connection.release();
    }
}
