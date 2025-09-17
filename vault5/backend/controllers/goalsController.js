const { Goal, Account, User, Notification } = require('../models');
const { generateNotification } = require('./notificationsController');

// Create goal for an account
const createGoal = async (req, res) => {
  try {
    const { accountId, targetAmount, deadline } = req.body;

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const goal = new Goal({
      user: req.user._id,
      account: accountId,
      targetAmount,
      deadline
    });
    await goal.save();

    // Add to user goals ref
    const user = await User.findById(req.user._id);
    user.goals.push(goal._id);
    await user.save();

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's goals with progress
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).populate('account');
    const goalsWithProgress = goals.map(goal => {
      const progress = goal.account ? (goal.currentAmount / goal.targetAmount * 100) : 0;
      const status = goal.currentAmount >= goal.targetAmount ? 'achieved' : (new Date(goal.deadline) < new Date() ? 'missed' : 'active');
      goal.status = status;
      goal.progress = Math.min(progress, 100);
      return goal;
    });
    await Promise.all(goalsWithProgress.map(g => g.save())); // Update status if needed
    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findOne({ _id: id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const updates = req.body;
    Object.assign(goal, updates);
    await goal.save();

    const user = await User.findById(req.user._id);

    // Check for goal progress notification
    const progress = goal.currentAmount / goal.targetAmount * 100;
    if (progress >= user.preferences.notificationThresholds.goalProgress) {
      await generateNotification(req.user._id, 'goal_progress', 'Goal Progress Alert', `Your goal "${goal.name || 'Unnamed'}" has reached ${Math.round(progress)}% progress`, goal._id, 'medium');
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findOneAndDelete({ _id: id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Remove from user goals
    const user = await User.findById(req.user._id);
    user.goals = user.goals.filter(gId => gId.toString() !== id);
    await user.save();

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update goal progress when account balance changes (called from allocation)
const updateGoalProgress = async (accountId, newBalance) => {
  const goals = await Goal.find({ account: accountId });
  for (const goal of goals) {
    goal.currentAmount = newBalance; // Or calculate from transactions if needed
    await goal.save();
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  updateGoalProgress
};