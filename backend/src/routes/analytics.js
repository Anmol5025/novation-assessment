const express = require('express');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const totalDocuments = await Document.countDocuments({
      organization: req.user.organization
    });

    const recentDocuments = await Document.countDocuments({
      organization: req.user.organization,
      createdAt: { $gte: startDate }
    });

    const documentsByType = await Document.aggregate([
      { $match: { organization: req.user.organization } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const documentsByStatus = await Document.aggregate([
      { $match: { organization: req.user.organization } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentActivity = await ActivityLog.find({
      userId: req.user._id,
      timestamp: { $gte: startDate }
    })
    .populate('documentId', 'title')
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();

    const upcomingDeadlines = await Document.aggregate([
      { $match: { organization: req.user.organization } },
      { $unwind: '$deadlines' },
      { $match: { 'deadlines.date': { $gte: new Date() } } },
      { $sort: { 'deadlines.date': 1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalDocuments,
      recentDocuments,
      documentsByType,
      documentsByStatus,
      recentActivity,
      upcomingDeadlines: upcomingDeadlines.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
