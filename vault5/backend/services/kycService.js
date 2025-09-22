const Wallet = require('../models/Wallet');
const User = require('../models/User');

class KYCService {
  constructor() {
    // KYC levels and their requirements
    this.kycLevels = {
      none: {
        name: 'No KYC',
        limits: {
          daily: 50000,
          monthly: 500000,
          transaction: 100000
        },
        features: ['basic_wallet']
      },
      basic: {
        name: 'Basic KYC',
        limits: {
          daily: 100000,
          monthly: 1000000,
          transaction: 250000
        },
        features: ['basic_wallet', 'recharge', 'transfer']
      },
      verified: {
        name: 'Verified KYC',
        limits: {
          daily: 500000,
          monthly: 5000000,
          transaction: 1000000
        },
        features: ['basic_wallet', 'recharge', 'transfer', 'investment', 'lending']
      },
      enhanced: {
        name: 'Enhanced KYC',
        limits: {
          daily: 1000000,
          monthly: 10000000,
          transaction: 5000000
        },
        features: ['basic_wallet', 'recharge', 'transfer', 'investment', 'lending', 'business_features']
      }
    };
  }

  // Get KYC level for user
  async getKycLevel(userId) {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      return wallet ? wallet.kycLevel : 'none';
    } catch (error) {
      console.error('Get KYC level error:', error);
      return 'none';
    }
  }

  // Check if user has required KYC level for feature
  async hasKycLevel(userId, requiredLevel) {
    try {
      const currentLevel = await this.getKycLevel(userId);
      const levels = ['none', 'basic', 'verified', 'enhanced'];
      const currentIndex = levels.indexOf(currentLevel);
      const requiredIndex = levels.indexOf(requiredLevel);

      return currentIndex >= requiredIndex;
    } catch (error) {
      console.error('Check KYC level error:', error);
      return false;
    }
  }

  // Update user's KYC level
  async updateKycLevel(userId, newLevel, verificationData = {}) {
    try {
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const levels = ['none', 'basic', 'verified', 'enhanced'];
      if (!levels.includes(newLevel)) {
        throw new Error('Invalid KYC level');
      }

      // Update KYC level
      wallet.kycLevel = newLevel;

      // Update limits based on new level
      const levelConfig = this.kycLevels[newLevel];
      wallet.limits = {
        dailyLimit: levelConfig.limits.daily,
        monthlyLimit: levelConfig.limits.monthly,
        transactionLimit: levelConfig.limits.transaction
      };

      await wallet.save();

      // Log KYC update
      await this.logKycEvent(userId, 'level_updated', {
        previousLevel: wallet.kycLevel,
        newLevel: newLevel,
        verificationData
      });

      return {
        success: true,
        message: `KYC level updated to ${levelConfig.name}`,
        data: {
          level: newLevel,
          limits: wallet.limits,
          features: levelConfig.features
        }
      };
    } catch (error) {
      console.error('Update KYC level error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Submit KYC documents
  async submitKycDocuments(userId, documents) {
    try {
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // In a real implementation, you would:
      // 1. Upload documents to secure storage
      // 2. Send to KYC verification service
      // 3. Set up webhooks for verification results

      // For now, simulate document submission
      const submission = {
        id: `KYC_${Date.now()}_${userId}`,
        status: 'pending',
        submittedAt: new Date(),
        documents: documents.map(doc => ({
          type: doc.type,
          filename: doc.filename,
          status: 'pending'
        }))
      };

      // Log KYC submission
      await this.logKycEvent(userId, 'documents_submitted', {
        submissionId: submission.id,
        documentTypes: documents.map(d => d.type)
      });

      return {
        success: true,
        message: 'KYC documents submitted successfully',
        data: submission
      };
    } catch (error) {
      console.error('Submit KYC documents error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get KYC status
  async getKycStatus(userId) {
    try {
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        return {
          success: false,
          message: 'Wallet not found'
        };
      }

      const levelConfig = this.kycLevels[wallet.kycLevel];

      return {
        success: true,
        data: {
          currentLevel: wallet.kycLevel,
          levelName: levelConfig.name,
          limits: wallet.limits,
          features: levelConfig.features,
          upgradeAvailable: wallet.kycLevel !== 'enhanced'
        }
      };
    } catch (error) {
      console.error('Get KYC status error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Check if feature is available for user's KYC level
  async isFeatureAvailable(userId, feature) {
    try {
      const kycLevel = await this.getKycLevel(userId);
      const levelConfig = this.kycLevels[kycLevel];

      return levelConfig.features.includes(feature);
    } catch (error) {
      console.error('Check feature availability error:', error);
      return false;
    }
  }

  // Get available features for user
  async getAvailableFeatures(userId) {
    try {
      const kycLevel = await this.getKycLevel(userId);
      const levelConfig = this.kycLevels[kycLevel];

      return {
        success: true,
        data: {
          level: kycLevel,
          features: levelConfig.features,
          limits: levelConfig.limits
        }
      };
    } catch (error) {
      console.error('Get available features error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get KYC upgrade requirements
  async getUpgradeRequirements(userId) {
    try {
      const currentLevel = await this.getKycLevel(userId);
      const levels = ['none', 'basic', 'verified', 'enhanced'];
      const currentIndex = levels.indexOf(currentLevel);

      if (currentIndex === levels.length - 1) {
        return {
          success: true,
          message: 'User already has the highest KYC level',
          data: {
            canUpgrade: false,
            currentLevel: currentLevel
          }
        };
      }

      const nextLevel = levels[currentIndex + 1];
      const nextLevelConfig = this.kycLevels[nextLevel];

      return {
        success: true,
        data: {
          canUpgrade: true,
          currentLevel: currentLevel,
          nextLevel: nextLevel,
          nextLevelName: nextLevelConfig.name,
          requirements: this.getLevelRequirements(nextLevel),
          benefits: this.getLevelBenefits(nextLevel)
        }
      };
    } catch (error) {
      console.error('Get upgrade requirements error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get requirements for a specific KYC level
  getLevelRequirements(level) {
    const requirements = {
      basic: [
        'National ID or Passport',
        'Proof of address (utility bill)',
        'Selfie with ID'
      ],
      verified: [
        'All basic requirements',
        'Bank statement (3 months)',
        'Source of income verification'
      ],
      enhanced: [
        'All verified requirements',
        'Business registration (if applicable)',
        'Enhanced due diligence documents'
      ]
    };

    return requirements[level] || [];
  }

  // Get benefits for a specific KYC level
  getLevelBenefits(level) {
    const benefits = {
      basic: [
        'Higher transaction limits',
        'Access to wallet recharge',
        'Basic transfer features'
      ],
      verified: [
        'All basic benefits',
        'Investment features',
        'Lending capabilities',
        'Priority support'
      ],
      enhanced: [
        'All verified benefits',
        'Business features',
        'API access',
        'Dedicated account manager'
      ]
    };

    return benefits[level] || [];
  }

  // Log KYC events
  async logKycEvent(userId, eventType, data = {}) {
    try {
      // In a real implementation, log to audit trail
      console.log(`KYC Event: ${eventType}`, {
        userId,
        timestamp: new Date(),
        data
      });
    } catch (error) {
      console.error('Log KYC event error:', error);
    }
  }

  // Validate KYC documents
  async validateDocuments(documents) {
    const allowedTypes = ['id', 'passport', 'utility_bill', 'bank_statement', 'selfie'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedFormats = ['jpg', 'jpeg', 'png', 'pdf'];

    const errors = [];

    for (const doc of documents) {
      if (!allowedTypes.includes(doc.type)) {
        errors.push(`Invalid document type: ${doc.type}`);
      }

      if (doc.size > maxFileSize) {
        errors.push(`File too large: ${doc.filename}`);
      }

      const extension = doc.filename.split('.').pop().toLowerCase();
      if (!allowedFormats.includes(extension)) {
        errors.push(`Invalid file format: ${doc.filename}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new KYCService();