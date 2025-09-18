const plaidService = require('../services/plaid');
const { User } = require('../models');

// Create Plaid link token
exports.createLinkToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const linkToken = await plaidService.createLinkToken(userId);
    res.json({ link_token: linkToken });
  } catch (error) {
    console.error('Create link token error:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

// Exchange public token for access token
exports.exchangePublicToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { public_token } = req.body;

    if (!public_token) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    const accessToken = await plaidService.exchangePublicToken(public_token);

    // Save access token to user account
    await User.findByIdAndUpdate(userId, {
      $set: { 'plaid.accessToken': accessToken }
    });

    // Sync initial transactions
    await plaidService.syncTransactions(accessToken);

    res.json({ status: 'success', access_token: accessToken });
  } catch (error) {
    console.error('Exchange public token error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
};

// Handle Plaid webhook
exports.handleWebhook = async (req, res) => {
  try {
    await plaidService.handleWebhook(req.body);
    res.status(200).json({ status: 'webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Get transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.plaid || !user.plaid.accessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    const transactions = await plaidService.syncTransactions(user.plaid.accessToken);
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};