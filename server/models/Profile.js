import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
  name: String,
  phone: String,
});

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: String,
  department: String,
  position: String,
  startDate: String,
  phone: String,
  address: String,
  emergencyContact: emergencyContactSchema,
  profilePicture: String, // ✅ Cloudinary image URL here
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
