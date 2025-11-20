import pool from '../config/database.js';
import { sendFlaggingNotification } from '../utils/sendNotification.js';

export const processNotificationQueue = async () => {
    let connection;

    try {
        connection = await pool.getConnection();

        const [pendingNotifications] = await connection.execute (
            `SELECT *
            FROM notification_queue
            WHERE status = 'pending'
            AND attempts < 3
            ORDER BY created_at ASC
            LIMIT 10`
        );

        if (pendingNotifications.length === 0) {
            return { success: true, process: 0, message: 'No pending emails' };
        }

        let successCount = 0;
        let failCount = 0;

        for (const notifications of pendingNotifications) {
            try {
                let emailResult;

                emailResult = await sendFlaggingNotification(notifications.recipient_email, notifications.recipient_name, notifications.notificationType);
                
                if (emailResult && emailResult.success) {
                    await connection.execute (
                        `UPDATE notification_queue
                        SET status = 'sent',
                        sent_at = CURRENT_TIMESTAMP,
                        attempts = attempts+1
                        WHERE notification_id = ?`,
                        [notifications.notification_id]
                    );
                    successCount++;
                    console.log(`Email sent: ${notification.recepient_email} - ${notification.notificationType}`)
                } else {
                    throw new Error(emailResult.error);
                }
            } catch (error) {
                const newAttempts = notifications.attempts + 1;
                const newStatus = newAttempts >= 3 ? 'failed' : 'pending';

                await connection.execute(
                    `UPDATE notification_queue
                    SET status = ?, 
                    attempts = ?,
                    error_message = ?
                WHERE queue_id = ?`,
                [newStatus, newAttempts, error.message, notifications.notification_id]
                );
                failCount++;
                console.error(`Email failed: ${email.recepient_email} - ${error.message}`);
            }
        }
        return {
            success: true,
            proccessed: pendingNotifications.length,
            successful: successCount,
            failed: failCount
        };
    } catch (error) {
        console.error('Notification queue processing error:', error);
        return { success: false, error: error.message };
    } finally {
        if (connection) connection.release();
    }
};

export const processNotificationQueueController = async (req, res) => {
  try {
    const result = await processNotificationQueue();
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (error) {
    console.error('Process email queue error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
};