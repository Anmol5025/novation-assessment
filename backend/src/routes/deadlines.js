const express = require('express');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { upcoming = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(upcoming));

    const documents = await Document.find({
      organization: req.user.organization,
      'deadlines.date': {
        $gte: new Date(),
        $lte: futureDate
      }
    })
    .populate('uploadedBy', 'name email')
    .sort({ 'deadlines.date': 1 })
    .lean();

    const deadlines = [];
    documents.forEach(doc => {
      doc.deadlines.forEach(deadline => {
        if (deadline.date >= new Date() && deadline.date <= futureDate) {
          deadlines.push({
            ...deadline,
            documentId: doc._id,
            documentTitle: doc.title,
            documentType: doc.type
          });
        }
      });
    });

    deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ deadlines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
