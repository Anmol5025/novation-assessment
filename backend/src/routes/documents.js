const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, deleteFile } = require('../services/storageService');
const { analyzeDocument } = require('../services/aiService');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const query = { organization: req.user.organization };

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const { title, description, type, tags } = req.body;

    const uploadResult = await uploadFile(req.file.buffer, req.file.originalname);

    const document = new Document({
      title: title || req.file.originalname,
      description,
      type: type || 'other',
      fileUrl: uploadResult.url,
      fileSize: uploadResult.size,
      uploadedBy: req.userId,
      organization: req.user.organization,
      tags: tags ? JSON.parse(tags) : []
    });

    await document.save();

    await ActivityLog.create({
      userId: req.userId,
      documentId: document._id,
      action: 'upload',
      details: { title: document.title }
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await ActivityLog.create({
      userId: req.userId,
      documentId: document._id,
      action: 'view',
      details: { title: document.title }
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('type').optional().isIn(['contract', 'nda', 'agreement', 'other']),
  body('status').optional().isIn(['active', 'expired', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const allowedUpdates = ['title', 'description', 'type', 'status', 'tags'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));

    updates.forEach(update => {
      document[update] = req.body[update];
    });

    await document.save();

    await ActivityLog.create({
      userId: req.userId,
      documentId: document._id,
      action: 'edit',
      details: { updates }
    });

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, checkRole('admin', 'lawyer'), async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await ActivityLog.create({
      userId: req.userId,
      documentId: document._id,
      action: 'delete',
      details: { title: document.title }
    });

    await document.deleteOne();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const documentText = `${document.title}\n${document.description || ''}`;
    const analysis = await analyzeDocument(documentText, document.title);

    document.aiInsights = {
      ...analysis,
      analyzedAt: new Date()
    };

    if (analysis.deadlines && analysis.deadlines.length > 0) {
      document.deadlines = analysis.deadlines.map(d => ({
        title: d.title,
        date: new Date(d.date),
        notified: false
      }));
    }

    await document.save();

    await ActivityLog.create({
      userId: req.userId,
      documentId: document._id,
      action: 'analyze',
      details: { analyzed: true }
    });

    res.json({
      message: 'Document analyzed successfully',
      insights: document.aiInsights
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/versions', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).populate('versionHistory.updatedBy', 'name email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      currentVersion: document.version,
      history: document.versionHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/share', auth, [
  body('userId').notEmpty(),
  body('permission').isIn(['view', 'edit', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { userId, permission } = req.body;

    const existingAccess = document.accessControl.find(
      ac => ac.userId.toString() === userId
    );

    if (existingAccess) {
      existingAccess.permission = permission;
    } else {
      document.accessControl.push({ userId, permission });
    }

    await document.save();

    await ActivityLog.create({
      userId: req.userId,
      documentId: document._id,
      action: 'share',
      details: { sharedWith: userId, permission }
    });

    res.json({
      message: 'Document shared successfully',
      accessControl: document.accessControl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
