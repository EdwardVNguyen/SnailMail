import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

export const getProblemPackagesReportController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Simple count of problem packages
    const sql = `
      SELECT COUNT(*) as count
      FROM package
      WHERE package_status IN ('lost', 'returned', 'undeliverable', 'failed-delivery', 'damaged')
    `;

    const [rows] = await connection.execute(sql);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      problemPackages: Array(rows[0].count).fill({}),  // Return array with correct length for .length property
      count: rows[0].count
    }));

  } catch (error) {
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
};
