const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getDefaultCategories,
  categoryValidation
} = require('../controllers/categoriesController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/categories - Get all categories for user
router.get('/', getCategories);

// GET /api/categories/default - Get default categories
router.get('/default', getDefaultCategories);

// GET /api/categories/stats - Get category statistics
router.get('/stats', getCategoryStats);

// POST /api/categories - Create new category
router.post('/', categoryValidation, createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryValidation, updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', deleteCategory);

module.exports = router;