import express from 'express';
import Joi from 'joi';
import WelcomeVideo from '../models/WelcomeVideo.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

const videoSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(500).optional(),
  youtubeUrl: Joi.string().uri().required(),
  isActive: Joi.boolean().default(true)
});

// Get active welcome video
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const video = await WelcomeVideo.findOne({ isActive: true })
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json(video);
  } catch (error) {
    console.error('Error fetching active video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all welcome videos (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const videos = await WelcomeVideo.find()
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create welcome video (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = videoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, youtubeUrl, isActive } = req.body;

    // If setting this video as active, deactivate others
    if (isActive) {
      await WelcomeVideo.updateMany({}, { isActive: false });
    }

    const video = new WelcomeVideo({
      title,
      description,
      youtubeUrl,
      isActive,
      createdBy: req.user._id
    });

    await video.save();

    const populatedVideo = await WelcomeVideo.findById(video._id)
      .populate('createdBy', 'email');

    res.status(201).json(populatedVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update welcome video (Admin only)
router.put('/:videoId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = videoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { isActive } = req.body;

    // If setting this video as active, deactivate others
    if (isActive) {
      await WelcomeVideo.updateMany({}, { isActive: false });
    }

    const video = await WelcomeVideo.findByIdAndUpdate(
      req.params.videoId,
      req.body,
      { new: true }
    ).populate('createdBy', 'email');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete welcome video (Admin only)
router.delete('/:videoId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const video = await WelcomeVideo.findByIdAndDelete(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;