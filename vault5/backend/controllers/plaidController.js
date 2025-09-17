const plaidService = require('../services/plaid');
const { User } = require('../models');
const { catchAsync } = require('../utils/errorHandler');

// Create Plaid link token
exports.createLinkToken = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const linkToken = await plaidService.createLinkToken(userId);
  res.json({ link_token: linkToken });
});

// Exchange public token for access token
exports.exchangePublicToken = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { public_token } = req.body;
  
  const accessToken = await plaidService.exchangePublicToken(public_token);
  
  // Save access token to user account
  await User.findByIdAndUpdate(userId, { 
    $set: { 'plaid.accessToken': accessToken } 
  });
  
  // Sync initial transactions
  await plaidService.syncTransactions(accessToken);
  
  res.json({ status: 'success', access_token: accessToken });
});

// Handle Plaid webhook
exports.handleWebhook = catchAsync(async (req, res) => {
  await plaidService.handleWebhook(req.body);
  res.status(200).json({ status: 'webhook received' });
});

// Get transactions
exports.getTransactions = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById(userId);
  
  if (!user.plaid.accessToken) {
    return res.status(400).json({ error: 'No Plaid access token' });
  }
  
  const transactions = await plaidService.syncTransactions(user.plaid.accessToken);
  res.json({ transactions });
});