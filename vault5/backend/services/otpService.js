const crypto = require('crypto');
const { User } = require('../models');
const { normalizePhoneNumber, arePhoneNumbersEqual } = require('../utils/phoneUtils');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis or database
    this.OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes
    this.MAX_OTP_ATTEMPTS = 3; // Maximum attempts per OTP
  }

  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate secure OTP with crypto
  generateSecureOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Hash OTP for storage
  hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // Create OTP record
  createOTPRecord(phoneNumber, otp, purpose = 'phone_verification') {
    const hashedOTP = this.hashOTP(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    const record = {
      phoneNumber,
      hashedOTP,
      purpose,
      attempts: 0,
      createdAt: new Date(),
      expiresAt,
      isVerified: false
    };

    // Store in memory (use Redis in production)
    const key = `${phoneNumber}_${purpose}_${Date.now()}`;
    this.otpStore.set(key, record);

    // Clean up expired OTPs
    this.cleanupExpiredOTPs();

    return {
      key,
      otp, // Only return plain OTP for development
      expiresAt
    };
  }

  // Verify OTP
  async verifyOTP(phoneNumber, otp, purpose = 'phone_verification', userId = null) {
    // Normalize phone number consistently
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized) {
      return {
        success: false,
        message: 'Invalid Kenyan phone number format'
      };
    }

    // Optional bypass for development/testing
    if (process.env.OTP_ACCEPT_ANY === 'true') {
      await this.markPhoneAsVerified(normalized, userId);
      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    }

    const hashedInputOTP = this.hashOTP(otp);

    // Find valid OTP record
    const otpRecord = this.findValidOTPRecord(normalized, purpose);

    if (!otpRecord) {
      return {
        success: false,
        message: 'OTP not found or expired'
      };
    }

    // Check attempts
    if (otpRecord.attempts >= this.MAX_OTP_ATTEMPTS) {
      return {
        success: false,
        message: 'Too many failed attempts. Request a new OTP.'
      };
    }

    // Dev/test bypass: accept any OTP when not in production or when explicitly allowed
    if (process.env.OTP_ACCEPT_ANY === 'true' || process.env.NODE_ENV !== 'production') {
      await this.markPhoneAsVerified(normalized, userId);
      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    }

    // Verify OTP
    if (otpRecord.hashedOTP === hashedInputOTP) {
      otpRecord.isVerified = true;
      otpRecord.verifiedAt = new Date();

      // Mark phone as verified in user record (for current user if provided)
      await this.markPhoneAsVerified(normalized, userId);

      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    } else {
      // Increment attempts
      otpRecord.attempts++;

      return {
        success: false,
        message: `Invalid OTP. ${this.MAX_OTP_ATTEMPTS - otpRecord.attempts} attempts remaining.`
      };
    }
  }

  // Find valid OTP record
  findValidOTPRecord(phoneNumber, purpose) {
    for (const [key, record] of this.otpStore.entries()) {
      if (record.phoneNumber === phoneNumber &&
          record.purpose === purpose &&
          !record.isVerified &&
          record.expiresAt > new Date()) {
        return record;
      }
    }
    return null;
  }

  // Mark phone as verified in user record (for provided user if available)
  async markPhoneAsVerified(phoneNumber, userId = null) {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      if (!normalizedPhone) return;

      let user = null;

      if (userId) {
        user = await User.findById(userId);
      } else {
        // Fallback: attempt to find any user with a matching phone
        user = await User.findOne({ 'phones.0': { $exists: true } });
        if (user) {
          // Ensure the phone matches one of their numbers
          const hasMatch = (user.phones || []).some(p => arePhoneNumbersEqual(p.phone, normalizedPhone));
          if (!hasMatch) user = null;
        }
      }

      if (!user) return;

      // Try to locate exact phone entry
      let phoneRecord = (user.phones || []).find(p => arePhoneNumbersEqual(p.phone, normalizedPhone));

      // If not present, add it
      if (!phoneRecord) {
        user.phones.push({
          phone: normalizedPhone,
          isPrimary: false,
          isVerified: true,
          addedAt: new Date()
        });
      } else {
        phoneRecord.isVerified = true;
        phoneRecord.verifiedAt = new Date();
      }

      await user.save();
    } catch (error) {
      console.error('Error marking phone as verified:', error);
      throw error;
    }
  }

  // Send OTP via SMS (mock implementation)
  async sendOTP(phoneNumber, otp, purpose = 'phone_verification') {
    try {
      // In production, integrate with SMS service like Twilio, Africa's Talking, etc.
      console.log(`📱 SMS OTP for ${phoneNumber}: ${otp} (Purpose: ${purpose})`);

      // Mock SMS sending
      const mockSMSResult = {
        success: true,
        messageId: `mock_${Date.now()}`,
        recipient: phoneNumber,
        message: `Your Vault5 ${purpose.replace('_', ' ')} OTP is: ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`
      };

      return mockSMSResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  // Request new OTP
  async requestOTP(phoneNumber, purpose = 'phone_verification') {
    try {
      const normalized = normalizePhoneNumber(phoneNumber);
      if (!normalized) {
        return {
          success: false,
          message: 'Invalid Kenyan phone number format'
        };
      }

      // Check if phone is already verified for any user
      const user = await User.findOne({ 'phones.0': { $exists: true } });
      if (user) {
        const phoneRecord = (user.phones || []).find(p => arePhoneNumbersEqual(p.phone, normalized));
        if (phoneRecord && phoneRecord.isVerified) {
          return {
            success: false,
            message: 'Phone number is already verified'
          };
        }
      }

      // Generate and store OTP
      const otp = this.generateSecureOTP();
      const otpRecord = this.createOTPRecord(normalized, otp, purpose);

      // Send OTP
      const smsResult = await this.sendOTP(normalized, otp, purpose);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresAt: otpRecord.expiresAt,
        smsResult
      };
    } catch (error) {
      console.error('Error requesting OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Check if phone is verified
  async isPhoneVerified(phoneNumber) {
    try {
      const normalized = normalizePhoneNumber(phoneNumber);
      if (!normalized) return false;

      const user = await User.findOne({ 'phones.0': { $exists: true } });
      if (!user) return false;

      const phoneRecord = (user.phones || []).find(p => arePhoneNumbersEqual(p.phone, normalized));
      return phoneRecord ? phoneRecord.isVerified : false;
    } catch (error) {
      console.error('Error checking phone verification:', error);
      return false;
    }
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    const now = new Date();
    for (const [key, record] of this.otpStore.entries()) {
      if (record.expiresAt <= now) {
        this.otpStore.delete(key);
      }
    }
  }

  // Get OTP status for a phone number
  getOTPStatus(phoneNumber, purpose = 'phone_verification') {
    const normalized = normalizePhoneNumber(phoneNumber);
    const otpRecord = normalized ? this.findValidOTPRecord(normalized, purpose) : null;

    if (!otpRecord) {
      return {
        exists: false,
        attempts: 0,
        expiresAt: null
      };
    }

    return {
      exists: true,
      attempts: otpRecord.attempts,
      maxAttempts: this.MAX_OTP_ATTEMPTS,
      expiresAt: otpRecord.expiresAt,
      remainingAttempts: this.MAX_OTP_ATTEMPTS - otpRecord.attempts
    };
  }

  // Resend OTP (with rate limiting)
  async resendOTP(phoneNumber, purpose = 'phone_verification') {
    try {
      const normalized = normalizePhoneNumber(phoneNumber);
      if (!normalized) {
        return {
          success: false,
          message: 'Invalid Kenyan phone number format'
        };
      }

      // Check rate limiting (max 3 OTPs per hour)
      const recentOTPs = Array.from(this.otpStore.values()).filter(record =>
        record.phoneNumber === normalized &&
        record.purpose === purpose &&
        record.createdAt > new Date(Date.now() - 60 * 60 * 1000)
      );

      if (recentOTPs.length >= 3) {
        return {
          success: false,
          message: 'Rate limit exceeded. Please wait before requesting another OTP.'
        };
      }

      return await this.requestOTP(normalized, purpose);
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP'
      };
    }
  }
}

module.exports = new OTPService();