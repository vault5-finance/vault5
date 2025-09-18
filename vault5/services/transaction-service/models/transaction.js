const { pool, logger } = require('../server');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  static async create(transactionData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        userId,
        amount,
        type,
        description,
        tag = '',
        date = new Date(),
        fraudRisk = { riskScore: 0, isHighRisk: false, flags: [] },
        allocations = []
      } = transactionData;

      const id = uuidv4();
      const query = `
        INSERT INTO transactions (
          id, user_id, amount, type, description, tag, date,
          fraud_risk_score, fraud_is_high_risk, fraud_flags, allocations
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        id, userId, amount, type, description, tag, date,
        fraudRisk.riskScore || 0,
        fraudRisk.isHighRisk || false,
        JSON.stringify(fraudRisk.flags || []),
        JSON.stringify(allocations)
      ];

      const result = await client.query(query, values);

      await client.query('COMMIT');
      return this._formatTransaction(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction creation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT * FROM transactions WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] ? this._formatTransaction(result.rows[0]) : null;
    } catch (error) {
      logger.error('Find transaction by ID error:', error);
      throw error;
    }
  }

  static async findByUserId(userId, filters = {}, pagination = {}) {
    try {
      let query = `
        SELECT * FROM transactions WHERE user_id = $1
      `;
      const values = [userId];
      let paramCount = 2;

      if (filters.type) {
        query += ` AND type = $${paramCount}`;
        values.push(filters.type);
        paramCount++;
      }

      if (filters.startDate) {
        query += ` AND date >= $${paramCount}`;
        values.push(filters.startDate);
        paramCount++;
      }

      if (filters.endDate) {
        query += ` AND date <= $${paramCount}`;
        values.push(filters.endDate);
        paramCount++;
      }

      if (filters.minAmount !== undefined) {
        query += ` AND amount >= $${paramCount}`;
        values.push(filters.minAmount);
        paramCount++;
      }

      if (filters.maxAmount !== undefined) {
        query += ` AND amount <= $${paramCount}`;
        values.push(filters.maxAmount);
        paramCount++;
      }

      query += ' ORDER BY date DESC, created_at DESC';

      // Pagination
      if (pagination.limit) {
        query += ` LIMIT $${paramCount}`;
        values.push(pagination.limit);
        paramCount++;
      }

      if (pagination.offset) {
        query += ` OFFSET $${paramCount}`;
        values.push(pagination.offset);
        paramCount++;
      }

      const result = await pool.query(query, values);
      return result.rows.map(row => this._formatTransaction(row));
    } catch (error) {
      logger.error('Find transactions by user ID error:', error);
      throw error;
    }
  }

  static async updateById(id, updateData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        if (key === 'fraudRisk') {
          fields.push(`fraud_risk_score = $${paramCount}`);
          values.push(updateData.fraudRisk.riskScore || 0);
          paramCount++;
          fields.push(`fraud_is_high_risk = $${paramCount}`);
          values.push(updateData.fraudRisk.isHighRisk || false);
          paramCount++;
          fields.push(`fraud_flags = $${paramCount}`);
          values.push(JSON.stringify(updateData.fraudRisk.flags || []));
          paramCount++;
        } else if (key === 'allocations') {
          fields.push(`allocations = $${paramCount}`);
          values.push(JSON.stringify(updateData.allocations));
          paramCount++;
        } else {
          fields.push(`${this._camelToSnake(key)} = $${paramCount}`);
          values.push(updateData[key]);
          paramCount++;
        }
      });

      values.push(id);

      const query = `
        UPDATE transactions
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0] ? this._formatTransaction(result.rows[0]) : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Update transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteById(id) {
    try {
      const query = 'DELETE FROM transactions WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0] ? this._formatTransaction(result.rows[0]) : null;
    } catch (error) {
      logger.error('Delete transaction error:', error);
      throw error;
    }
  }

  static async getUserTransactionStats(userId, startDate, endDate) {
    try {
      const query = `
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
          AVG(CASE WHEN type = 'income' THEN amount ELSE NULL END) as avg_income,
          AVG(CASE WHEN type = 'expense' THEN amount ELSE NULL END) as avg_expense
        FROM transactions
        WHERE user_id = $1
        AND date >= $2 AND date <= $3
      `;
      const result = await pool.query(query, [userId, startDate, endDate]);
      return result.rows[0];
    } catch (error) {
      logger.error('Get user transaction stats error:', error);
      throw error;
    }
  }

  static async getFraudRiskTransactions(userId, minRiskScore = 0.5) {
    try {
      const query = `
        SELECT * FROM transactions
        WHERE user_id = $1 AND fraud_risk_score >= $2
        ORDER BY fraud_risk_score DESC
      `;
      const result = await pool.query(query, [userId, minRiskScore]);
      return result.rows.map(row => this._formatTransaction(row));
    } catch (error) {
      logger.error('Get fraud risk transactions error:', error);
      throw error;
    }
  }

  static _formatTransaction(row) {
    return {
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      type: row.type,
      description: row.description,
      tag: row.tag,
      date: row.date,
      fraudRisk: {
        riskScore: parseFloat(row.fraud_risk_score),
        isHighRisk: row.fraud_is_high_risk,
        flags: row.fraud_flags || []
      },
      allocations: row.allocations || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static _camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Transaction;