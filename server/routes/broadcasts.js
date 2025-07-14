import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Joi from 'joi';
import Broadcast from '../models/Broadcast.js';
import Employee from '../models/Employee.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

// Create uploads directory for broadcast attachments
const uploadDir = path.join(process.cwd(), 'server', 'uploads', 'broadcasts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'broadcast-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, documents, and archives are allowed'));
    }
  }
});

const broadcastSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  message: Joi.string().min(10).required(),
  recipients: Joi.array().items(Joi.string()).min(1).required(),
  broadcastType: Joi.string().valid('announcement', 'urgent', 'general', 'policy').default('general'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  expiresAt: Joi.date().optional()
});

// Get employee's broadcasts
router.get('/my-broadcasts', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const query = { 'recipients.employee': employee._id };

    if (unreadOnly === 'true') {
      query['recipients.isRead'] = false;
    }

    const broadcasts = await Broadcast.find(query)
      .populate('sender', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark broadcasts as read when fetched
    if (unreadOnly !== 'true') {
      await Broadcast.updateMany(
        { 
          'recipients.employee': employee._id,
          'recipients.isRead': false
        },
        {
          $set: {
            'recipients.$.isRead': true,
            'recipients.$.readAt': new Date()
          }
        }
      );
    }

    const total = await Broadcast.countDocuments(query);

    res.json({
      broadcasts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send broadcast message (admin only)
router.post('/send', authMiddleware, adminMiddleware, upload.array('attachments', 5), async (req, res) => {
  try {
    const { error } = broadcastSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, message, recipients, broadcastType, priority, expiresAt } = req.body;

    // Verify all recipients exist
    const employees = await Employee.find({ _id: { $in: recipients } });
    if (employees.length !== recipients.length) {
      return res.status(400).json({ message: 'Some recipients not found' });
    }

    const broadcast = new Broadcast({
      title,
      message,
      sender: req.user._id,
      recipients: recipients.map(employeeId => ({ employee: employeeId })),
      broadcastType,
      priority,
      expiresAt
    });

    // Add attachments if any
    if (req.files && req.files.length > 0) {
      broadcast.attachments = req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path
      }));
    }

    await broadcast.save();

    // Create notifications for all recipients
    for (const employee of employees) {
      await createNotification({
        recipient: employee._id,
        title: `New ${broadcastType}: ${title}`,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        type: 'broadcast',
        priority,
        actionUrl: '/broadcasts',
        relatedId: broadcast._id,
        relatedModel: 'Broadcast'
      });
    }

    const populatedBroadcast = await Broadcast.findById(broadcast._id)
      .populate('sender', 'email')
      .populate('recipients.employee', 'fullName email department');

    res.status(201).json(populatedBroadcast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all broadcasts (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { broadcastType, priority, page = 1, limit = 10 } = req.query;
    const query = {};

    if (broadcastType) query.broadcastType = broadcastType;
    if (priority) query.priority = priority;

    const broadcasts = await Broadcast.find(query)
      .populate('sender', 'email')
      .populate('recipients.employee', 'fullName email department')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Broadcast.countDocuments(query);

    res.json({
      broadcasts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get broadcast statistics (admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Broadcast.aggregate([
      {
        $group: {
          _id: '$broadcastType',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Broadcast.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate read rates
    const readStats = await Broadcast.aggregate([
      { $unwind: '$recipients' },
      {
        $group: {
          _id: '$recipients.isRead',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      typeStats: stats,
      priorityStats,
      readStats,
      totalBroadcasts: await Broadcast.countDocuments()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download broadcast attachment
router.get('/:broadcastId/attachments/:attachmentId', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    const query = { _id: req.params.broadcastId };

    // If not admin, only show broadcasts sent to this employee
    if (req.user.role !== 'admin') {
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      query['recipients.employee'] = employee._id;
    }

    const broadcast = await Broadcast.findOne(query);
    if (!broadcast) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }

    const attachment = broadcast.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.setHeader('Content-Disposition', `inline; filename="${attachment.fileName}"`);
    res.sendFile(path.resolve(attachment.filePath));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;