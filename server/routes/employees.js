import express from 'express';
import Joi from 'joi';
import Employee from '../models/Employee.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload, cloudinary } from '../config/cloudinary.js';

const router = express.Router();

const updateEmployeeSchema = Joi.object({
  fullName: Joi.string().min(2).optional(),
  department: Joi.string().optional(),
  position: Joi.string().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  emergencyContact: Joi.object({
  name: Joi.string().allow('').optional(),
  phone: Joi.string().allow('').optional()
}).optional()
});

// Get employee profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { error } = updateEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    console.log(req.body)
    // Remove startDate from update data to prevent modification
    const updateData = { ...req.body };
    delete updateData.startDate;

    const employee = await Employee.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture
router.post('/profile/picture', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log("REQ FILE:", req.file);

    if (!req.file || !req.file.path) {
      console.log("❌ No file received");
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const employee = await Employee.findOneAndUpdate(
      { userId: req.user._id },
      { 
        profilePicture: {
          url: req.file.path,
          publicId: req.file.filename // ✅ Add publicId for deletion
        }
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
});


// Delete profile picture
router.delete('/profile/picture', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Delete from Cloudinary if exists
    if (employee.profilePicture?.publicId) {
      try {
        await cloudinary.uploader.destroy(employee.profilePicture.publicId);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    // Remove profile picture from employee
    employee.profilePicture = { url: null, publicId: null };
    await employee.save();

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'email role isActive')
      .sort({ createdAt: -1 });
    
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:employeeId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId)
      .populate('userId', 'email role isActive');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:employeeId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = updateEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Remove startDate from update data to prevent modification
    const updateData = { ...req.body };
    delete updateData.startDate;

    const employee = await Employee.findByIdAndUpdate(
      req.params.employeeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'email role isActive');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:employeeId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { onboardingStatus } = req.body;
    
    if (!['pending', 'in-progress', 'completed', 'rejected'].includes(onboardingStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.employeeId,
      { onboardingStatus },
      { new: true }
    ).populate('userId', 'email role isActive');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;