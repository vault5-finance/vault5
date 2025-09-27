# Daily Overdue Reminder System

This directory contains scripts for the automated overdue reminder system.

## Overview

The overdue reminder system automatically:
1. Finds overdue lendings (expectedReturnDate < today and status is 'pending')
2. Marks them as 'overdue' in the database
3. Sends email reminders via emailService.sendNotificationEmail()
4. Creates in-app notifications via notifications routes

## Setup Instructions

### 1. Make the script executable

```bash
chmod +x vault5/backend/scripts/daily-overdue-check.js
```

### 2. Set up Cron Job

Add the following line to your crontab to run the script daily at 9:00 AM:

```bash
crontab -e
```

Add this line:
```cron
0 9 * * * /usr/bin/node /absolute/path/to/vault5/backend/scripts/daily-overdue-check.js
```

**Note:** Replace `/absolute/path/to/vault5` with the actual absolute path to your vault5 directory.

### 3. Alternative: Manual Execution

You can also run the script manually for testing:

```bash
cd vault5/backend
node scripts/daily-overdue-check.js
```

### 4. Verify Setup

To verify the cron job is set up correctly:

```bash
crontab -l
```

You should see the cron job line in the output.

## API Endpoints

The system also provides manual trigger endpoints:

### Process All Overdue Reminders
```http
POST /api/scheduler/process-overdue-reminders
```

### Get Overdue Summary for Current User
```http
GET /api/scheduler/overdue-summary
```

### Process Overdue Reminders for Current User (Testing)
```http
POST /api/scheduler/process-user-overdue
```

## Environment Variables Required

Make sure these environment variables are set:

- `MONGO_URI` - MongoDB connection string
- `FROM_EMAIL` - Email address for sending notifications
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - SMTP configuration (for production)

## Logging

The script logs its progress to the console. In production, you may want to redirect output to a log file:

```cron
0 9 * * * /usr/bin/node /absolute/path/to/vault5/backend/scripts/daily-overdue-check.js >> /var/log/vault5-overdue.log 2>&1
```

## Troubleshooting

### Common Issues

1. **Script not running**: Check if the absolute path is correct and the script is executable
2. **Database connection errors**: Verify MONGO_URI is set correctly
3. **Email sending failures**: Check SMTP configuration
4. **Permission errors**: Ensure the user running the cron job has proper permissions

### Testing

To test the system manually:

1. Create a lending with an expected return date in the past
2. Run the script manually: `node scripts/daily-overdue-check.js`
3. Check if:
   - The lending status changed to 'overdue'
   - An email was sent (check console in development)
   - An in-app notification was created
   - The frontend shows the overdue notification

## Security Notes

- The script requires database and email credentials
- Ensure proper file permissions on the script
- Consider running as a dedicated system user
- Monitor for failures and set up alerting if needed