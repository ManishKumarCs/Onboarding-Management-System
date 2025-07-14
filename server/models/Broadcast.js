import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    readAt: Date,
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  broadcastType: {
    type: String,
    enum: ['announcement', 'urgent', 'general', 'policy'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  },
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
broadcastSchema.index({ sender: 1, createdAt: -1 });
broadcastSchema.index({ 'recipients.employee': 1, createdAt: -1 });
broadcastSchema.index({ broadcastType: 1, priority: 1 });

export default mongoose.model('Broadcast', broadcastSchema);