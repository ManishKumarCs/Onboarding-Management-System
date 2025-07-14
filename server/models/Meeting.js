import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    responseAt: Date
  }],
  meetingDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  meetingType: {
    type: String,
    enum: ['one-on-one', 'team', 'department', 'all-hands'],
    default: 'one-on-one'
  },
  location: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  agenda: [{
    item: String,
    duration: Number // in minutes
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: Number,
    endDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
meetingSchema.index({ organizer: 1, meetingDate: 1 });
meetingSchema.index({ 'attendees.employee': 1, meetingDate: 1 });
meetingSchema.index({ meetingDate: 1, status: 1 });

export default mongoose.model('Meeting', meetingSchema);