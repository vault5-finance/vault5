const express = require('express');
const { protect } = require('../middleware/auth');
const { createGoal, getGoals, updateGoal, deleteGoal } = require('../controllers/goalsController');

const router = express.Router();

router.use(protect); // All routes protected

router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;