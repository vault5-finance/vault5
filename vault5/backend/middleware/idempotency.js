'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const DEFAULT_TTL_SECONDS = Number(process.env.IDEMPOTENCY_TTL_SECONDS || 24 * 60 * 60); // 24h default
const IN_PROGRESS_WINDOW_MS = Number(process.env.IDEMPOTENCY_IN_PROGRESS_WINDOW_MS || 2 * 60 * 1000); // 2 minutes

// Mongoose model (inline to avoid editing central model exports)
const IdempotencyKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    userId: { type: String, required: true }, // stringified ObjectId or 'anon'
    method: { type: String, required: true },
    path: { type: String, required: true }, // normalized path scope (no query)
    requestHash: { type: String, required: true }, // hash of body for safety
    status: { type: String, enum: ['started', 'completed', 'failed', 'expired'], default: 'started' },
    responseStatus: { type: Number },
    responseBody: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    expiresAt: { type: Date }, // TTL anchor
  },
  { timestamps: true }
);

// Unique scope per (key, user, method, path)
IdempotencyKeySchema.index({ key: 1, userId: 1, method: 1, path: 1 }, { unique: true });
// TTL by expiresAt (expireAfterSeconds: 0 means at expiresAt time)
IdempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const IdempotencyKey =
  mongoose.models.IdempotencyKey || mongoose.model('IdempotencyKey', IdempotencyKeySchema);

/**
 * Compute a stable SHA-256 hash of the request body for safety (reject key reuse with different payloads).
 * @param {object} body
 * @returns {string}
 */
function hashBody(body) {
  const json = body && typeof body === 'object' ? JSON.stringify(body) : String(body ?? '');
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * Normalize the path scope (exclude query string, include baseUrl + path for routers).
 * @param {import('express').Request} req
 * @returns {string}
 */
function scopePath(req) {
  const base = req.baseUrl || '';
  const p = req.path || '';
  return `${base}${p}`;
}

/**
 * Create or load an idempotency "started" record, handling races.
 */
async function ensureStartedRecord({ key, userId, method, path, requestHash, ttlSeconds }) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  try {
    const created = await IdempotencyKey.create({
      key,
      userId,
      method,
      path,
      requestHash,
      status: 'started',
      expiresAt,
    });
    return created.toObject();
  } catch (e) {
    // Duplicate race: fetch the existing record
    if (e && e.code === 11000) {
      const existing = await IdempotencyKey.findOne({ key, userId, method, path }).lean();
      return existing;
    }
    throw e;
  }
}

/**
 * Idempotency middleware factory.
 * Behavior:
 * - If no Idempotency-Key header, pass-through.
 * - If key exists and prior completed response is found for this (user, method, path, key, same payload), replay it.
 * - If key exists and an in-progress record is found recent enough, return 409 with Retry-After.
 * - Otherwise create a 'started' record, and capture the eventual response to persist as 'completed'.
 *
 * Headers set on replay:
 * - Idempotency-Replay: true
 * - Idempotency-Status: completed|started
 * - Idempotency-Key: echo
 *
 * Options:
 * - ttlSeconds: override default TTL
 * - inProgressWindowMs: override default in-progress window
 */
function idempotency(options = {}) {
  const ttlSeconds = Number(options.ttlSeconds || DEFAULT_TTL_SECONDS);
  const inProgressWindowMs = Number(options.inProgressWindowMs || IN_PROGRESS_WINDOW_MS);

  return async function idempotencyMiddleware(req, res, next) {
    try {
      const headerKey =
        req.get('Idempotency-Key') ||
        req.get('X-Idempotency-Key') ||
        req.headers['idempotency-key'] ||
        req.headers['x-idempotency-key'];

      if (!headerKey) {
        return next();
      }

      const key = String(headerKey).trim();
      if (!key) return next();

      const userId = req.user?._id ? String(req.user._id) : 'anon';
      const method = (req.method || 'GET').toUpperCase();
      const path = scopePath(req);
      const requestHash = hashBody(req.body || {});

      // Try find existing record
      let record = await IdempotencyKey.findOne({ key, userId, method, path }).lean();

      if (record) {
        // Safety: do not allow the same key with different payloads
        if (record.requestHash !== requestHash) {
          res.setHeader('Idempotency-Key', key);
          res.setHeader('Idempotency-Status', 'conflict');
          return res
            .status(409)
            .json({ message: 'Idempotency key reused with a different payload' });
        }

        if (record.status === 'completed') {
          // Replay the stored response
          res.setHeader('Idempotency-Replay', 'true');
          res.setHeader('Idempotency-Key', key);
          res.setHeader('Idempotency-Status', 'completed');
          const status = record.responseStatus || 200;
          return res.status(status).json(record.responseBody);
        }

        // In progress recently?
        const createdAt = new Date(record.createdAt || Date.now());
        const ageMs = Date.now() - createdAt.getTime();
        if (record.status === 'started' && ageMs < inProgressWindowMs) {
          res.setHeader('Retry-After', String(Math.ceil((inProgressWindowMs - ageMs) / 1000)));
          res.setHeader('Idempotency-Key', key);
          res.setHeader('Idempotency-Status', 'started');
          return res
            .status(409)
            .json({ message: 'Request with this idempotency key is in progress. Retry later.' });
        }
        // Otherwise it's stale; fall-through to create/overwrite a new started record
      }

      // Ensure a "started" record (handles racing requests)
      record = await ensureStartedRecord({ key, userId, method, path, requestHash, ttlSeconds });

      // Response capture
      let capturedBody;
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      res.json = function patchedJson(body) {
        capturedBody = body;
        return originalJson(body);
      };

      res.send = function patchedSend(body) {
        // Only capture JSON-like bodies; best-effort
        try {
          if (typeof body === 'string') {
            capturedBody = body;
          } else if (body && typeof body === 'object') {
            capturedBody = body;
          }
        } catch {}
        return originalSend(body);
      };

      // On response finish, persist completion state
      res.on('finish', async () => {
        try {
          const statusCode = res.statusCode || 200;
          const update = {
            status: statusCode >= 400 ? 'failed' : 'completed',
            responseStatus: statusCode,
            responseBody: capturedBody,
            updatedAt: new Date(),
            // keep original expiresAt
          };
          await IdempotencyKey.updateOne(
            { key, userId, method, path },
            { $set: update }
          ).exec();
        } catch (e) {
          // Avoid throwing inside finish
          // eslint-disable-next-line no-console
          console.error('Idempotency finalize error:', e.message);
        }
      });

      // Tag request for downstream handlers (optional)
      req.idempotency = { key, userId, method, path };

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  idempotency,
  IdempotencyKey,
};