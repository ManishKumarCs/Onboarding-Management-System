import mongoose from 'mongoose';

const onboardingStepSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  stepName: {
    type: String,
    required: true
  },
  stepDescription: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  orderIndex: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('OnboardingStep', onboardingStepSchema);