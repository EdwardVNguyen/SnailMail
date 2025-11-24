import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';
import url from 'url';

export const getTransactionReportController = async (req, res) => {
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

    // Get transaction data with facility, package, and customer information
    const transactionSql = `
      SELECT
        t.transaction_id,
        t.date_time as transaction_date,
        t.cost_fee as transaction_amount,
        f.facility_id,
        f.facility_name,
        p.package_id,
        p.tracking_number,
        p.package_type,
        p.package_status,
        c.customer_id,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name
      FROM transaction t
      INNER JOIN package p ON t.package_id = p.package_id
      INNER JOIN facility f ON p.facility_id = f.facility_id
      INNER JOIN customer c ON p.sender_id = c.customer_id
      WHERE t.date_time BETWEEN ? AND ?
      ORDER BY t.date_time DESC
    `;

    const [transactions] = await connection.execute(transactionSql, [startDate, endDate]);

    // Add refund information for late-delivery packages
    const processedTransactions = transactions.map(transaction => {
      const isLateDelivery = transaction.package_status === 'late-delivery';
      const refundAmount = isLateDelivery ? transaction.transaction_amount * 0.25 : 0;
      const finalAmount = transaction.transaction_amount - refundAmount;

      return {
        ...transaction,
        is_late_delivery: isLateDelivery,
        refund_amount: refundAmount,
        refund_reason: isLateDelivery ? 'Late delivery - 25% refund applied' : null,
        final_amount: finalAmount
      };
    });

    // Calculate total refunds for late deliveries
    const totalRefunds = processedTransactions.reduce((sum, t) => sum + t.refund_amount, 0);

    // Calculate summary statistics
    const summarySql = `
      SELECT
        COUNT(*) as total_transactions,
        IFNULL(SUM(t.cost_fee), 0) as total_revenue,
        IFNULL(AVG(t.cost_fee), 0) as avg_transaction_amount,
        COUNT(DISTINCT p.facility_id) as facilities_involved,
        COUNT(DISTINCT p.sender_id) as unique_customers
      FROM transaction t
      INNER JOIN package p ON t.package_id = p.package_id
      WHERE t.date_time BETWEEN ? AND ?
    `;

    const [[summary]] = await connection.execute(summarySql, [startDate, endDate]);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      transactions: processedTransactions,
      summary: {
        total_transactions: summary.total_transactions,
        total_revenue: parseFloat(summary.total_revenue),
        total_refunds: parseFloat(totalRefunds.toFixed(2)),
        net_revenue: parseFloat((summary.total_revenue - totalRefunds).toFixed(2)),
        avg_transaction_amount: parseFloat(summary.avg_transaction_amount),
        facilities_involved: summary.facilities_involved,
        unique_customers: summary.unique_customers,
        late_deliveries: processedTransactions.filter(t => t.is_late_delivery).length
      }
    }));

  } catch (error) {
    console.error('Error fetching transaction report:', error);
    badServerRequest(res);
  } finally {
    connection.release();
  }
};
