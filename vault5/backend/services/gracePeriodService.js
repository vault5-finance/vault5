const { User } = require('../models');

/**
 * Grace Period Service
 * Manages grace period configurations and business rules
 */
class GracePeriodService {

  /**
   * Default grace period configurations by lending type and user tier
   */
  get DEFAULT_CONFIGS() {
    return {
      emergency: {
        basic: 1,      // 1 day for basic users
        premium: 2,    // 2 days for premium users
        enterprise: 3  // 3 days for enterprise users
      },
      nonEmergency: {
        basic: 3,      // 3 days for basic users
        premium: 5,    // 5 days for premium users
        enterprise: 7  // 7 days for enterprise users
      }
    };
  }

  /**
   * Business rules for grace period adjustments
   */
  get BUSINESS_RULES() {
    return {
      // Reduce grace period for high-risk borrowers
      highRiskMultiplier: 0.5,  // 50% reduction

      // Increase grace period for loyal users
      loyaltyBonus: {
        minLendings: 10,     // Users with 10+ successful lendings
        bonusDays: 2         // Get 2 extra days
      },

      // Seasonal adjustments
      seasonalAdjustments: {
        december: 3,  // Holiday season - more generous
        january: 1,   // Post-holiday - stricter
        april: 2,     // Tax season - slightly more generous
        june: 1,      // Mid-year review - stricter
        october: 1    // Pre-holiday - stricter
      },

      // Weekend adjustments
      weekendAdjustment: 1,  // Add 1 day if due date falls on weekend

      // Amount-based adjustments
      amountThresholds: [
        { maxAmount: 5000, adjustment: 1 },    // Small amounts: +1 day
        { maxAmount: 25000, adjustment: 0 },   // Medium amounts: no change
        { maxAmount: 100000, adjustment: -1 }, // Large amounts: -1 day
        { maxAmount: Infinity, adjustment: -2 } // Very large amounts: -2 days
      ]
    };
  }

  /**
   * Calculate effective grace period for a lending
   * @param {Object} lending - Lending document
   * @param {Object} user - User document
   * @returns {number} - Effective grace period in days
   */
  async calculateEffectiveGracePeriod(lending, user) {
    // Start with user's configured grace period
    let gracePeriod = user.getGracePeriodForLoanType(lending.type);

    // Apply business rules
    gracePeriod = await this.applyBusinessRules(gracePeriod, lending, user);

    // Apply seasonal adjustments
    gracePeriod = this.applySeasonalAdjustment(gracePeriod);

    // Apply weekend adjustments
    gracePeriod = this.applyWeekendAdjustment(gracePeriod, lending.expectedReturnDate);

    // Apply amount-based adjustments
    gracePeriod = this.applyAmountAdjustment(gracePeriod, lending.amount);

    // Ensure minimum grace period of 0
    return Math.max(0, gracePeriod);
  }

  /**
   * Apply business rules to grace period
   */
  async applyBusinessRules(gracePeriod, lending, user) {
    let adjustedPeriod = gracePeriod;

    // High-risk borrower reduction
    if (await this.isHighRiskBorrower(lending.borrowerContact || lending.borrowerName)) {
      adjustedPeriod *= this.BUSINESS_RULES.highRiskMultiplier;
    }

    // Loyalty bonus
    if (await this.qualifiesForLoyaltyBonus(user._id)) {
      adjustedPeriod += this.BUSINESS_RULES.loyaltyBonus.bonusDays;
    }

    return Math.round(adjustedPeriod);
  }

  /**
   * Apply seasonal adjustments
   */
  applySeasonalAdjustment(gracePeriod) {
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
    const seasonalAdjustments = this.BUSINESS_RULES.seasonalAdjustments;

    const monthNames = {
      1: 'january',
      2: null,
      3: null,
      4: 'april',
      5: null,
      6: 'june',
      7: null,
      8: null,
      9: null,
      10: 'october',
      11: null,
      12: 'december'
    };

    const adjustment = seasonalAdjustments[monthNames[currentMonth]];
    return adjustment ? gracePeriod + adjustment : gracePeriod;
  }

  /**
   * Apply weekend adjustment if due date falls on weekend
   */
  applyWeekendAdjustment(gracePeriod, expectedReturnDate) {
    const dueDate = new Date(expectedReturnDate);
    const dayOfWeek = dueDate.getDay(); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return gracePeriod + this.BUSINESS_RULES.weekendAdjustment;
    }

    return gracePeriod;
  }

  /**
   * Apply amount-based adjustments
   */
  applyAmountAdjustment(gracePeriod, amount) {
    const thresholds = this.BUSINESS_RULES.amountThresholds;

    for (const threshold of thresholds) {
      if (amount <= threshold.maxAmount) {
        return gracePeriod + threshold.adjustment;
      }
    }

    return gracePeriod;
  }

  /**
   * Check if borrower is considered high-risk
   * @param {string} borrowerIdentifier - Phone or name
   * @returns {boolean}
   */
  async isHighRiskBorrower(borrowerIdentifier) {
    // TODO: Implement risk scoring based on:
    // - Previous default history
    // - Payment patterns
    // - Credit score if available
    // - Geographic risk factors

    // For now, return false (no high-risk borrowers)
    // This would be implemented with actual risk assessment logic
    return false;
  }

  /**
   * Check if user qualifies for loyalty bonus
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  async qualifiesForLoyaltyBonus(userId) {
    try {
      // Count successful lendings (repaid status)
      const successfulLendingsCount = await require('../models').Lending.countDocuments({
        user: userId,
        status: 'repaid'
      });

      return successfulLendingsCount >= this.BUSINESS_RULES.loyaltyBonus.minLendings;
    } catch (error) {
      console.error('Error checking loyalty bonus qualification:', error);
      return false;
    }
  }

  /**
   * Get default grace period for user tier and lending type
   * @param {string} userTier - User's tier (basic, premium, enterprise)
   * @param {string} lendingType - Type of lending (emergency, non-emergency)
   * @returns {number} - Default grace period
   */
  getDefaultGracePeriod(userTier = 'basic', lendingType = 'non-emergency') {
    const configs = this.DEFAULT_CONFIGS;
    const normalizedType = lendingType === 'emergency' ? 'emergency' : 'nonEmergency';

    return configs[normalizedType]?.[userTier] || configs.nonEmergency.basic;
  }

  /**
   * Validate grace period configuration
   * @param {number} gracePeriod - Grace period to validate
   * @returns {boolean} - Is valid
   */
  validateGracePeriod(gracePeriod) {
    return Number.isInteger(gracePeriod) &&
           gracePeriod >= 0 &&
           gracePeriod <= 30; // Max 30 days
  }

  /**
   * Get grace period explanation for transparency
   * @param {Object} lending - Lending document
   * @param {Object} user - User document
   * @param {number} effectiveGracePeriod - Calculated grace period
   * @returns {Object} - Explanation object
   */
  async getGracePeriodExplanation(lending, user, effectiveGracePeriod) {
    const baseGracePeriod = user.getGracePeriodForLoanType(lending.type);
    const adjustments = [];

    // Check for business rule adjustments
    if (await this.isHighRiskBorrower(lending.borrowerContact || lending.borrowerName)) {
      adjustments.push({
        type: 'high_risk_reduction',
        description: 'Reduced grace period due to borrower risk factors',
        adjustment: -Math.round(baseGracePeriod * (1 - this.BUSINESS_RULES.highRiskMultiplier))
      });
    }

    if (await this.qualifiesForLoyaltyBonus(user._id)) {
      adjustments.push({
        type: 'loyalty_bonus',
        description: 'Extended grace period for loyal user',
        adjustment: this.BUSINESS_RULES.loyaltyBonus.bonusDays
      });
    }

    // Check seasonal adjustments
    const seasonalAdjustment = this.applySeasonalAdjustment(0) - 0;
    if (seasonalAdjustment !== 0) {
      adjustments.push({
        type: 'seasonal_adjustment',
        description: `Seasonal ${seasonalAdjustment > 0 ? 'extension' : 'reduction'}`,
        adjustment: seasonalAdjustment
      });
    }

    // Check weekend adjustments
    const weekendAdjustment = this.applyWeekendAdjustment(0, lending.expectedReturnDate) - 0;
    if (weekendAdjustment !== 0) {
      adjustments.push({
        type: 'weekend_adjustment',
        description: 'Extended due to weekend due date',
        adjustment: weekendAdjustment
      });
    }

    // Check amount adjustments
    const amountAdjustment = this.applyAmountAdjustment(0, lending.amount) - 0;
    if (amountAdjustment !== 0) {
      adjustments.push({
        type: 'amount_adjustment',
        description: `Adjustment based on lending amount (KES ${lending.amount.toLocaleString()})`,
        adjustment: amountAdjustment
      });
    }

    return {
      baseGracePeriod,
      effectiveGracePeriod,
      totalAdjustment: effectiveGracePeriod - baseGracePeriod,
      adjustments
    };
  }
}

module.exports = new GracePeriodService();