const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    // For development, use a mock transporter
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
      this.transporter = {
        sendMail: async (mailOptions) => {
          console.log(`
=== DEVELOPMENT EMAIL ===
To: ${mailOptions.to}
Subject: ${mailOptions.subject}
Body:
${mailOptions.html || mailOptions.text}
          `);
          return { messageId: 'dev-' + Date.now() };
        }
      };
      return;
    }

    // Production SMTP configuration
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content
   * @returns {Object} - Send result
   */
  async send(options) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'Vault5 <noreply@vault5.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message
      };
    }
  }

  /**
   * Send verification email
   * @param {string} to - Recipient email
   * @param {string} verificationUrl - Verification URL
   * @param {string} username - User's username
   * @returns {Object} - Send result
   */
  async sendVerificationEmail(to, verificationUrl, username) {
    const subject = 'Verify your Vault5 account';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Vault5 account</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Verify Your Vault5 Account</h1>
        </div>
        <div class="content">
            <h2>Hi ${username}!</h2>
            <p>Welcome to Vault5! To get started, please verify your email address by clicking the button below:</p>

            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>

            <div class="highlight">
                <strong>Or copy and paste this link into your browser:</strong>
                <p style="word-break: break-all; margin: 10px 0;">${verificationUrl}</p>
            </div>

            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>

            <p>If you didn't create this account, please ignore this email. Your email address will not be used without verification.</p>

            <p>Best regards,<br>The Vault5 Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message from Vault5. Please do not reply to this email.</p>
            <p>&copy; 2025 Vault5. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Hi ${username},

Welcome to Vault5! To get started, please verify your email address by clicking the link below:

${verificationUrl}

Important: This verification link will expire in 24 hours for security reasons.

If you didn't create this account, please ignore this email.

Best regards,
The Vault5 Team
    `;

    return await this.send({
      to,
      subject,
      html,
      text
    });
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} resetUrl - Password reset URL
   * @param {string} username - User's username
   * @returns {Object} - Send result
   */
  async sendPasswordResetEmail(to, resetUrl, username) {
    const subject = 'Reset your Vault5 password';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your Vault5 password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Reset Your Password</h1>
        </div>
        <div class="content">
            <h2>Hi ${username}!</h2>
            <p>We received a request to reset your Vault5 password. Click the button below to create a new password:</p>

            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>

            <div class="warning">
                <strong>Security Note:</strong> This reset link will expire in 1 hour for your security.
                If you didn't request this reset, please ignore this email.
            </div>

            <p>Best regards,<br>The Vault5 Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message from Vault5. Please do not reply to this email.</p>
            <p>&copy; 2025 Vault5. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Hi ${username},

We received a request to reset your Vault5 password. Click the link below to create a new password:

${resetUrl}

Security Note: This reset link will expire in 1 hour for your security.
If you didn't request this reset, please ignore this email.

Best regards,
The Vault5 Team
    `;

    return await this.send({
      to,
      subject,
      html,
      text
    });
  }

  /**
   * Send notification email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @param {string} username - User's username
   * @returns {Object} - Send result
   */
  async sendNotificationEmail(to, subject, message, username) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📢 Vault5 Notification</h1>
        </div>
        <div class="content">
            <h2>Hi ${username}!</h2>
            <p>${message}</p>
            <p>Best regards,<br>The Vault5 Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message from Vault5. Please do not reply to this email.</p>
            <p>&copy; 2025 Vault5. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Hi ${username},

${message}

Best regards,
The Vault5 Team
    `;

    return await this.send({
      to,
      subject,
      html,
      text
    });
  }
}

module.exports = new EmailService();