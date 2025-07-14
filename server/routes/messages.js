import express from 'express';
import Joi from 'joi';
import Message from '../models/Message.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

const messageSchema = Joi.object({
  toUserId: Joi.string().required(),
  subject: Joi.string().min(1).required(),
  message: Joi.string().min(1).required(),
  parentMessageId: Joi.string().optional()
});

// Get messages for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const messages = await Message.find({
      $or: [
        { fromUserId: req.user._id },
        { toUserId: req.user._id }
      ]
    })
    .populate('fromUserId', 'email role')
    .populate('toUserId', 'email role')
    .populate('employeeId', 'fullName email')
    .populate('parentMessageId')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message (admin to employee or employee reply)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { error } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { toUserId, subject, message, parentMessageId } = req.body;

    // Find recipient user and employee
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    let employeeId;
    if (req.user.role === 'admin') {
      // Admin sending to employee
      const employee = await Employee.findOne({ userId: toUserId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      employeeId = employee._id;
    } else {
      // Employee replying
      const employee = await Employee.findOne({ userId: req.user._id });
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      employeeId = employee._id;
    }

    const newMessage = new Message({
      fromUserId: req.user._id,
      toUserId,
      employeeId,
      subject,
      message,
      parentMessageId
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('fromUserId', 'email role')
      .populate('toUserId', 'email role')
      .populate('employeeId', 'fullName email')
      .populate('parentMessageId');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/:messageId/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { 
        _id: req.params.messageId,
        toUserId: req.user._id,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    ).populate('fromUserId', 'email role')
     .populate('toUserId', 'email role')
     .populate('employeeId', 'fullName email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for specific employee (admin only)
router.get('/employee/:employeeId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const messages = await Message.find({ employeeId: req.params.employeeId })
      .populate('fromUserId', 'email role')
      .populate('toUserId', 'email role')
      .populate('employeeId', 'fullName email')
      .populate('parentMessageId')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      toUserId: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;