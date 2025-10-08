/**
 * Accounts Configuration
 * Centralized configuration for account themes, rules, and UI constants
 */

// Enhanced account configurations with visual themes
export const ACCOUNT_THEMES = {
  Daily: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    glow: 'shadow-emerald-500/25',
    icon: '💰',
    emoji: '💰',
    description: 'Smart spending with alerts'
  },
  Fun: {
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/25',
    icon: '🎉',
    emoji: '🎉',
    description: 'Entertainment & lifestyle'
  },
  Emergency: {
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    glow: 'shadow-rose-500/25',
    icon: '🚨',
    emoji: '🚨',
    description: 'Safety net protection'
  },
  LongTerm: {
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    glow: 'shadow-indigo-500/25',
    icon: '🏦',
    emoji: '🏦',
    description: 'Future security & growth'
  },
  Investment: {
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/25',
    icon: '📈',
    emoji: '📈',
    description: 'Wealth building & returns'
  }
};

// Rule badges for account features
export const RULE_BADGES = {
  Daily: [
    { text: 'Unrestricted spend', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    { text: 'AI alert if >20%/day', color: 'bg-blue-100 text-blue-800', icon: '🤖' },
  ],
  Fun: [
    { text: 'Unlimited spend', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    { text: 'No internal transfers out', color: 'bg-amber-100 text-amber-800', icon: '🚫' },
    { text: 'Month-end sweep to Long-Term', color: 'bg-indigo-100 text-indigo-800', icon: '🔄' },
  ],
  Emergency: [
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800', icon: '🏦' },
    { text: '24h payout hold', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
    { text: 'Max 2 withdrawals/month', color: 'bg-red-100 text-red-800', icon: '📊' },
    { text: 'AI confirm required', color: 'bg-blue-100 text-blue-800', icon: '🤖' },
  ],
  LongTerm: [
    { text: 'Optional lock 3/6/12 mo.', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    { text: '3% early withdrawal penalty', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    { text: 'Reward at full term', color: 'bg-emerald-100 text-emerald-800', icon: '🎁' },
  ],
  Investment: [
    { text: '90-day lock', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    { text: 'Min withdrawal KES 50', color: 'bg-cyan-100 text-cyan-800', icon: '💰' },
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800', icon: '🏦' },
  ],
};

// Account-specific rules for actions
export const ACCOUNT_RULES = {
  Daily: {
    canSendInternal: true,
    canSendP2P: true,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
  },
  Fun: {
    canSendInternal: false, // No internal transfers out
    canSendP2P: true,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
  },
  Emergency: {
    canSendInternal: false, // External only
    canSendP2P: false, // External only
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
  },
  LongTerm: {
    canSendInternal: true,
    canSendP2P: true,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
  },
  Investment: {
    canSendInternal: false, // External only
    canSendP2P: false, // External only
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
  },
};

// Account ordering for consistent display
export const ACCOUNT_ORDER = ['Daily', 'Fun', 'Emergency', 'LongTerm', 'Investment'];

// Default account creation settings
export const DEFAULT_ACCOUNT_SETTINGS = {
  Daily: { initialBalance: 0, targetPercentage: 50 },
  Fun: { initialBalance: 0, targetPercentage: 20 },
  Emergency: { initialBalance: 0, targetPercentage: 20 },
  LongTerm: { initialBalance: 0, targetPercentage: 10 },
  Investment: { initialBalance: 0, targetPercentage: 0 },
};