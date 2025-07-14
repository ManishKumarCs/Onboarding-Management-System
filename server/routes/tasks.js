import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Joi from 'joi';
import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create uploads directory for task attachments
const uploadDir = path.join(process.cwd(), 'server', 'uploads', 'tasks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
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

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  assignedTo: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().min('now').required(),
  notes: Joi.string().optional()
});

const updateTaskSchema = Joi.object({
  progress: Joi.number().min(0).max(100).optional(),
  status: Joi.string().valid('assigned', 'in-progress', 'review', 'completed').optional(),
  notes: Joi.string().optional(),
  message: Joi.string().optional()
});

// Get tasks for current user (employee)
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = { assignedTo: employee._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assignedBy', 'email role')
      .populate('assignedTo', 'fullName email department position')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single task details
router.get('/:taskId', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    const query = { _id: req.params.taskId };

    // If not admin, only show tasks assigned to this employee
    if (req.user.role !== 'admin') {
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      query.assignedTo = employee._id;
    }

    const task = await Task.findOne(query)
      .populate('assignedBy', 'email role')
      .populate('assignedTo', 'fullName email department position')
      .populate('reviews.reviewedBy', 'email role')
      .populate('updates.updatedBy', 'email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task progress (employee)
router.put('/:taskId/progress', authMiddleware, async (req, res) => {
  try {
    const { error } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { progress, status, notes, message } = req.body;

    const task = await Task.findOne({
      _id: req.params.taskId,
      assignedTo: employee._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    if (progress !== undefined) task.progress = progress;
    if (status) task.status = status;
    if (notes) task.notes = notes;

    // Add update entry
    if (message) {
      task.updates.push({
        updatedBy: req.user._id,
        message,
        progress: progress || task.progress
      });
    }

    // Auto-update status based on progress
    if (progress === 100 && task.status !== 'completed') {
      task.status = 'review';
    } else if (progress > 0 && task.status === 'assigned') {
      task.status = 'in-progress';
    }

    // Check if overdue
    if (new Date() > task.dueDate && task.status !== 'completed') {
      task.status = 'overdue';
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedBy', 'email role')
      .populate('assignedTo', 'fullName email department position');

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload task attachment (employee)
router.post('/:taskId/attachments', authMiddleware, upload.single('attachment'), async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const task = await Task.findOne({
      _id: req.params.taskId,
      assignedTo: employee._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    task.attachments.push({
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    await task.save();

    res.json({ message: 'Attachment uploaded successfully', attachment: task.attachments[task.attachments.length - 1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
// Get all tasks (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('assignedBy', 'email role')
      .populate('assignedTo', 'fullName email department position')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log(req.body)
    const { error } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, assignedTo, priority, dueDate, notes } = req.body;

    // Verify employee exists
    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      dueDate,
      notes
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedBy', 'email role')
      .populate('assignedTo', 'fullName email department position');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task (admin only)
router.put('/:taskId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      updates,
      { new: true }
    )
      .populate('assignedBy', 'email role')
      .populate('assignedTo', 'fullName email department position');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review to task (admin only)
router.post('/:taskId/review', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { feedback, rating } = req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.reviews.push({
      reviewedBy: req.user._id,
      feedback,
      rating
    });

    // If reviewed, mark as completed
    if (task.status === 'review') {
      task.status = 'completed';
      task.completedDate = new Date();
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedBy', 'email role')
      .populate('assignedTo', 'fullName email department position')
      .populate('reviews.reviewedBy', 'email role');

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task (admin only)
router.delete('/:taskId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete associated files
    task.attachments.forEach(attachment => {
      if (fs.existsSync(attachment.filePath)) {
        fs.unlinkSync(attachment.filePath);
      }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download task attachment
router.get('/:taskId/attachments/:attachmentId', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    const query = { _id: req.params.taskId };

    // If not admin, only show tasks assigned to this employee
    if (req.user.role !== 'admin') {
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      query.assignedTo = employee._id;
    }

    const task = await Task.findOne(query);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
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

// Get task statistics (admin only)
router.get('/stats/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed'] }
    });

    res.json({
      statusStats: stats,
      priorityStats,
      overdueTasks,
      totalTasks: await Task.countDocuments()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;