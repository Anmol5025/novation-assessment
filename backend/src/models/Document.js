const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['contract', 'nda', 'agreement', 'other'],
    default: 'other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  organization: {
    type: String,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'expired', 'archived'],
    default: 'active'
  },
  aiInsights: {
    summary: String,
    keyTerms: [String],
    parties: [String],
    obligations: [String],
    risks: [String],
    analyzedAt: Date
  },
  deadlines: [{
    title: String,
    date: Date,
    notified: {
      type: Boolean,
      default: false
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  versionHistory: [{
    version: Number,
    fileUrl: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: Date,
    changes: String
  }],
  accessControl: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    }
  }]
}, {
  timestamps: true
});

documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ organization: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
