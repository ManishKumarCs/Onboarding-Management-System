import express from 'express';
import crypto from 'crypto';
import Joi from 'joi';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { sendInvitationEmail } from '../config/email.js';

const router = express.Router();

const invitationSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('employee', 'admin').default('employee')
});

// Send invitation (Admin only)
router.post('/send', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = invitationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if invitation already exists and is not expired
    const existingInvitation = await Invitation.findOne({ 
      email, 
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'An active invitation already exists for this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new Invitation({
      email,
      role,
      token,
      invitedBy: req.user._id
    });

    await invitation.save();

    // Get inviter name for email
    const inviter = await User.findById(req.user._id);
    const inviterName = inviter.email;

    // Send invitation email
    await sendInvitationEmail(email, token, inviterName);

    res.status(201).json({ 
      message: 'Invitation sent successfully',
      invitation: {
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Failed to send invitation' });
  }
});

// Get all invitations (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const invitations = await Invitation.find()
      .populate('invitedBy', 'email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate invitation token
router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    res.json({
      valid: true,
      email: invitation.email,
      role: invitation.role
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete invitation (Admin only)
router.delete('/:invitationId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const invitation = await Invitation.findByIdAndDelete(req.params.invitationId);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    res.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;