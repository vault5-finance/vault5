const Category = require('../models/category');
const { logger } = require('../server');
const { body, validationResult } = require('express-validator');

// Validation rules
const categoryValidation = [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Category name is required and must be less than 50 characters'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('icon').optional().isLength({ max: 100 }).withMessage('Icon name must be less than 100 characters')
];

// Get all categories for a user
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user.id;

    // Get user categories
    const userCategories = await Category.findByUserId(userId, type);

    // If no user categories, get default categories
    if (userCategories.length === 0) {
      const defaultCategories = await Category.findDefaultCategories(type);
      return res.json({ categories: defaultCategories });
    }

    res.json({ categories: userCategories });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to retrieve categories' });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, color, icon } = req.body;
    const userId = req.user.id;

    // Check if category name already exists for this user and type
    const existingCategories = await Category.findByUserId(userId, type);
    const nameExists = existingCategories.some(cat =>
      cat.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      return res.status(400).json({ message: 'Category name already exists for this type' });
    }

    const categoryData = {
      userId,
      name: name.trim(),
      type,
      color: color || '#000000',
      icon: icon || 'default',
      isDefault: false
    };

    const category = await Category.create(categoryData);

    res.status(201).json(category);
  } catch (error) {
    logger.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, type, color, icon } = req.body;
    const userId = req.user.id;

    // Verify category ownership
    const category = await Category.findById(id);
    if (!category || (category.userId !== userId && category.userId !== 'system')) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Don't allow updating system categories
    if (category.userId === 'system') {
      return res.status(403).json({ message: 'Cannot modify system categories' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    const updatedCategory = await Category.updateById(id, updateData);

    res.json(updatedCategory);
  } catch (error) {
    logger.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify category ownership
    const category = await Category.findById(id);
    if (!category || (category.userId !== userId && category.userId !== 'system')) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Don't allow deleting system categories
    if (category.userId === 'system') {
      return res.status(403).json({ message: 'Cannot delete system categories' });
    }

    await Category.deleteById(id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Category.getCategoryStats(userId, start, end);

    res.json({
      stats,
      period: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    logger.error('Get category stats error:', error);
    res.status(500).json({ message: 'Failed to get category statistics' });
  }
};

// Get default categories
const getDefaultCategories = async (req, res) => {
  try {
    const { type } = req.query;

    const categories = await Category.findDefaultCategories(type);

    res.json({ categories });
  } catch (error) {
    logger.error('Get default categories error:', error);
    res.status(500).json({ message: 'Failed to retrieve default categories' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getDefaultCategories,
  categoryValidation
};