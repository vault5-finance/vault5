const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== 'migrate.js')
      .sort();

    // Get executed migrations
    const executedResult = await client.query('SELECT name FROM migrations');
    const executedMigrations = executedResult.rows.map(row => row.name);

    // Run pending migrations
    for (const file of files) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);

        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);

        console.log(`Migration ${file} completed successfully`);
      } else {
        console.log(`Migration ${file} already executed, skipping`);
      }
    }

    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };