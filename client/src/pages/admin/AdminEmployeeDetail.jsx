import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  UserCheck,
  Save
} from 'lucide-react';
import axios from 'axios';

const AdminEmployeeDetail = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [onboardingSteps, setOnboardingSteps] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      const [employeeResponse, stepsResponse, documentsResponse, statusResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${employeeId}`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/employee/${employeeId}/steps`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/documents/employee/${employeeId}`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/employee/${employeeId}/status`)
      ]);

      setEmployee(employeeResponse.data);
      setOnboardingSteps(stepsResponse.data);
      setDocuments(documentsResponse.data);
      setOnboardingStatus(statusResponse.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeStatus = async (newStatus) => {
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${employeeId}/status`, {
        onboardingStatus: newStatus
      });
      setEmployee(prev => ({ ...prev, onboardingStatus: newStatus }));
    } catch (error) {
      console.error('Error updating employee status:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateDocumentStatus = async (documentId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}/status`, { status });
      fetchEmployeeData(); // Refresh data
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const completeOnboardingStep = async (stepId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/employee/${employeeId}/steps/${stepId}/complete`);
      fetchEmployeeData(); // Refresh data
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  const viewDocument = (documentId, documentName) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/documents/${documentId}/download`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': case 'approved': return 'bg-green-100 text-green-800';
      case 'in-progress': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': case 'pending': return <Clock className="h-4 w-4 text-black" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Employee not found</h3>
        <Link to="/admin/employees" className="text-black hover:text-blue-700">
          Back to employees
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/employees"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {employee.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
              <p className="text-gray-600">{employee.department} • {employee.position}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(employee.onboardingStatus)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee.onboardingStatus)}`}>
                {employee.onboardingStatus}
              </span>
            </div>
            
            <select
              value={employee.onboardingStatus}
              onChange={(e) => updateEmployeeStatus(e.target.value)}
              disabled={saving}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', name: 'Profile', icon: User },
              { id: 'onboarding', name: 'Onboarding', icon: CheckCircle },
              { id: 'documents', name: 'Documents', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium text-gray-900">{employee.fullName || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{employee.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{employee.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium text-gray-900">{employee.department || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium text-gray-900">{employee.position || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium text-gray-900">
                          {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{employee.address || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Emergency Contact</p>
                        <p className="font-medium text-gray-900">
                          {employee.emergencyContact?.name || 'Not provided'}
                        </p>
                        {employee.emergencyContact?.phone && (
                          <p className="text-sm text-gray-600">{employee.emergencyContact.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding Tab */}
          {activeTab === 'onboarding' && (
            <div className="space-y-6">
              {onboardingStatus && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-900">Onboarding Progress</h3>
                    <span className="text-2xl font-bold text-black">
                      {Math.round(onboardingStatus.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${onboardingStatus.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    {onboardingStatus.completedSteps} of {onboardingStatus.totalSteps} steps completed
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {onboardingSteps.map((step, index) => (
                  <div key={step._id} className="relative">
                    {index < onboardingSteps.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                      step.completed ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                          <Clock className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${
                            step.completed ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {step.stepName}
                          </h4>
                          {step.completed && (
                            <span className="text-xs text-green-600">
                              Completed {new Date(step.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          step.completed ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {step.stepDescription}
                        </p>
                        
                        {!step.completed && (
                          <button
                            onClick={() => completeOnboardingStep(step._id)}
                            className="mt-2 px-3 py-1 bg-black text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Mark as Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                  <p className="text-gray-600">This employee hasn't uploaded any documents yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div key={document._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{document.documentName}</h4>
                          <p className="text-sm text-gray-600">{document.documentType}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded {new Date(document.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(document.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {document.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateDocumentStatus(document._id, 'approved')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateDocumentStatus(document._id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => viewDocument(document._id, document.documentName)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeDetail;