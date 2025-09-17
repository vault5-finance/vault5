const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMilestones,
  createMilestone,
  updateMilestoneProgress,
  getBadges,
  awardBadge,
  getFinancialScore,
  calculateFinancialScore
} = require('../controllers/gamificationController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Milestone routes
router.get('/milestones', getMilestones);
router.post('/milestones', createMilestone);
router.put('/milestones/:id/progress', updateMilestoneProgress);

// Badge routes
router.get('/badges', getBadges);
router.post('/badges', awardBadge);

// Financial score routes
router.get('/score', getFinancialScore);
router.post('/score/calculate', calculateFinancialScore);

module.exports = router;