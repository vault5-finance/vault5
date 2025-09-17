const mongoose = require('mongoose');

const financialScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 1000,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    required: true
  },
  components: {
    savingsRate: {
      score: { type: Number, min: 0, max: 100 },
      value: Number,
      weight: { type: Number, default: 0.25 }
    },
    debtToIncomeRatio: {
      score: { type: Number, min: 0, max: 100 },
      value: Number,
      weight: { type: Number, default: 0.25 }
    },
    emergencyFund: {
      score: { type: Number, min: 0, max: 100 },
      value: Number,
      weight: { type: Number, default: 0.20 }
    },
    budgetAdherence: {
      score: { type: Number, min: 0, max: 100 },
      value: Number,
      weight: { type: Number, default: 0.15 }
    },
    investmentDiversity: {
      score: { type: Number, min: 0, max: 100 },
      value: Number,
      weight: { type: Number, default: 0.15 }
    }
  },
  trends: {
    previousScore: Number,
    change: Number, // positive or negative change
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    }
  },
  insights: [{
    type: {
      type: String,
      enum: ['strength', 'improvement', 'warning', 'achievement']
    },
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  nextCalculation: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true
});

// Index for efficient queries
financialScoreSchema.index({ user: 1, calculatedAt: -1 });
financialScoreSchema.index({ user: 1, grade: 1 });

// Calculate overall score before saving
financialScoreSchema.pre('save', function(next) {
  if (this.isModified('components')) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.values(this.components).forEach(component => {
      if (component.score !== undefined && component.weight) {
        totalScore += component.score * component.weight;
        totalWeight += component.weight;
      }
    });

    this.overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    // Determine grade based on score
    if (this.overallScore >= 900) this.grade = 'A+';
    else if (this.overallScore >= 800) this.grade = 'A';
    else if (this.overallScore >= 700) this.grade = 'B+';
    else if (this.overallScore >= 600) this.grade = 'B';
    else if (this.overallScore >= 500) this.grade = 'C+';
    else if (this.overallScore >= 400) this.grade = 'C';
    else if (this.overallScore >= 300) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model('FinancialScore', financialScoreSchema);