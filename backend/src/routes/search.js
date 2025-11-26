const express = require('express');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { q, type, status, dateFrom, dateTo } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const query = {
      organization: req.user.organization,
      $text: { $search: q }
    };

    if (type) query.type = type;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const documents = await Document.find(query, {
      score: { $meta: 'textScore' }
    })
    .populate('uploadedBy', 'name email')
    .sort({ score: { $meta: 'textScore' } })
    .limit(50)
    .lean();

    res.json({
      query: q,
      results: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
