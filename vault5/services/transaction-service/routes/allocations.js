const express = require('express');
const router = express.Router();
const {
  getAllocations,
  getTransactionAllocations,
  updateAllocationStatus,
  getAllocationSummary,
  triggerAllocation
} = require('../controllers/allocationsController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/allocations - Get all allocations for user
router.get('/', getAllocations);

// GET /api/allocations/summary - Get allocation summary
router.get('/summary', getAllocationSummary);

// GET /api/allocations/transaction/:transactionId - Get allocations for a transaction
router.get('/transaction/:transactionId', getTransactionAllocations);

// PUT /api/allocations/:id/status - Update allocation status
router.put('/:id/status', updateAllocationStatus);

// POST /api/allocations/trigger - Manually trigger allocation for a transaction
router.post('/trigger', triggerAllocation);

module.exports = router;