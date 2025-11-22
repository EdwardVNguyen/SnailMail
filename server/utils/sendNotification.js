import nodemailer from 'nodemailer';

// create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "snailmail.nejjg@gmail.com",
            pass: "mrnpzmjzhwcgamvk"
        }
    });
};

// send notifications email
export const sendFlaggingNotification = async (recepientEmail, notificationType) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"SnailMail Internal" <snailmail.nejjg@gmail.com>`,
            to: recepientEmail,
            subject: 'Immediate Attention Required: ${notificationType}',
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
                        background-color: #f8f9fa
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
                            <h1>This issue requires your immediate attention</h1>
                        </div>
                        <div class="content">
                            <p>Greetings ${'Manager'},</p>

                            <p>There is an actions that requires your immediate attention.</p>

                            <p>The following employee has five or more missed deliveries because of ${notificationType}</p>
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