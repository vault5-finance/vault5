/**
 * M-Pesa style transaction code generator
 * - Uppercase alphanumerics
 * - Excludes easily-confused characters (I, O, 0, 1)
 * - Typical length: 10-12; default 10
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a random M-Pesa-like transaction code.
 * @param {number} length - Code length (default 10)
 * @returns {string}
 */
function generateMpesaCode(length = 10) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Ensure uniqueness against a Transaction model by checking the transactionCode field.
 * @param {import('mongoose').Model} TransactionModel - Mongoose Transaction model
 * @param {number} length - Code length (default 10)
 * @param {number} maxAttempts - Max retries before failing
 * @returns {Promise<string>}
 */
async function generateUniqueTransactionCode(TransactionModel, length = 10, maxAttempts = 8) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateMpesaCode(length);
    const exists = await TransactionModel.findOne({ transactionCode: code }).lean();
    if (!exists) return code;
  }
  throw new Error('Unable to generate unique transaction code after several attempts');
}

module.exports = {
  generateMpesaCode,
  generateUniqueTransactionCode,
};
