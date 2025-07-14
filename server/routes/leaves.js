import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Joi from 'joi';
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

// Create uploads directory for leave attachments
const uploadDir = path.join(process.cwd(), 'server', 'uploads', 'leaves');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'leave-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

const leaveSchema = Joi.object({
  leaveType: Joi.string().valid('sick', 'vacation', 'personal', 'emergency', 'maternity', 'paternity').required(),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  reason: Joi.string().min(10).max(500).required()
});

// Get employee's leaves
router.get('/my-leaves', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { employeeId: employee._id };

    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(query);

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit leave request
router.post('/request', authMiddleware, upload.array('attachments', 3), async (req, res) => {
  try {
    const { error } = leaveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason
    });

    // Add attachments if any
    if (req.files && req.files.length > 0) {
      leave.attachments = req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path
      }));
    }

    await leave.save();

    // Create notification for admins
    const admins = await Employee.find().populate('userId', 'role').then(employees => 
      employees.filter(emp => emp.userId.role === 'admin')
    );

    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        title: 'New Leave Request',
        message: `${employee.fullName} has submitted a ${leaveType} leave request for ${totalDays} days`,
        type: 'leave',
        priority: 'medium',
        actionUrl: '/admin/leaves',
        relatedId: leave._id,
        relatedModel: 'Leave'
      });
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'fullName email department');

    res.status(201).json(populatedLeave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
// Get all leave requests (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, employeeId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (employeeId) query.employeeId = employeeId;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'fullName email department position')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(query);

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Review leave request (admin only)
router.put('/:leaveId/review', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, reviewComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.leaveId,
      {
        status,
        reviewComments,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('employeeId', 'fullName email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Create notification for employee
    await createNotification({
      recipient: leave.employeeId._id,
      title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leave.leaveType} leave request has been ${status}${reviewComments ? ': ' + reviewComments : ''}`,
      type: 'leave',
      priority: status === 'approved' ? 'medium' : 'high',
      actionUrl: '/leaves',
      relatedId: leave._id,
      relatedModel: 'Leave'
    });

    res.json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leave statistics (admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    const typeStats = await Leave.aggregate([
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      typeStats,
      totalRequests: await Leave.countDocuments()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;