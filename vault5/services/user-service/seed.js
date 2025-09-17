const bcrypt = require('bcryptjs');
const { pool, logger } = require('./server');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  const client = await pool.connect();

  try {
    // Check if default user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['bnyaliti@gmail.com']
    );

    if (existingUser.rows.length > 0) {
      logger.info('Default user already exists');
      return;
    }

    // Create default user
    const password = 'Admin';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = uuidv4();
    const userData = [
      userId,
      'Bryson Nyaliti Omullo',
      'bnyaliti@gmail.com',
      hashedPassword,
      'admin', // role
      new Date('2001-07-31'), // dob
      '+254745959794', // phone
      'Nairobi', // city
      '', // avatar
      true, // terms_accepted
      true, // is_verified
      true, // kyc_completed
      true, // is_active
      4 // registration_step
    ];

    await client.query(`
      INSERT INTO users (
        id, name, email, password_hash, role, dob, phone, city, avatar,
        terms_accepted, is_verified, kyc_completed, is_active, registration_step
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, userData);

    // Create default accounts
    const defaultAccounts = [
      { type: 'Daily', percentage: 50 },
      { type: 'Emergency', percentage: 10 },
      { type: 'Investment', percentage: 20 },
      { type: 'LongTerm', percentage: 10 },
      { type: 'Fun', percentage: 5 },
      { type: 'Charity', percentage: 5 },
    ];

    for (const account of defaultAccounts) {
      await client.query(`
        INSERT INTO accounts (id, user_id, type, percentage, balance, target, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        uuidv4(),
        userId,
        account.type,
        account.percentage,
        0, // balance
        0, // target
        'green' // status
      ]);
    }

    logger.info('Default user and accounts created successfully');

  } catch (error) {
    logger.error('Seeding error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seed if executed directly
if (require.main === module) {
  require('dotenv').config();

  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };