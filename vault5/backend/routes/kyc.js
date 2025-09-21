const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getKycQueue,
  getKycDetails,
  approveKyc,
  rejectKyc,
  getKycStats,
  bulkApproveKyc
} = require('../controllers/kycController');

const router = express.Router();

// All KYC routes require authentication
router.use(protect);

// KYC management routes - only compliance admins and super admins
router.get('/queue', authorize('compliance_admin', 'super_admin'), getKycQueue);
router.get('/stats', authorize('compliance_admin', 'super_admin'), getKycStats);
router.get('/:userId', authorize('compliance_admin', 'super_admin'), getKycDetails);
router.post('/:userId/approve', authorize('compliance_admin', 'super_admin'), approveKyc);
router.post('/:userId/reject', authorize('compliance_admin', 'super_admin'), rejectKyc);
router.post('/bulk-approve', authorize('compliance_admin', 'super_admin'), bulkApproveKyc);

module.exports = router;