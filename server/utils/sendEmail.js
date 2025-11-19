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
                <a href="http://localhost:3000" class="button">Create an account or login with this email to view</a>
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