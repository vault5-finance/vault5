const plaid = require('plaid');
const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV } = process.env;

// Map environment string to Plaid environment object
const getPlaidEnvironment = (env) => {
  switch (env) {
    case 'sandbox':
      return 'sandbox';
    case 'development':
      return 'development';
    case 'production':
      return 'production';
    default:
      return 'sandbox'; // Default to sandbox
  }
};

// Only initialize client if credentials are available
// Plaid v10+ style with Configuration and PlaidApi. Falls back gracefully on missing creds.
let client = null;
if (PLAID_CLIENT_ID && PLAID_SECRET && PLAID_ENV) {
  try {
    const { Configuration, PlaidApi, PlaidEnvironments } = plaid;
    const envName = getPlaidEnvironment(PLAID_ENV); // 'sandbox' | 'development' | 'production'
    const basePath =
      (PlaidEnvironments && PlaidEnvironments[envName]) ||
      (plaid.environments && plaid.environments[envName]); // older SDKs

    const config = new Configuration({
      basePath,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
          'PLAID-SECRET': PLAID_SECRET,
        },
      },
    });

    client = new PlaidApi(config);
    console.log('Plaid client initialized successfully');
  } catch (error) {
    console.warn('Plaid client initialization failed:', error.message);
    client = null;
  }
} else {
  console.warn('Plaid credentials not configured - Plaid features will be disabled');
}

// Create link token for client-side Plaid Link
const createLinkToken = async (userId) => {
  if (!client) {
    throw new Error('Plaid client not configured');
  }
  const response = await client.linkTokenCreate({
    user: { client_user_id: String(userId) },
    client_name: 'Vault5',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
  });
  return response.data.link_token;
};

// Exchange public token for access token
const exchangePublicToken = async (publicToken) => {
  if (!client) {
    throw new Error('Plaid client not configured');
  }
  const response = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data.access_token;
};

// Sync transactions
const syncTransactions = async (accessToken) => {
  if (!client) {
    throw new Error('Plaid client not configured');
  }
  // Get initial transactions
  const start_date = '2020-01-01';
  const end_date = new Date().toISOString().split('T')[0];
  const response = await client.transactionsGet({
    access_token: accessToken,
    start_date,
    end_date,
    options: {
      count: 100,
      offset: 0,
    },
  });

  // Process transactions and save to database
  return (response.data && response.data.transactions) ? response.data.transactions : [];
};

// Handle webhook events
const handleWebhook = async (webhookBody) => {
  const { webhook_type, webhook_code } = webhookBody;
  
  if (webhook_type === 'TRANSACTIONS' && webhook_code === 'DEFAULT_UPDATE') {
    const { item_id, new_transactions } = webhookBody;
    // Fetch new transactions and process them
  }
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  syncTransactions,
  handleWebhook
};