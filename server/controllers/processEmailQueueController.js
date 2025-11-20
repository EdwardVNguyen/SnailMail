import pool from '../config/database.js';
import { sendPackageCreatedEmail } from '../utils/sendEmail.js';
import { sendPackageIssueEmail } from '../utils/sendEmail.js';

export const processEmailQueue = async () => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // Get pending emails (limit to 10 at a time to avoid overload)
    const [pendingEmails] = await connection.execute(
      `SELECT * FROM email_queue 
       WHERE status = 'pending' 
       AND attempts < 3
       ORDER BY created_at ASC 
       LIMIT 10`
    );

    if (pendingEmails.length === 0) {
      return { success: true, processed: 0, message: 'No pending emails' };
    }

    let successCount = 0;
    let failCount = 0;

    // Process each email
    for (const email of pendingEmails) {
      try {
        // Send email based on type
        let emailResult;

        if (email.email_type === 'package_created') {
          emailResult = await sendPackageCreatedEmail(
            email.recipient_email,
            email.tracking_number,
            email.recipient_name
          );
        } else if (email.email_type === 'package_issue') {
          // Query package table to get current status
          const [packageInfo] = await connection.execute(
            `SELECT package_status FROM package WHERE tracking_number = ?`,
            [email.tracking_number]
          );

          if (packageInfo.length === 0) {
            throw new Error('Package not found');
          }

          const packageStatus = packageInfo[0].package_status;

          // Send customized email based on current status
          emailResult = await sendPackageIssueEmail(
            email.recipient_email,
            email.tracking_number,
            email.recipient_name,
            packageStatus
          );
        } else {
          // Generic email with subject and body
          throw new Error('Unsupported email type. Please add email_type field to email_queue entries.');
        }

        if (emailResult && emailResult.success) {
          // Mark as sent
          await connection.execute(
            `UPDATE email_queue
             SET status = 'sent',
                 sent_at = CURRENT_TIMESTAMP,
                 attempts = attempts + 1
             WHERE email_id = ?`,
            [email.email_id]
          );
          successCount++;
          console.log(`Email sent: ${email.recipient_email} - ${email.tracking_number}`);
        } else {
          throw new Error(emailResult.error);
        }
      } catch (error) {
        // Mark as failed or increment attempts
        const newAttempts = (email.attempts || 0) + 1;
        const newStatus = newAttempts >= 3 ? 'failed' : 'pending';

        // Debug: Log the email object to see what fields it has
        console.log('Email object:', JSON.stringify(email, null, 2));
        console.log('Update parameters:', { newStatus, newAttempts, errorMessage: error.message || null, emailId: email.email_id });

        await connection.execute(
          `UPDATE email_queue
           SET status = ?,
               attempts = ?,
               error_message = ?
           WHERE email_id = ?`,
          [newStatus, newAttempts, error.message || null, email.email_id]
        );
        failCount++;
        console.error(`Email failed: ${email.recipient_email} - ${error.message}`);
      }
    }

    return {
      success: true,
      processed: pendingEmails.length,
      successful: successCount,
      failed: failCount
    };

  } catch (error) {
    console.error('Email queue processing error:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) connection.release();
  }
};

// Manual endpoint to trigger email processing (for testing)
export const processEmailQueueController = async (req, res) => {
  try {
    const result = await processEmailQueue();
    
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