#!/usr/bin/env node

/**
 * Scheduled Overdue Reminder Check Script
 *
 * This script should be run regularly (e.g., hourly) by a cron job to:
 * 1. Check for pending reminders that should be sent based on user schedules
 * 2. Send escalating reminders through appropriate channels
 * 3. Track reminder delivery and effectiveness
 *
 * Usage:
 * - Add to cron (hourly): 0 * * * * /usr/bin/node /path/to/vault5/backend/scripts/daily-overdue-check.js
 * - Or run manually: node vault5/backend/scripts/daily-overdue-check.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { loadSecrets } = require('../utils/secretsLoader');
const overdueReminderService = require('../services/overdueReminderService');

// Load environment variables
dotenv.config();

async function runDailyOverdueCheck() {
  try {
    console.log('🔄 Starting daily overdue reminder check...');
    console.log('Timestamp:', new Date().toISOString());

    // Load secrets before DB connection
    const secretsLoaded = await loadSecrets();
    if (!secretsLoaded) {
      console.warn('⚠️  Secrets not loaded from AWS - using local environment variables');
    }

    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is required');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Run the overdue check
    const results = await overdueReminderService.processOverdueLendings();

    // Log results
    console.log('📊 Overdue check results:');
    console.log(`   - Processed: ${results.processed} lendings`);
    console.log(`   - Emails sent: ${results.emailsSent}`);
    console.log(`   - Notifications created: ${results.notificationsCreated}`);

    if (results.errors.length > 0) {
      console.log(`   - Errors: ${results.errors.length}`);
      results.errors.forEach(error => {
        console.log(`     * Lending ${error.lendingId}: ${error.error}`);
      });
    }

    console.log('✅ Daily overdue check completed successfully');

  } catch (error) {
    console.error('❌ Error running daily overdue check:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
runDailyOverdueCheck();