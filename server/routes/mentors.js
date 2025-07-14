import express from 'express';
import Joi from 'joi';
import Mentor from '../models/Mentor.js';
import Employee from '../models/Employee.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

const mentorSchema = Joi.object({
  mentor: Joi.string().required(),
  mentee: Joi.string().required(),
  endDate: Joi.date().optional(),
  goals: Joi.array().items(Joi.object({
    goal: Joi.string().required(),
    targetDate: Joi.date().optional()
  })).optional()
});

// Get employee's mentor/mentee relationships
router.get('/my-relationships', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const [asMentor, asMentee] = await Promise.all([
      Mentor.find({ mentor: employee._id, status: 'active' })
        .populate('mentee', 'fullName email department position')
        .populate('assignedBy', 'email'),
      Mentor.findOne({ mentee: employee._id, status: 'active' })
        .populate('mentor', 'fullName email department position')
        .populate('assignedBy', 'email')
    ]);

    res.json({
      asMentor,
      asMentee
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign mentor (admin only)
router.post('/assign', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = mentorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { mentor: mentorId, mentee: menteeId, endDate, goals } = req.body;

    // Verify mentor and mentee exist and are different
    if (mentorId === menteeId) {
      return res.status(400).json({ message: 'Mentor and mentee cannot be the same person' });
    }

    const [mentor, mentee] = await Promise.all([
      Employee.findById(mentorId),
      Employee.findById(menteeId)
    ]);

    if (!mentor || !mentee) {
      return res.status(404).json({ message: 'Mentor or mentee not found' });
    }

    // Check if mentee already has an active mentor
    const existingMentor = await Mentor.findOne({ mentee: menteeId, status: 'active' });
    if (existingMentor) {
      return res.status(400).json({ message: 'Mentee already has an active mentor' });
    }

    const mentorship = new Mentor({
      mentor: mentorId,
      mentee: menteeId,
      assignedBy: req.user._id,
      endDate,
      goals: goals || []
    });

    await mentorship.save();

    // Create notifications
    await Promise.all([
      createNotification({
        recipient: mentorId,
        title: 'New Mentee Assigned',
        message: `You have been assigned as a mentor to ${mentee.fullName}`,
        type: 'mentor',
        priority: 'medium',
        actionUrl: '/mentors',
        relatedId: mentorship._id,
        relatedModel: 'Mentor'
      }),
      createNotification({
        recipient: menteeId,
        title: 'Mentor Assigned',
        message: `${mentor.fullName} has been assigned as your mentor`,
        type: 'mentor',
        priority: 'medium',
        actionUrl: '/mentors',
        relatedId: mentorship._id,
        relatedModel: 'Mentor'
      })
    ]);

    const populatedMentorship = await Mentor.findById(mentorship._id)
      .populate('mentor', 'fullName email department position')
      .populate('mentee', 'fullName email department position')
      .populate('assignedBy', 'email');

    res.status(201).json(populatedMentorship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note to mentorship
router.post('/:mentorshipId/notes', authMiddleware, async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const mentorship = await Mentor.findOne({
      _id: req.params.mentorshipId,
      $or: [
        { mentor: employee._id },
        { mentee: employee._id }
      ],
      status: 'active'
    });

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found or you are not part of this relationship' });
    }

    mentorship.notes.push({
      note: note.trim(),
      addedBy: req.user._id
    });

    await mentorship.save();

    const populatedMentorship = await Mentor.findById(mentorship._id)
      .populate('mentor', 'fullName email')
      .populate('mentee', 'fullName email')
      .populate('notes.addedBy', 'email');

    res.json(populatedMentorship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goal status
router.put('/:mentorshipId/goals/:goalId', authMiddleware, async (req, res) => {
  try {
    const { completed } = req.body;

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const mentorship = await Mentor.findOne({
      _id: req.params.mentorshipId,
      $or: [
        { mentor: employee._id },
        { mentee: employee._id }
      ],
      status: 'active'
    });

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    const goal = mentorship.goals.id(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.completed = completed;
    if (completed) {
      goal.completedAt = new Date();
    } else {
      goal.completedAt = undefined;
    }

    await mentorship.save();

    res.json(mentorship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all mentorships (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;

    const mentorships = await Mentor.find(query)
      .populate('mentor', 'fullName email department position')
      .populate('mentee', 'fullName email department position')
      .populate('assignedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Mentor.countDocuments(query);

    res.json({
      mentorships,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mentorship status (admin only)
router.put('/:mentorshipId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'completed', 'paused'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const mentorship = await Mentor.findByIdAndUpdate(
      req.params.mentorshipId,
      { status },
      { new: true }
    ).populate('mentor', 'fullName email')
     .populate('mentee', 'fullName email');

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    // Notify both mentor and mentee
    await Promise.all([
      createNotification({
        recipient: mentorship.mentor._id,
        title: 'Mentorship Status Updated',
        message: `Your mentorship with ${mentorship.mentee.fullName} is now ${status}`,
        type: 'mentor',
        priority: 'low',
        actionUrl: '/mentors'
      }),
      createNotification({
        recipient: mentorship.mentee._id,
        title: 'Mentorship Status Updated',
        message: `Your mentorship with ${mentorship.mentor.fullName} is now ${status}`,
        type: 'mentor',
        priority: 'low',
        actionUrl: '/mentors'
      })
    ]);

    res.json(mentorship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;