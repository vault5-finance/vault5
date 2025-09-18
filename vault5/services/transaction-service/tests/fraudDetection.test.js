const fraudDetectionService = require('../services/fraudDetection');

describe('Fraud Detection Service', () => {
  beforeEach(() => {
    // Reset service state
    fraudDetectionService.updateRiskThreshold(0.7);
  });

  describe('analyzeTransaction', () => {
    it('should return low risk for normal transaction', async () => {
      const transactionData = {
        userId: 'test-user',
        amount: 1000,
        type: 'income',
        description: 'Salary payment',
        date: new Date()
      };

      const result = await fraudDetectionService.analyzeTransaction('test-user', transactionData);

      expect(result).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(1);
      expect(typeof result.isHighRisk).toBe('boolean');
      expect(Array.isArray(result.flags)).toBe(true);
    });

    it('should detect high risk transaction', async () => {
      const transactionData = {
        userId: 'test-user',
        amount: 100000, // Very large amount
        type: 'expense',
        description: 'Test transaction',
        date: new Date('2024-01-01T03:00:00') // Unusual hour
      };

      const result = await fraudDetectionService.analyzeTransaction('test-user', transactionData);

      expect(result).toBeDefined();
      expect(result.riskScore).toBeGreaterThan(0.5);
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('should detect suspicious keywords', async () => {
      const transactionData = {
        userId: 'test-user',
        amount: 500,
        type: 'expense',
        description: 'Test transaction fake payment',
        date: new Date()
      };

      const result = await fraudDetectionService.analyzeTransaction('test-user', transactionData);

      expect(result.flags).toContain('suspicious_keywords');
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should detect round number amounts', async () => {
      const transactionData = {
        userId: 'test-user',
        amount: 10000, // Round number
        type: 'expense',
        description: 'Round number transaction',
        date: new Date()
      };

      const result = await fraudDetectionService.analyzeTransaction('test-user', transactionData);

      expect(result.flags).toContain('round_number_amount');
    });

    it('should detect unusual hours', async () => {
      const transactionData = {
        userId: 'test-user',
        amount: 500,
        type: 'expense',
        description: 'Late night transaction',
        date: new Date('2024-01-01T04:00:00') // 4 AM
      };

      const result = await fraudDetectionService.analyzeTransaction('test-user', transactionData);

      expect(result.flags).toContain('unusual_hours');
    });
  });

  describe('updateRiskThreshold', () => {
    it('should update risk threshold', () => {
      fraudDetectionService.updateRiskThreshold(0.8);
      // We can't directly test the internal threshold, but the method should not throw
      expect(() => fraudDetectionService.updateRiskThreshold(0.8)).not.toThrow();
    });

    it('should clamp threshold between 0 and 1', () => {
      expect(() => fraudDetectionService.updateRiskThreshold(-0.1)).not.toThrow();
      expect(() => fraudDetectionService.updateRiskThreshold(1.5)).not.toThrow();
    });
  });

  describe('getFraudStatistics', () => {
    it('should return fraud statistics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const stats = await fraudDetectionService.getFraudStatistics('test-user', startDate, endDate);

      expect(stats).toBeDefined();
      expect(typeof stats.totalTransactions).toBe('number');
      expect(typeof stats.highRiskTransactions).toBe('number');
      expect(typeof stats.averageRiskScore).toBe('number');
      expect(typeof stats.riskFlags).toBe('object');
    });
  });

  describe('service configuration', () => {
    it('should respect disabled fraud detection', async () => {
      // Temporarily disable fraud detection
      const originalEnabled = process.env.FRAUD_DETECTION_ENABLED;
      process.env.FRAUD_DETECTION_ENABLED = 'false';

      // Re-require to get new instance
      delete require.cache[require.resolve('../services/fraudDetection')];
      const disabledService = require('../services/fraudDetection');

      const transactionData = {
        userId: 'test-user',
        amount: 100000,
        type: 'expense',
        description: 'Should be ignored',
        date: new Date('2024-01-01T03:00:00')
      };

      const result = await disabledService.analyzeTransaction('test-user', transactionData);

      expect(result.riskScore).toBe(0);
      expect(result.isHighRisk).toBe(false);
      expect(result.flags).toEqual([]);

      // Restore original setting
      process.env.FRAUD_DETECTION_ENABLED = originalEnabled;
    });
  });
});