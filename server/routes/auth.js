import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import OnboardingStep from '../models/OnboardingStep.js';
import Invitation from '../models/Invitation.js';
import { sendRegistrationConfirmation } from '../config/email.js';

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  department: Joi.string().optional(),
  position: Joi.string().optional(),
  token: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createDefaultOnboardingSteps = async (employeeId) => {
  const defaultSteps = [
    { stepName: 'Complete Profile', stepDescription: 'Fill out your personal information and contact details', orderIndex: 1 },
    { stepName: 'Upload Documents', stepDescription: 'Upload required documents (ID, contracts, etc.)', orderIndex: 2 },
    { stepName: 'Company Policies', stepDescription: 'Review and acknowledge company policies', orderIndex: 3 },
    { stepName: 'IT Setup', stepDescription: 'Set up your work email and access to company systems', orderIndex: 4 },
    { stepName: 'Team Introduction', stepDescription: 'Meet your team members and direct supervisor', orderIndex: 5 }
  ];

  const steps = defaultSteps.map(step => ({
    ...step,
    employeeId
  }));

  await OnboardingStep.insertMany(steps);
};

router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, fullName, department, position, token } = req.body;

    // If token is provided, validate invitation
    let invitationRole = 'employee';
    if (token) {
      const invitation = await Invitation.findOne({
        token,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!invitation) {
        return res.status(400).json({ message: 'Invalid or expired invitation token' });
      }

      if (invitation.email !== email) {
        return res.status(400).json({ message: 'Email does not match invitation' });
      }

      invitationRole = invitation.role;

      // Mark invitation as used
      invitation.isUsed = true;
      await invitation.save();
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ 
      email, 
      password, 
      role: invitationRole 
    });
    await user.save();

    const employee = new Employee({
      userId: user._id,
      fullName,
      email,
      department,
      position,
      startDate: new Date() // Set start date only during registration
    });
    await employee.save();

    await createDefaultOnboardingSteps(employee._id);

    // Send confirmation email to admin if this was an invited registration
    if (token) {
      try {
        const adminUsers = await User.find({ role: 'admin' });
        for (const admin of adminUsers) {
          await sendRegistrationConfirmation(email, fullName, admin.email);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail registration if email fails
      }
    }
    const token_user = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token_user,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;