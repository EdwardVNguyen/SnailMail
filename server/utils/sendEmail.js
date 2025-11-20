import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send package created email
export const sendPackageCreatedEmail = async (recipientEmail, trackingNumber, recipientName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SnailMail Shipping" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Your Package Has Been Created - Tracking Number Inside',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .header {
              background: linear-gradient(135deg, #3C467B 0%, #636CCB 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .tracking-box {
              background-color: #f0f0f0;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .tracking-number {
              font-size: 24px;
              font-weight: bold;
              color: #3C467B;
              font-family: monospace;
              letter-spacing: 2px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #3C467B;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Package Created Successfully</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName || 'Customer'},</p>
              
              <p>Great news! A package has been created and is on its way to you.</p>
              
              <div class="tracking-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your Tracking Number:</p>
                <div class="tracking-number">${trackingNumber}</div>
              </div>
              
              <p>You can use this tracking number to monitor your package's journey in real-time.</p>
              
              <center>
                <a href="https://snail-mail-five.vercel.app/" class="button">Create an account or login with this email to view</a>
              </center>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <strong>What's Next?</strong><br>
                • Your package is being processed<br>
                • You'll receive updates as it moves through our network<br>
                • Expected delivery will be shown on the tracking page
              </p>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Thank you for choosing SnailMail!</p>
            </div>
            <div class="footer">
              <p>This is an automated message from SnailMail. Please do not reply to this email.</p>
              <p>&copy; 2025 SnailMail. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send package issue notification email
export const sendPackageIssueEmail = async (recipientEmail, trackingNumber, recipientName, packageStatus) => {
  try {
    const transporter = await createTransporter();

    // Customize message based on status
    let statusTitle, statusMessage, statusColor;
    
    switch(packageStatus) {
      case 'lost':
        statusTitle = 'Package Lost';
        statusMessage = 'We regret to inform you that your package could not be located in our system. Our team is investigating this matter.';
        statusColor = '#dc3545';
        break;
      case 'returned':
        statusTitle = 'Package Returned to Sender';
        statusMessage = 'Your package could not be delivered and is being returned to the sender.';
        statusColor = '#ffc107';
        break;
      case 'failed-delivery':
        statusTitle = 'Delivery Failed';
        statusMessage = 'We were unable to complete the delivery of your package. Please contact us for more information.';
        statusColor = '#dc3545';
        break;
      case 'damaged':
        statusTitle = 'Package Damaged';
        statusMessage = 'Unfortunately, your package was damaged during transit. Please contact our support team for assistance.';
        statusColor = '#dc3545';
        break;
      default:
        statusTitle = 'Package Status Update';
        statusMessage = 'There has been an update to your package status.';
        statusColor = '#6c757d';
    }

    const mailOptions = {
      from: `"SnailMail Shipping" <${process.env.EMAIL_USER || 'noreply@snailmail.com'}>`,
      to: recipientEmail,
      subject: `Important: ${statusTitle} - ${trackingNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .header {
              background-color: ${statusColor};
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .alert-box {
              background-color: #fff3cd;
              border-left: 4px solid ${statusColor};
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .tracking-box {
              background-color: #f0f0f0;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .tracking-number {
              font-size: 20px;
              font-weight: bold;
              color: #3C467B;
              font-family: monospace;
              letter-spacing: 2px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #3C467B;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 5px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
            .support-box {
              background-color: #e7f3ff;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusTitle}</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName || 'Customer'},</p>
              
              <div class="alert-box">
                <strong>Status Update:</strong><br>
                ${statusMessage}
              </div>
              
              <div class="tracking-box">
                <p style="margin: 0 0 10px 0; color: #666;">Tracking Number:</p>
                <div class="tracking-number">${trackingNumber}</div>
              </div>
              
              <div class="support-box">
                <h3 style="margin-top: 0;">Need Help?</h3>
                <p>Our customer support team is here to assist you with this issue.</p>
                <ul style="margin: 10px 0;">
                  <li>Call us: 1-800-SNAILMAIL</li>
                  <li>Email: support@snailmail.com</li>
                  <li>Hours: Mon-Fri 9AM-5PM</li>
                </ul>
              </div>
              
              <center>
                <a href="https://snail-mail-five.vercel.app/" class="button">Track Package</a>
                <a href="https://snail-mail-five.vercel.app/support" class="button">Contact Support</a>
              </center>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                We sincerely apologize for any inconvenience this may cause. Our team is working to resolve this matter as quickly as possible.
              </p>
              
              <p>Thank you for your patience and understanding.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from SnailMail. Please do not reply to this email.</p>
              <p>&copy; 2025 SnailMail. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};