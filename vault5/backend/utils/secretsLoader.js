const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const secretsManager = new AWS.SecretsManager();

async function loadSecrets() {
  try {
    const secretName = process.env.AWS_SECRETS_NAME || 'vault5/prod';
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    
    if ('SecretString' in data) {
      const secrets = JSON.parse(data.SecretString);
      
      // Set secrets as environment variables
      for (const [key, value] of Object.entries(secrets)) {
        process.env[key] = value;
        console.log(`Loaded secret: ${key}`);
      }
      
      return true;
    }
    
    throw new Error('No SecretString found in AWS Secrets Manager response');
  } catch (error) {
    console.error('Failed to load secrets from AWS:', error);
    return false;
  }
}

module.exports = { loadSecrets };