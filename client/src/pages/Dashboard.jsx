import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import WelcomeVideo from './WelcomeVideo';
import { 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const navigate = useNavigate();

  if(user.role=='admin'){
    navigate('/admin');
  }

  useEffect(() => {
    fetchDashboardData();
    checkFirstLogin();
  }, []);

  const checkFirstLogin = () => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeVideo');
    if (!hasSeenWelcome) {
      setIsFirstLogin(true);
      setShowWelcomeVideo(true);
    }
  };

  const handleCloseWelcomeVideo = () => {
    setShowWelcomeVideo(false);
    localStorage.setItem('hasSeenWelcomeVideo', 'true');
  };

  const fetchDashboardData = async () => {
    try {
      const [statusResponse, profileResponse, documentsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/status`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/profile`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/documents`)
      ]);

      setOnboardingStatus(statusResponse.data);
      setProfile(profileResponse.data);
      setRecentDocuments(documentsResponse.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };


  return (
    <>
    {showWelcomeVideo && isFirstLogin && (
        <WelcomeVideo onClose={handleCloseWelcomeVideo} />
      )}
      <div className="space-y-8">
        {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {profile?.fullName || 'Employee'}!
              </h1>
              <p className="text-black text-lg">
                Ready to continue your onboarding journey?
              </p>
            </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Onboarding Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {onboardingStatus?.progress || 0}%
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${onboardingStatus?.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Steps</p>
              <p className="text-2xl font-bold text-gray-900">
                {onboardingStatus?.completedSteps || 0}/{onboardingStatus?.totalSteps || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentDocuments.length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Onboarding Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(onboardingStatus?.status)}`}>
              {onboardingStatus?.status || 'pending'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon(onboardingStatus?.status)}
            <div>
              <p className="text-sm text-gray-600">
                {onboardingStatus?.status === 'completed' 
                  ? 'Congratulations! You have completed all onboarding steps.'
                  : onboardingStatus?.status === 'in-progress'
                  ? 'Keep going! You\'re making great progress.'
                  : 'Let\'s get started with your onboarding process.'
                }
              </p>
            </div>
          </div>

          <Link
            to="/onboarding"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Summary</h3>
            <User className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{profile?.fullName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium text-gray-900">{profile?.department || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-medium text-gray-900">{profile?.position || 'Not provided'}</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mt-4"
          >
            Edit Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
          <Link to="/documents" className="text-black hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>
        
        {recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.documentName}</p>
                    <p className="text-sm text-gray-600">{doc.documentType}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents uploaded yet</p>
            <Link
              to="/documents"
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
            >
              Upload Documents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Dashboard;