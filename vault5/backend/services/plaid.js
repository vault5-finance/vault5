const plaid = require('plaid');
const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV } = process.env;

const client = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments[PLAID_ENV],
  options: {
    version: '2020-09-14'
  }
});

// Create link token for client-side Plaid Link
const createLinkToken = async (userId) => {
  const response = await client.createLinkToken({
    user: { client_user_id: userId },
    client_name: 'Vault5',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en'
  });
  return response.link_token;
};

// Exchange public token for access token
const exchangePublicToken = async (publicToken) => {
  const response = await client.exchangePublicToken(publicToken);
  return response.access_token;
};

// Sync transactions
const syncTransactions = async (accessToken) => {
  // Get initial transactions
  const response = await client.getTransactions(accessToken, '2020-01-01', new Date().toISOString().split('T')[0], {
    count: 100,
    offset: 0
  });
  
  // Process transactions and save to database
  return response.transactions;
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