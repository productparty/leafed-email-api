/**
 * Vercel Serverless Function for sending contact form emails
 * Uses Nodemailer with SMTP to send emails
 * 
 * Endpoint: POST /api/send-email
 */

const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter with SMTP config from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Additional options to improve deliverability
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false,
  },
  // Connection timeout
  connectionTimeout: 5000,
  // Greeting timeout
  greetingTimeout: 5000,
});

/**
 * Generate HTML email template
 */
function generateEmailHTML(formData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leafed App Contact Form</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table style="background-color: #f5f5f5; padding: 20px;" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" width="600" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="background-color: #4caf50; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Leafed App Contact Form</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">You've received a new message from the Leafed app contact form.</p>
              <table style="border-collapse: collapse; margin-bottom: 24px;" width="100%" cellspacing="0" cellpadding="0">
                <tr style="height: 45px;">
                  <td style="padding: 12px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #555555; width: 150px;">Name:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #333333;">${escapeHtml(formData.name)}</td>
                </tr>
                <tr style="height: 45px;">
                  <td style="padding: 12px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #555555;">Email:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #333333;">
                    <a style="color: #000000; text-decoration: none;" href="mailto:${escapeHtml(formData.email)}">${escapeHtml(formData.email)}</a>
                  </td>
                </tr>
                <tr style="height: 45px;">
                  <td style="padding: 12px; background-color: #f9f9f9; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #555555;">Subject:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #333333;">${escapeHtml(formData.subject)}</td>
                </tr>
              </table>
              <div style="margin-top: 24px;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #555555; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message:</p>
                <div style="padding: 16px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; border-radius: 4px; color: #333333; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(formData.message)}</div>
              </div>
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0e0e0; text-align: center;">
                <a style="display: inline-block; background-color: #4caf50; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;" href="mailto:${escapeHtml(formData.email)}?subject=Re: ${encodeURIComponent(formData.subject)}">Reply to ${escapeHtml(formData.email)}</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #888888; font-size: 12px;">This email was sent from the Leafed app contact form.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate plain text version of email
 */
function generateEmailText(formData) {
  return `
Leafed App Contact Form

You've received a new message from the Leafed app contact form.

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
This email was sent from the Leafed app contact form.
Reply to: ${formData.email}
  `.trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Vercel Serverless Function Handler
 */
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  // CORS headers (allow React Native apps)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate required environment variables
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_TO'];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      return res.status(500).json({
        success: false,
        error: 'Server configuration error. Please contact support.',
      });
    }

    // Parse and validate request body
    const formData = req.body;

    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Expected JSON object.',
      });
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
    const missingFields = requiredFields.filter((field) => !formData[field] || !formData[field].trim());

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format.',
      });
    }

    // Prepare email options with proper headers to avoid spam
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Leafed App'}" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_TO,
      replyTo: formData.email,
      subject: `Leafed App Contact: ${formData.subject}`,
      text: generateEmailText(formData),
      html: generateEmailHTML(formData),
      // Add proper email headers to improve deliverability
      headers: {
        'Message-ID': `<${Date.now()}-${Math.random().toString(36)}@leafedapp.com>`,
        'X-Mailer': 'Leafed App Contact Form',
        'X-Priority': '3',
        'Importance': 'normal',
        'List-Unsubscribe': `<mailto:${process.env.SMTP_FROM}?subject=unsubscribe>`,
      },
      // Set priority to normal (not urgent)
      priority: 'normal',
      // Add date header
      date: new Date(),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);

    // Return user-friendly error message
    return res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

