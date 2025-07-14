import express from 'express';
import OnboardingStep from '../models/OnboardingStep.js';
import Employee from '../models/Employee.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/steps', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const steps = await OnboardingStep.find({ employeeId: employee._id })
      .sort({ orderIndex: 1 });

    res.json(steps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/steps/:stepId/complete', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const step = await OnboardingStep.findOneAndUpdate(
      { _id: req.params.stepId, employeeId: employee._id },
      { 
        completed: true,
        completedAt: new Date()
      },
      { new: true }
    );

    if (!step) {
      return res.status(404).json({ message: 'Onboarding step not found' });
    }

    // Check if all steps are completed
    const allSteps = await OnboardingStep.find({ employeeId: employee._id });
    const completedSteps = allSteps.filter(s => s.completed);
    
    if (completedSteps.length === allSteps.length) {
      await Employee.findByIdAndUpdate(employee._id, { 
        onboardingStatus: 'completed' 
      });
    } else {
      await Employee.findByIdAndUpdate(employee._id, { 
        onboardingStatus: 'in-progress' 
      });
    }

    res.json(step);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const steps = await OnboardingStep.find({ employeeId: employee._id });
    const completedSteps = steps.filter(s => s.completed);
    const progress = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

    res.json({
      status: employee.onboardingStatus,
      progress,
      totalSteps: steps.length,
      completedSteps: completedSteps.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
router.get('/employee/:employeeId/steps', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const steps = await OnboardingStep.find({ employeeId: req.params.employeeId })
      .sort({ orderIndex: 1 });

    res.json(steps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/employee/:employeeId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const steps = await OnboardingStep.find({ employeeId: req.params.employeeId });
    const completedSteps = steps.filter(s => s.completed);
    const progress = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

    res.json({
      status: employee.onboardingStatus,
      progress,
      totalSteps: steps.length,
      completedSteps: completedSteps.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/employee/:employeeId/steps/:stepId/complete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const step = await OnboardingStep.findOneAndUpdate(
      { _id: req.params.stepId, employeeId: req.params.employeeId },
      { 
        completed: true,
        completedAt: new Date()
      },
      { new: true }
    );

    if (!step) {
      return res.status(404).json({ message: 'Onboarding step not found' });
    }

    // Check if all steps are completed
    const allSteps = await OnboardingStep.find({ employeeId: req.params.employeeId });
    const completedSteps = allSteps.filter(s => s.completed);
    
    if (completedSteps.length === allSteps.length) {
      await Employee.findByIdAndUpdate(req.params.employeeId, { 
        onboardingStatus: 'completed' 
      });
    } else {
      await Employee.findByIdAndUpdate(req.params.employeeId, { 
        onboardingStatus: 'in-progress' 
      });
    }

    res.json(step);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;