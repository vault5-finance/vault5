const express = require('express');
const { protect } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;