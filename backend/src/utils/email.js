const nodemailer = require('nodemailer');

const isConfigured = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  return Boolean(
    host &&
    !host.includes('your_smtp_host') &&
    user &&
    !user.includes('your_smtp_user') &&
    pass &&
    !pass.includes('your_smtp_password')
  );
};

const getTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT, 10) || 587;
  const secure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
};

/**
 * Send an email with HTML and text content.
 */
async function sendEmail({ to, subject, html, text }) {
  const fromName = process.env.EMAIL_FROM_NAME || 'InflationWise';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'no-reply@inflationwise.com';
  const from = `${fromName} <${fromEmail}>`;

  if (!isConfigured()) {
    console.log(`[Email Service] SMTP is not fully configured. Email to <${to}> with subject "${subject}" was safely simulated.`);
    return { success: true, simulated: true };
  }

  const transporter = getTransporter();
  const mailOptions = {
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]*>/g, ''),
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Service] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

/**
 * Generate and send a professional password reset email.
 */
async function sendPasswordResetEmail({ to, name, resetUrl, expiresInMinutes = 20 }) {
  const subject = 'Reset Your InflationWise Password';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7FAFC; color: #1E293B; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #20205A; padding: 28px 24px; text-align: center; }
        .header h1 { color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
        .header p { color: #16C7D9; font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px 28px; }
        .btn { display: inline-block; background-color: #3155C6; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; text-align: center; }
        .btn:hover { background-color: #2542A8; }
        .notice { background: #F1F5F9; border-left: 4px solid #3155C6; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #475569; margin: 20px 0; }
        .footer { padding: 20px 28px; background: #F8FAFC; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
        .link-text { word-break: break-all; color: #3155C6; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>InflationWise</h1>
          <p>Smart Inflation-Based Financial Planning</p>
        </div>
        <div class="body">
          <p style="font-size: 16px; margin-top: 0;">Hello ${name || 'Valued User'},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            We received a request to reset the password for your InflationWise account. Click the button below to choose a new, secure password:
          </p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
          </div>
          <div class="notice">
            <strong>Security Notice:</strong> This password-reset link is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.
          </div>
          <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
            If the button above does not work, copy and paste this link into your web browser:
            <br>
            <a href="${resetUrl}" class="link-text">${resetUrl}</a>
          </p>
          <p style="font-size: 13px; color: #94A3B8; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            If you did not request this password reset, please ignore this email. Your current password remains secure and your account is safe.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} InflationWise. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `Hello ${name || 'User'},\n\nClick the following link to reset your InflationWise password (valid for ${expiresInMinutes} minutes):\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
  });
}

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
module.exports.isEmailConfigured = isConfigured;
