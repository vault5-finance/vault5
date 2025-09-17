import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GamificationDashboard = () => {
  const [milestones, setMilestones] = useState([]);
  const [badges, setBadges] = useState([]);
  const [financialScore, setFinancialScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const [milestonesRes, badgesRes, scoreRes] = await Promise.all([
        api.get('/gamification/milestones'),
        api.get('/gamification/badges'),
        api.get('/gamification/score')
      ]);

      setMilestones(milestonesRes.data);
      setBadges(badgesRes.data);
      setFinancialScore(scoreRes.data);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialScore = async () => {
    try {
      const response = await api.post('/gamification/score/calculate');
      setFinancialScore(response.data);
    } catch (error) {
      console.error('Error calculating score:', error);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'common': 'border-gray-300 bg-gray-50',
      'rare': 'border-blue-300 bg-blue-50',
      'epic': 'border-purple-300 bg-purple-50',
      'legendary': 'border-yellow-300 bg-yellow-50'
    };
    return colors[rarity] || colors.common;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Financial Wellness Dashboard</h2>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        {['overview', 'milestones', 'badges', 'score'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Score Overview */}
          {financialScore && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Financial Health Score</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(financialScore.grade)}`}>
                  {financialScore.grade}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600">
                  {financialScore.overallScore}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${financialScore.overallScore / 10}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Out of 1000 points</p>
                </div>
              </div>
              <button
                onClick={calculateFinancialScore}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Recalculate Score
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {milestones.filter(m => m.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">Completed Milestones</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {badges.length}
              </div>
              <p className="text-sm text-gray-600">Badges Earned</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {milestones.filter(m => m.status === 'active').length}
              </div>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Milestones</h3>
          <div className="space-y-4">
            {milestones.map(milestone => (
              <div key={milestone._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                    milestone.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{milestone.current} / {milestone.target} {milestone.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((milestone.current / milestone.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {milestone.status === 'active' && (
                  <p className="text-xs text-gray-500">
                    {milestone.expiresAt ? `Expires: ${new Date(milestone.expiresAt).toLocaleDateString()}` : 'No expiration'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map(badge => (
              <div key={badge._id} className={`border-2 rounded-lg p-4 text-center ${getRarityColor(badge.rarity)}`}>
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-medium">{badge.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{badge.rarity}</span>
                  <span>{new Date(badge.earnedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          {badges.length === 0 && (
            <p className="text-center text-gray-500 py-8">No badges earned yet. Keep working on your financial goals!</p>
          )}
        </div>
      )}

      {/* Financial Score Tab */}
      {activeTab === 'score' && financialScore && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Detailed Financial Score</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Components */}
            <div>
              <h4 className="font-medium mb-3">Score Components</h4>
              <div className="space-y-3">
                {Object.entries(financialScore.components).map(([key, component]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${component.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{component.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div>
              <h4 className="font-medium mb-3">AI Insights</h4>
              <div className="space-y-3">
                {financialScore.insights.map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    insight.type === 'achievement' ? 'border-green-500 bg-green-50' :
                    insight.type === 'improvement' ? 'border-yellow-500 bg-yellow-50' :
                    insight.type === 'warning' ? 'border-red-500 bg-red-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <h5 className="font-medium text-sm">{insight.title}</h5>
                    <p className="text-xs text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={calculateFinancialScore}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Recalculate Financial Score
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;