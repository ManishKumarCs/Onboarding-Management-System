import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, UserCheck, Calendar, Save, Camera, Upload, X } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    department: '',
    position: '',
    startDate: '',
    phone: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: ''
    },
    profilePicture: {
      url: null,
      publicId: null
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/profile`);
      
      setProfile({
        ...response.data,
        startDate: response.data.startDate ? new Date(response.data.startDate).toISOString().split('T')[0] : '',
        emergencyContact: response.data.emergencyContact || { name: '', phone: '' },
        profilePicture: response.data.profilePicture || { url: null, publicId: null }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError('');
  setSuccess('');

  try {
    const updateData = { ...profile };
    // Remove ALL fields that shouldn't be updated
    delete updateData.email;
    delete updateData.startDate;
    delete updateData.profilePicture;
    delete updateData._id;
    delete updateData.userId;
    delete updateData.onboardingStatus;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v; // ✅ ADD THIS LINE

    const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/employees/profile`, updateData);
    setProfile(prev => ({ ...prev, ...response.data }));
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    console.error('Error updating profile:', error);
    setError(error.response?.data?.message || 'Failed to update profile');
  } finally {
    setSaving(false);
  }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    setError('Image size must be less than 5MB');
    return;
  }

  setUploading(true);
  setError('');
  
  const formData = new FormData();
  formData.append('image', file); // ✅ Changed from 'profilePicture' to 'image'

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/employees/profile/picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setProfile(prev => ({ 
      ...prev, 
      profilePicture: response.data.profilePicture 
    }));
    setSuccess('Profile picture updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  } catch (error) {
    console.error('Error uploading image:', error);
    setError(error.response?.data?.message || 'Failed to upload image');
  } finally {
    setUploading(false);
  }
};

  const handleImageDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/employees/profile/picture`);
      setProfile(prev => ({ 
        ...prev, 
        profilePicture: { url: null, publicId: null }
      }));
      setSuccess('Profile picture removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting image:', error);
      setError(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-dots">
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-1">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="card p-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-xl">
                {profile.profilePicture?.url ? (
                  <img 
                    src={profile.profilePicture.url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black to-gray-800">
                    <span className="text-white text-4xl font-bold">
                      {getInitials(profile.fullName)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 flex space-x-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 hover:scale-110"
                  title="Upload new picture"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                
                {profile.profilePicture?.url && (
                  <button
                    onClick={handleImageDelete}
                    className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all duration-200 hover:scale-110"
                    title="Remove picture"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {profile.fullName || 'Complete Your Profile'}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {profile.department && profile.position 
                  ? `${profile.position} • ${profile.department}`
                  : 'Add your role and department'
                }
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.startDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Started {new Date(profile.startDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl animate-slide-up">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-slide-up">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="card p-8 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      className="input-field bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                    <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={profile.department}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={profile.position}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Software Developer, Manager"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={profile.startDate}
                      className="input-field bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Start date is set during registration and cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                    />
                    <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card p-8 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="input-field resize-none"
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={profile.emergencyContact.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Contact person name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={profile.emergencyContact.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-3"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;