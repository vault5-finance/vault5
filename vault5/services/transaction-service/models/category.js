const { pool, logger } = require('../server');
const { v4: uuidv4 } = require('uuid');

class Category {
  static async create(categoryData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        userId,
        name,
        type,
        color = '#000000',
        icon = 'default',
        isDefault = false
      } = categoryData;

      const id = uuidv4();
      const query = `
        INSERT INTO categories (
          id, user_id, name, type, color, icon, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [id, userId, name, type, color, icon, isDefault];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return this._formatCategory(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Category creation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT * FROM categories WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] ? this._formatCategory(result.rows[0]) : null;
    } catch (error) {
      logger.error('Find category by ID error:', error);
      throw error;
    }
  }

  static async findByUserId(userId, type = null) {
    try {
      let query = `
        SELECT * FROM categories WHERE user_id = $1
      `;
      const values = [userId];

      if (type) {
        query += ` AND type = $2`;
        values.push(type);
      }

      query += ' ORDER BY is_default DESC, name ASC';

      const result = await pool.query(query, values);
      return result.rows.map(row => this._formatCategory(row));
    } catch (error) {
      logger.error('Find categories by user ID error:', error);
      throw error;
    }
  }

  static async findDefaultCategories(type = null) {
    try {
      let query = `
        SELECT * FROM categories WHERE user_id = 'system'
      `;
      const values = [];

      if (type) {
        query += ` AND type = $1`;
        values.push(type);
      }

      query += ' ORDER BY name ASC';

      const result = await pool.query(query, values);
      return result.rows.map(row => this._formatCategory(row));
    } catch (error) {
      logger.error('Find default categories error:', error);
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
        fields.push(`${this._camelToSnake(key)} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      });

      values.push(id);

      const query = `
        UPDATE categories
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0] ? this._formatCategory(result.rows[0]) : null;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Update category error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteById(id) {
    try {
      const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0] ? this._formatCategory(result.rows[0]) : null;
    } catch (error) {
      logger.error('Delete category error:', error);
      throw error;
    }
  }

  static async getCategoryStats(userId, startDate, endDate) {
    try {
      const query = `
        SELECT
          c.name,
          c.type,
          COUNT(t.id) as transaction_count,
          COALESCE(SUM(t.amount), 0) as total_amount
        FROM categories c
        LEFT JOIN transactions t ON c.name = t.tag
          AND t.user_id = $1
          AND t.date >= $2 AND t.date <= $3
        WHERE c.user_id = $1 OR c.user_id = 'system'
        GROUP BY c.id, c.name, c.type
        ORDER BY c.type, total_amount DESC
      `;
      const result = await pool.query(query, [userId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      logger.error('Get category stats error:', error);
      throw error;
    }
  }

  static _formatCategory(row) {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: row.icon,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static _camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Category;