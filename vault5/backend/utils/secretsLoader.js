const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Configure AWS SDK (only if credentials are provided)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
}

const secretsManager = process.env.AWS_ACCESS_KEY_ID ? new AWS.SecretsManager() : null;

async function loadSecrets() {
  // Try AWS Secrets Manager first (only if configured)
  if (secretsManager && process.env.AWS_SECRETS_NAME) {
    try {
      const secretName = process.env.AWS_SECRETS_NAME;
      const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

      if ('SecretString' in data) {
        const secrets = JSON.parse(data.SecretString);

        // Set secrets as environment variables
        for (const [key, value] of Object.entries(secrets)) {
          process.env[key] = value;
          console.log(`Loaded secret from AWS: ${key}`);
        }

        return true;
      }
    } catch (error) {
      console.warn('Failed to load secrets from AWS, falling back to local .env:', error.message);
    }
  }

  // Fallback to local environment variables
  console.log('Using local environment variables for secrets');
  return true;
}

// Export secrets for easy access
const secrets = {
  PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
  PLAID_SECRET: process.env.PLAID_SECRET,
  PLAID_ENV: process.env.PLAID_ENV || 'sandbox',
  JWT_SECRET: process.env.JWT_SECRET || 'vault5devsecret',
  MONGO_URI: process.env.MONGO_URI,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY
};

module.exports = { loadSecrets, secrets };