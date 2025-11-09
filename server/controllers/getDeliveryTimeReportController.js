import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getDeliveryTimeReportController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Parse query parameters for date range
    const queryObject = url.parse(req.url, true).query;
    const endDate = queryObject.endDate;
    const startDate = queryObject.startDate;

    // Get average delivery time statistics
    const sql = `
      SELECT
        p.package_id,
        p.recipient_name,
        p.package_type,
        p.package_status,
        p.created_at as ship_date,
        p.last_updated,
        DATEDIFF(p.last_updated, p.created_at) as delivery_days,
        CONCAT(sa.city_name, ', ', sa.state_name) as origin,
        CONCAT(ra.city_name, ', ', ra.state_name) as destination
      FROM package p
      LEFT JOIN address sa ON p.sender_address_id = sa.address_id
      LEFT JOIN address ra ON p.recipient_address_id = ra.address_id
      WHERE p.package_status = 'Delivered'
        AND p.last_updated BETWEEN ? AND ?
      ORDER BY delivery_days DESC
      LIMIT 100
    `;

    const [rows] = await connection.execute(sql, [endDate, startDate]);

    // Calculate average
    let totalDays = 0;
    let minDays = rows.length > 0 ? rows[0].delivery_days : 0;
    let maxDays = 0;

    rows.forEach(row => {
      totalDays += row.delivery_days;
      if (row.delivery_days < minDays) minDays = row.delivery_days;
      if (row.delivery_days > maxDays) maxDays = row.delivery_days;
    });

    const avgDays = rows.length > 0 ? (totalDays / rows.length).toFixed(2) : 0;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      packages: rows,
      stats: {
        average_days: avgDays,
        min_days: minDays,
        max_days: maxDays,
        total_packages: rows.length
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
