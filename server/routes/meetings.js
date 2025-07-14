import express from 'express';
import Joi from 'joi';
import Meeting from '../models/Meeting.js';
import Employee from '../models/Employee.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

const meetingSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  attendees: Joi.array().items(Joi.string()).min(1).required(),
  meetingDate: Joi.date().min('now').required(),
  duration: Joi.number().min(15).max(480).default(60),
  meetingType: Joi.string().valid('one-on-one', 'team', 'department', 'all-hands').default('one-on-one'),
  location: Joi.string().optional(),
  meetingLink: Joi.string().uri().allow('').optional(),
  agenda: Joi.array().items(Joi.object({
    item: Joi.string().required(),
    duration: Joi.number().min(5).max(120)
  })).optional()
});

// Get employee's meetings
router.get('/my-meetings', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { organizer: req.user._id },
        { 'attendees.employee': employee._id }
      ]
    };

    if (status) query.status = status;

    const meetings = await Meeting.find(query)
      .populate('organizer', 'email')
      .populate('attendees.employee', 'fullName email department')
      .sort({ meetingDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule meeting (admin only)
router.post('/schedule', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = meetingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, attendees, meetingDate, duration, meetingType, location, meetingLink, agenda } = req.body;

    // Verify all attendees exist
    const employees = await Employee.find({ _id: { $in: attendees } });
    if (employees.length !== attendees.length) {
      return res.status(400).json({ message: 'Some attendees not found' });
    }

    const meeting = new Meeting({
      title,
      description,
      organizer: req.user._id,
      attendees: attendees.map(employeeId => ({ employee: employeeId })),
      meetingDate,
      duration,
      meetingType,
      location,
      meetingLink,
      agenda
    });

    await meeting.save();

    // Create notifications for all attendees
    for (const employee of employees) {
      await createNotification({
        recipient: employee._id,
        title: 'New Meeting Scheduled',
        message: `You have been invited to "${title}" on ${new Date(meetingDate).toLocaleDateString()}`,
        type: 'meeting',
        priority: 'medium',
        actionUrl: '/meetings',
        relatedId: meeting._id,
        relatedModel: 'Meeting'
      });
    }

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'email')
      .populate('attendees.employee', 'fullName email department');

    res.status(201).json(populatedMeeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to meeting invitation
router.put('/:meetingId/respond', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid response status' });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const meeting = await Meeting.findOneAndUpdate(
      { 
        _id: req.params.meetingId,
        'attendees.employee': employee._id
      },
      {
        $set: {
          'attendees.$.status': status,
          'attendees.$.responseAt': new Date()
        }
      },
      { new: true }
    ).populate('organizer', 'email')
     .populate('attendees.employee', 'fullName email');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or you are not an attendee' });
    }

    // Notify organizer
    const organizerEmployee = await Employee.findOne({ userId: meeting.organizer._id });
    if (organizerEmployee) {
      await createNotification({
        recipient: organizerEmployee._id,
        title: 'Meeting Response',
        message: `${employee.fullName} has ${status} the meeting "${meeting.title}"`,
        type: 'meeting',
        priority: 'low',
        actionUrl: '/admin/meetings',
        relatedId: meeting._id,
        relatedModel: 'Meeting'
      });
    }

    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all meetings (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, meetingType, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (meetingType) query.meetingType = meetingType;

    const meetings = await Meeting.find(query)
      .populate('organizer', 'email')
      .populate('attendees.employee', 'fullName email department')
      .sort({ meetingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meeting status (admin only)
router.put('/:meetingId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const meeting = await Meeting.findByIdAndUpdate(
      req.params.meetingId,
      { status },
      { new: true }
    ).populate('organizer', 'email')
     .populate('attendees.employee', 'fullName email');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Notify all attendees about status change
    for (const attendee of meeting.attendees) {
      await createNotification({
        recipient: attendee.employee._id,
        title: 'Meeting Status Updated',
        message: `Meeting "${meeting.title}" status changed to ${status}`,
        type: 'meeting',
        priority: status === 'cancelled' ? 'high' : 'low',
        actionUrl: '/meetings',
        relatedId: meeting._id,
        relatedModel: 'Meeting'
      });
    }

    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;