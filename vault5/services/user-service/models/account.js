const { pool, logger } = require('../server');
const { v4: uuidv4 } = require('uuid');

class Account {
  static async create(accountData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        userId,
        type,
        percentage,
        balance = 0,
        target = 0,
        status = 'green'
      } = accountData;

      const id = uuidv4();
      const query = `
        INSERT INTO accounts (id, user_id, type, percentage, balance, target, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [id, userId, type, percentage, balance, target, status];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Account creation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT * FROM accounts WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Find account by ID error:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const query = `
        SELECT * FROM accounts WHERE user_id = $1 ORDER BY type
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Find accounts by user ID error:', error);
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
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      });

      values.push(id);

      const query = `
        UPDATE accounts
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Update account error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteById(id) {
    try {
      const query = 'DELETE FROM accounts WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }

  static async updateBalance(id, amount) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current balance
      const currentResult = await client.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [id]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Account not found');
      }

      const currentBalance = parseFloat(currentResult.rows[0].balance);
      const newBalance = currentBalance + parseFloat(amount);

      const updateQuery = `
        UPDATE accounts
        SET balance = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await client.query(updateQuery, [newBalance, id]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Update balance error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTotalBalance(userId) {
    try {
      const query = `
        SELECT COALESCE(SUM(balance), 0) as total_balance
        FROM accounts WHERE user_id = $1
      `;
      const result = await pool.query(query, [userId]);
      return parseFloat(result.rows[0].total_balance);
    } catch (error) {
      logger.error('Get total balance error:', error);
      throw error;
    }
  }

  static async getAccountSummary(userId) {
    try {
      const query = `
        SELECT
          type,
          balance,
          target,
          status,
          percentage
        FROM accounts
        WHERE user_id = $1
        ORDER BY type
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Get account summary error:', error);
      throw error;
    }
  }

  static async createDefaultAccounts(userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const defaults = [
        { type: 'Daily', percentage: 50 },
        { type: 'Emergency', percentage: 10 },
        { type: 'Investment', percentage: 20 },
        { type: 'LongTerm', percentage: 10 },
        { type: 'Fun', percentage: 5 },
        { type: 'Charity', percentage: 5 },
      ];

      const createdAccounts = [];

      for (const account of defaults) {
        const id = uuidv4();
        const query = `
          INSERT INTO accounts (id, user_id, type, percentage, balance, target, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;

        const values = [
          id,
          userId,
          account.type,
          account.percentage,
          0,
          0,
          'green'
        ];

        const result = await client.query(query, values);
        createdAccounts.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdAccounts;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Create default accounts error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE accounts
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Update account status error:', error);
      throw error;
    }
  }

  static async bulkUpdatePercentages(userId, percentages) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [type, percentage] of Object.entries(percentages)) {
        await client.query(
          'UPDATE accounts SET percentage = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND type = $3',
          [percentage, userId, type]
        );
      }

      await client.query('COMMIT');

      // Return updated accounts
      return await this.findByUserId(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Bulk update percentages error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Account;