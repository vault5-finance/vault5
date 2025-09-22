const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('./emailService');

class EmailVerificationService {
  constructor() {
    this.verificationTokens = new Map(); // In production, use Redis
    this.tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Generate a secure verification token
   * @param {string} email - User's email address
   * @returns {string} - Verification token
   */
  generateVerificationToken(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + this.tokenExpiry;

    // Store token with email and expiry
    this.verificationTokens.set(token, {
      email,
      expiresAt,
      used: false
    });

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Verify email using token
   * @param {string} token - Verification token
   * @returns {Object} - Verification result
   */
  async verifyEmail(token) {
    try {
      const tokenData = this.verificationTokens.get(token);

      if (!tokenData) {
        return {
          success: false,
          message: 'Invalid or expired verification token'
        };
      }

      if (tokenData.used) {
        return {
          success: false,
          message: 'Token has already been used'
        };
      }

      if (Date.now() > tokenData.expiresAt) {
        this.verificationTokens.delete(token);
        return {
          success: false,
          message: 'Token has expired'
        };
      }

      // Mark token as used
      tokenData.used = true;
      this.verificationTokens.set(token, tokenData);

      // Update user verification status
      // Find user by nested email and update verification flags
      const user = await User.findOne({ 'emails.email': tokenData.email });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Mark the specific email entry as verified
      const emailIndex = user.emails.findIndex(e => e.email === tokenData.email);
      if (emailIndex === -1) {
        return {
          success: false,
          message: 'Email not associated with user'
        };
      }
      user.emails[emailIndex].isVerified = true;

      // If this email is primary, set top-level flags for backward compatibility
      if (user.emails[emailIndex].isPrimary) {
        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
      }

      await user.save();

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      {
        const primaryEmail = user.emails?.find(e => e.isPrimary)?.email || user.emails?.[0]?.email || null;
        return {
          success: true,
          message: 'Email verified successfully',
          user: {
            id: user._id,
            email: primaryEmail,
            name: user.name
          }
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Verification failed'
      };
    }
  }

  /**
   * Send verification email (mock implementation)
   * @param {string} email - User's email
   * @param {string} token - Verification token
   * @param {string} username - User's username
   * @returns {Object} - Email sending result
   */
  async sendVerificationEmail(email, token, username) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;

      // Mock email sending - in production, use services like SendGrid, AWS SES, etc.
      console.log(`
=== EMAIL VERIFICATION ===
To: ${email}
Subject: Verify your Vault5 account

Hi ${username},

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
Vault5 Team
      `);

      // Send actual email using email service
      const emailResult = await emailService.sendVerificationEmail(email, verificationUrl, username);

      return emailResult;
    } catch (error) {
      console.error('Send verification email error:', error);
      return {
        success: false,
        message: 'Failed to send verification email'
      };
    }
  }

  /**
   * Check if email is already verified
   * @param {string} email - Email address
   * @returns {boolean} - Verification status
   */
  async isEmailVerified(email) {
    try {
      const user = await User.findOne({ 'emails.email': email }).select('emails isEmailVerified');
      if (!user) return false;
      const emailEntry = (user.emails || []).find(e => e.email === email);
      return emailEntry ? !!emailEntry.isVerified : false;
    } catch (error) {
      console.error('Check email verification error:', error);
      return false;
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User's email
   * @returns {Object} - Result
   */
  async resendVerificationEmail(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          message: 'Email is already verified'
        };
      }

      // Generate new token
      const token = this.generateVerificationToken(email);

      // Send verification email
      const emailResult = await this.sendVerificationEmail(email, token, user.username);

      return emailResult;
    } catch (error) {
      console.error('Resend verification email error:', error);
      return {
        success: false,
        message: 'Failed to resend verification email'
      };
    }
  }

  /**
   * Get verification email HTML template
   * @param {string} verificationUrl - Verification URL
   * @param {string} username - User's username
   * @returns {string} - HTML template
   */
  getVerificationEmailTemplate(verificationUrl, username) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Vault5 account</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
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

            <p><strong>Or copy and paste this link into your browser:</strong></p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationUrl}</p>

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
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of this.verificationTokens.entries()) {
      if (now > data.expiresAt) {
        this.verificationTokens.delete(token);
      }
    }
  }

  /**
   * Get token info (for debugging)
   * @param {string} token - Verification token
   * @returns {Object} - Token information
   */
  getTokenInfo(token) {
    return this.verificationTokens.get(token);
  }
}

module.exports = new EmailVerificationService();