const Transaction = require('../models/transaction');

describe('Transaction Model', () => {
  describe('create', () => {
    it('should create a new transaction', async () => {
      const transactionData = global.createTestTransaction({
        amount: 5000,
        type: 'income',
        description: 'Salary payment',
        tag: 'salary'
      });

      const transaction = await Transaction.create(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.userId).toBe(transactionData.userId);
      expect(transaction.amount).toBe(5000);
      expect(transaction.type).toBe('income');
      expect(transaction.description).toBe('Salary payment');
      expect(transaction.tag).toBe('salary');
      expect(transaction.fraudRisk.riskScore).toBe(0);
      expect(transaction.fraudRisk.isHighRisk).toBe(false);
    });

    it('should create an expense transaction', async () => {
      const transactionData = global.createTestTransaction({
        amount: 100,
        type: 'expense',
        description: 'Coffee purchase',
        tag: 'food'
      });

      const transaction = await Transaction.create(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('expense');
      expect(transaction.amount).toBe(100);
    });
  });

  describe('findById', () => {
    it('should find a transaction by ID', async () => {
      const transactionData = global.createTestTransaction();
      const created = await Transaction.create(transactionData);

      const found = await Transaction.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.userId).toBe(created.userId);
    });

    it('should return null for non-existent transaction', async () => {
      const found = await Transaction.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    beforeEach(async () => {
      // Create test transactions
      await Transaction.create(global.createTestTransaction({
        amount: 1000,
        description: 'Transaction 1'
      }));
      await Transaction.create(global.createTestTransaction({
        amount: 2000,
        description: 'Transaction 2'
      }));
      await Transaction.create(global.createTestTransaction({
        amount: 500,
        type: 'expense',
        description: 'Transaction 3'
      }));
    });

    it('should find all transactions for a user', async () => {
      const transactions = await Transaction.findByUserId('test-user-id');

      expect(transactions).toHaveLength(3);
      expect(transactions.every(t => t.userId === 'test-user-id')).toBe(true);
    });

    it('should filter by type', async () => {
      const incomeTransactions = await Transaction.findByUserId('test-user-id', { type: 'income' });
      const expenseTransactions = await Transaction.findByUserId('test-user-id', { type: 'expense' });

      expect(incomeTransactions).toHaveLength(2);
      expect(expenseTransactions).toHaveLength(1);
    });

    it('should apply pagination', async () => {
      const transactions = await Transaction.findByUserId('test-user-id', {}, { limit: 2, offset: 1 });

      expect(transactions).toHaveLength(2);
    });
  });

  describe('updateById', () => {
    it('should update a transaction', async () => {
      const transactionData = global.createTestTransaction();
      const created = await Transaction.create(transactionData);

      const updateData = {
        amount: 1500,
        description: 'Updated description'
      };

      const updated = await Transaction.updateById(created.id, updateData);

      expect(updated).toBeDefined();
      expect(updated.amount).toBe(1500);
      expect(updated.description).toBe('Updated description');
    });
  });

  describe('deleteById', () => {
    it('should delete a transaction', async () => {
      const transactionData = global.createTestTransaction();
      const created = await Transaction.create(transactionData);

      const deleted = await Transaction.deleteById(created.id);

      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(created.id);

      // Verify it's deleted
      const found = await Transaction.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('getUserTransactionStats', () => {
    beforeEach(async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await Transaction.create(global.createTestTransaction({
        amount: 5000,
        type: 'income',
        date: new Date('2024-01-15')
      }));
      await Transaction.create(global.createTestTransaction({
        amount: 2000,
        type: 'income',
        date: new Date('2024-02-15')
      }));
      await Transaction.create(global.createTestTransaction({
        amount: 1000,
        type: 'expense',
        date: new Date('2024-03-15')
      }));
    });

    it('should calculate user transaction statistics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const stats = await Transaction.getUserTransactionStats('test-user-id', startDate, endDate);

      expect(stats.total_transactions).toBe(3);
      expect(stats.total_income).toBe(7000);
      expect(stats.total_expenses).toBe(1000);
    });
  });
});