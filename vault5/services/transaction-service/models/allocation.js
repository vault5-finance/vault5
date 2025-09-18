const { pool, logger } = require('../server');
const { v4: uuidv4 } = require('uuid');

class Allocation {
  static async create(allocationData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        userId,
        transactionId,
        accountId,
        amount,
        accountType,
        status = 'green'
      } = allocationData;

      const id = uuidv4();
      const query = `
        INSERT INTO allocations (
          id, user_id, transaction_id, account_id, amount, account_type, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [id, userId, transactionId, accountId, amount, accountType, status];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return this._formatAllocation(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Allocation creation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByTransactionId(transactionId) {
    try {
      const query = `
        SELECT * FROM allocations WHERE transaction_id = $1 ORDER BY created_at
      `;
      const result = await pool.query(query, [transactionId]);
      return result.rows.map(row => this._formatAllocation(row));
    } catch (error) {
      logger.error('Find allocations by transaction ID error:', error);
      throw error;
    }
  }

  static async findByUserId(userId, filters = {}, pagination = {}) {
    try {
      let query = `
        SELECT * FROM allocations WHERE user_id = $1
      `;
      const values = [userId];
      let paramCount = 2;

      if (filters.accountId) {
        query += ` AND account_id = $${paramCount}`;
        values.push(filters.accountId);
        paramCount++;
      }

      if (filters.status) {
        query += ` AND status = $${paramCount}`;
        values.push(filters.status);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

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
      return result.rows.map(row => this._formatAllocation(row));
    } catch (error) {
      logger.error('Find allocations by user ID error:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE allocations
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [status, id]);
      return result.rows[0] ? this._formatAllocation(result.rows[0]) : null;
    } catch (error) {
      logger.error('Update allocation status error:', error);
      throw error;
    }
  }

  static async getUserAllocationSummary(userId, startDate, endDate) {
    try {
      const query = `
        SELECT
          account_type,
          status,
          COUNT(*) as count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount
        FROM allocations a
        JOIN transactions t ON a.transaction_id = t.id
        WHERE a.user_id = $1
        AND t.date >= $2 AND t.date <= $3
        GROUP BY account_type, status
        ORDER BY account_type, status
      `;
      const result = await pool.query(query, [userId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      logger.error('Get user allocation summary error:', error);
      throw error;
    }
  }

  static _formatAllocation(row) {
    return {
      id: row.id,
      userId: row.user_id,
      transactionId: row.transaction_id,
      accountId: row.account_id,
      amount: parseFloat(row.amount),
      accountType: row.account_type,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Allocation;