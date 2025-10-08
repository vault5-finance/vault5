const { User } = require('../models');

/**
 * Grace Period Service
 * Manages grace period calculations and configurations for overdue reminders
 */
class GracePeriodService {
  /**
   * Default grace periods by lending type (in days)
   */
  get DEFAULT_GRACE_PERIODS() {
    return {
      emergency: 1,      // Emergency loans get 1 day grace
      'non-emergency': 3, // Regular loans get 3 days grace
      business: 7,       // Business loans get 1 week grace
      personal: 3,       // Personal loans get 3 days grace
      investment: 14     // Investment loans get 2 weeks grace
    };
  }

  /**
   * Calculate effective grace period for a lending
   * @param {Object} lending - Lending document
   * @param {Object} user - User document
   * @returns {number} - Effective grace period in days
   */
  async calculateEffectiveGracePeriod(lending, user) {
    // Start with default grace period for lending type
    let gracePeriod = this.DEFAULT_GRACE_PERIODS[lending.type] || this.DEFAULT_GRACE_PERIODS['non-emergency'];

    // Apply user-specific grace period preferences
    if (user && user.preferences && user.preferences.gracePeriod) {
      const userGracePeriod = user.preferences.gracePeriod;

      // User can set custom grace periods per loan type
      if (userGracePeriod[lending.type]) {
        gracePeriod = userGracePeriod[lending.type];
      }
      // Or a global override
      else if (userGracePeriod.global) {
        gracePeriod = userGracePeriod.global;
      }
    }

    // Apply business rules based on lending amount
    gracePeriod = this.applyAmountBasedGracePeriod(lending.amount, gracePeriod);

    // Apply borrower relationship factors
    gracePeriod = await this.applyRelationshipBasedGracePeriod(lending, user, gracePeriod);

    // Ensure minimum grace period of 1 day
    return Math.max(1, gracePeriod);
  }

  /**
   * Apply amount-based grace period adjustments
   * @param {number} amount - Lending amount
   * @param {number} baseGracePeriod - Base grace period
   * @returns {number} - Adjusted grace period
   */
  applyAmountBasedGracePeriod(amount, baseGracePeriod) {
    // For larger amounts, provide slightly more grace period
    if (amount >= 100000) { // KES 100,000+
      return baseGracePeriod + 1;
    } else if (amount >= 50000) { // KES 50,000+
      return baseGracePeriod + 0.5;
    }

    return baseGracePeriod;
  }

  /**
   * Apply relationship-based grace period adjustments
   * @param {Object} lending - Lending document
   * @param {Object} user - User document
   * @param {number} baseGracePeriod - Base grace period
   * @returns {number} - Adjusted grace period
   */
  async applyRelationshipBasedGracePeriod(lending, user, baseGracePeriod) {
    // This would typically check borrower relationship history
    // For now, return base grace period
    // Future enhancement: analyze past repayment behavior

    return baseGracePeriod;
  }

  /**
   * Get grace period explanation for transparency
   * @param {Object} lending - Lending document
   * @param {Object} user - User document
   * @param {number} effectiveGracePeriod - Effective grace period
   * @returns {Object} - Explanation object
   */
  async getGracePeriodExplanation(lending, user, effectiveGracePeriod) {
    const defaultGracePeriod = this.DEFAULT_GRACE_PERIODS[lending.type] || this.DEFAULT_GRACE_PERIODS['non-emergency'];

    let explanation = `${effectiveGracePeriod} day${effectiveGracePeriod !== 1 ? 's' : ''}`;

    const factors = [];

    if (effectiveGracePeriod > defaultGracePeriod) {
      factors.push(`extended for ${lending.type} loan type`);
    }

    if (lending.amount >= 100000) {
      factors.push('increased for high-value loan');
    }

    if (factors.length > 0) {
      explanation += ` (${factors.join(', ')})`;
    }

    return {
      effectiveGracePeriod,
      defaultGracePeriod,
      explanation,
      factors
    };
  }

  /**
   * Update user grace period preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Grace period preferences
   * @returns {Object} - Updated user preferences
   */
  async updateUserGracePeriodPreferences(userId, preferences) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Initialize preferences if not exists
      if (!user.preferences) {
        user.preferences = {};
      }

      // Update grace period preferences
      user.preferences.gracePeriod = {
        ...user.preferences.gracePeriod,
        ...preferences
      };

      await user.save();

      return user.preferences.gracePeriod;
    } catch (error) {
      console.error('Error updating grace period preferences:', error);
      throw error;
    }
  }

  /**
   * Get user grace period preferences
   * @param {string} userId - User ID
   * @returns {Object} - User grace period preferences
   */
  async getUserGracePeriodPreferences(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user.preferences?.gracePeriod || {};
    } catch (error) {
      console.error('Error getting grace period preferences:', error);
      throw error;
    }
  }

  /**
   * Validate grace period configuration
   * @param {Object} preferences - Grace period preferences to validate
   * @returns {Object} - Validation result
   */
  validateGracePeriodPreferences(preferences) {
    const errors = [];
    const warnings = [];

    // Validate global grace period
    if (preferences.global !== undefined) {
      if (typeof preferences.global !== 'number' || preferences.global < 0 || preferences.global > 30) {
        errors.push('Global grace period must be a number between 0 and 30 days');
      }
    }

    // Validate loan type specific grace periods
    const validLoanTypes = Object.keys(this.DEFAULT_GRACE_PERIODS);
    for (const loanType of Object.keys(preferences)) {
      if (loanType === 'global') continue;

      if (!validLoanTypes.includes(loanType)) {
        warnings.push(`Unknown loan type: ${loanType}`);
        continue;
      }

      const gracePeriod = preferences[loanType];
      if (typeof gracePeriod !== 'number' || gracePeriod < 0 || gracePeriod > 30) {
        errors.push(`${loanType} grace period must be a number between 0 and 30 days`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Reset user grace period preferences to defaults
   * @param {string} userId - User ID
   * @returns {Object} - Default preferences
   */
  async resetUserGracePeriodPreferences(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Reset to defaults
      if (user.preferences) {
        user.preferences.gracePeriod = {};
      }

      await user.save();

      return {};
    } catch (error) {
      console.error('Error resetting grace period preferences:', error);
      throw error;
    }
  }
}

module.exports = new GracePeriodService();