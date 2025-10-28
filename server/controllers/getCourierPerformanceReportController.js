import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getCourierPerformanceReportController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Get courier performance statistics
    const sql = `
      SELECT
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as courier_name,
        e.phone_number,
        COUNT(p.package_id) as total_packages,
        SUM(CASE WHEN p.package_status = 'Delivered' THEN 1 ELSE 0 END) as delivered_packages,
        SUM(CASE WHEN p.package_status = 'In Transit' THEN 1 ELSE 0 END) as in_transit_packages,
        SUM(CASE WHEN p.package_status = 'Out for Delivery' THEN 1 ELSE 0 END) as out_for_delivery_packages,
        ROUND(SUM(CASE WHEN p.package_status = 'Delivered' THEN 1 ELSE 0 END) / NULLIF(COUNT(p.package_id), 0) * 100, 2) as delivery_rate,
        AVG(DATEDIFF(p.last_updated, p.created_at)) as avg_delivery_days
      FROM employee e
      LEFT JOIN package p ON e.employee_id = p.courier_id
      WHERE e.account_type = 'Courier'
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY e.employee_id, courier_name, e.phone_number
      HAVING total_packages > 0
      ORDER BY delivery_rate DESC, delivered_packages DESC
    `;

    const [rows] = await connection.execute(sql);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      couriers: rows,
      count: rows.length
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
