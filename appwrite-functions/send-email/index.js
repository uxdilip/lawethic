const sdk = require('node-appwrite');
const nodemailer = require('nodemailer');

/*
  Send Email Function
  
  This function:
  1. Receives email data (to, subject, body)
  2. Sends transactional email via SMTP
  3. Logs email delivery
  
  Can be triggered by:
  - HTTP request
  - Database events (order created, status changed)
  
  Phase 2 Implementation
*/

module.exports = async function (req, res) {
    try {
        const { to, subject, body, template } = JSON.parse(req.payload || req.body);

        if (!to || !subject) {
            return res.json({ success: false, error: 'Missing required fields' }, 400);
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email templates
        const templates = {
            order_placed: `
        <h1>Order Confirmation</h1>
        <p>Your order has been placed successfully.</p>
        <p>Order Number: ${body.orderNumber}</p>
        <p>Service: ${body.serviceName}</p>
        <p>Amount: ₹${body.amount}</p>
      `,
            status_update: `
        <h1>Order Status Update</h1>
        <p>Your order status has been updated.</p>
        <p>Order Number: ${body.orderNumber}</p>
        <p>New Status: ${body.status}</p>
      `,
            certificate_ready: `
        <h1>Certificate Ready</h1>
        <p>Your certificate is ready for download.</p>
        <p>Order Number: ${body.orderNumber}</p>
        <p><a href="${body.downloadLink}">Download Certificate</a></p>
      `,
        };

        const htmlBody = template ? templates[template] : body;

        // Send email
        await transporter.sendMail({
            from: `"LawEthic" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            html: htmlBody,
        });

        return res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Send email error:', error);
        return res.json({ success: false, error: error.message }, 500);
    }
};
