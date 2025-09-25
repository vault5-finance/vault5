const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    deviceId: { type: String, index: true, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    nickname: { type: String, default: '' },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Soft-active index (for quick concurrent session detection)
userSessionSchema.index({ user: 1, revoked: 1, lastActiveAt: -1 });

module.exports = mongoose.model('UserSession', userSessionSchema);