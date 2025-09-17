const { pool, logger } = require('../server');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        name,
        email,
        password,
        dob,
        phone,
        city,
        avatar = '',
        role = 'user'
      } = userData;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const id = uuidv4();
      const query = `
        INSERT INTO users (
          id, name, email, password_hash, role, dob, phone, city, avatar
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [id, name, email, passwordHash, role, dob, phone, city, avatar];
      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('User creation error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT id, name, email, role, avatar, dob, phone, city, address,
               terms_accepted, is_verified, kyc_completed, is_active,
               registration_step, preferences, created_at, updated_at
        FROM users WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Find user by ID error:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const query = `
        SELECT * FROM users WHERE email = $1
      `;
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      logger.error('Find user by email error:', error);
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
        if (key === 'password') {
          fields.push(`password_hash = $${paramCount}`);
          values.push(updateData[key]);
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
        }
        paramCount++;
      });

      values.push(id);

      const query = `
        UPDATE users
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Update user error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteById(id) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  static async findAll(filters = {}, pagination = {}) {
    try {
      let query = `
        SELECT id, name, email, role, avatar, is_active, created_at
        FROM users WHERE 1=1
      `;
      const values = [];
      let paramCount = 1;

      if (filters.role) {
        query += ` AND role = $${paramCount}`;
        values.push(filters.role);
        paramCount++;
      }

      if (filters.is_active !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        values.push(filters.is_active);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        values.push(`%${filters.search}%`);
        paramCount++;
      }

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
      return result.rows;
    } catch (error) {
      logger.error('Find all users error:', error);
      throw error;
    }
  }

  static async count(filters = {}) {
    try {
      let query = 'SELECT COUNT(*) FROM users WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.role) {
        query += ` AND role = $${paramCount}`;
        values.push(filters.role);
        paramCount++;
      }

      if (filters.is_active !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        values.push(filters.is_active);
        paramCount++;
      }

      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Count users error:', error);
      throw error;
    }
  }

  static async updatePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      const query = `
        UPDATE users
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [passwordHash, id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Update password error:', error);
      throw error;
    }
  }

  static async setResetToken(id, token, expires) {
    try {
      const query = `
        UPDATE users
        SET reset_password_token = $1, reset_password_expires = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      const result = await pool.query(query, [token, expires, id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Set reset token error:', error);
      throw error;
    }
  }

  static async findByResetToken(token) {
    try {
      const query = `
        SELECT * FROM users
        WHERE reset_password_token = $1
        AND reset_password_expires > CURRENT_TIMESTAMP
      `;
      const result = await pool.query(query, [token]);
      return result.rows[0];
    } catch (error) {
      logger.error('Find by reset token error:', error);
      throw error;
    }
  }

  static async clearResetToken(id) {
    try {
      const query = `
        UPDATE users
        SET reset_password_token = NULL, reset_password_expires = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Clear reset token error:', error);
      throw error;
    }
  }
}

module.exports = User;