import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingOnboarding: 0,
    completedOnboarding: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesResponse, documentsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/all`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/documents/all`)
      ]);

      const employees = employeesResponse.data;
      const documents = documentsResponse.data;

      // Calculate stats
      const totalEmployees = employees.length;
      const pendingOnboarding = employees.filter(emp => emp.onboardingStatus === 'pending').length;
      const completedOnboarding = employees.filter(emp => emp.onboardingStatus === 'completed').length;
      const pendingDocs = documents.filter(doc => doc.status === 'pending').length;
      const approvedDocs = documents.filter(doc => doc.status === 'approved').length;
      const rejectedDocs = documents.filter(doc => doc.status === 'rejected').length;

      setStats({
        totalEmployees,
        pendingOnboarding,
        completedOnboarding,
        pendingDocuments: pendingDocs,
        approvedDocuments: approvedDocs,
        rejectedDocuments: rejectedDocs
      });

      // Get recent employees (last 5)
      setRecentEmployees(employees.slice(0, 5));
      
      // Get pending documents (last 5)
      setPendingDocuments(documents.filter(doc => doc.status === 'pending').slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-black" />;
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

  return (
    <div className="space-y-4">
      {/* Welcome Section */}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Manage employee onboarding and monitor system activity</p>
                </div>
              </div>
            </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Onboarding</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOnboarding}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Onboarding</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOnboarding}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingDocuments}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedDocuments}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedDocuments}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Employees */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Employees</h3>
            <Link to="/admin/employees" className="text-black hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>
          
          {recentEmployees.length > 0 ? (
            <div className="space-y-3">
              {recentEmployees.map((employee) => (
                <div key={employee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {employee.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{employee.fullName}</p>
                      <p className="text-sm text-gray-600">{employee.department} • {employee.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(employee.onboardingStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.onboardingStatus)}`}>
                      {employee.onboardingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No employees found</p>
            </div>
          )}
        </div>

        {/* Pending Documents */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Documents</h3>
            <Link to="/admin/documents" className="text-black hover:text-blue-700 text-sm font-medium">
              Review all
            </Link>
          </div>
          
          {pendingDocuments.length > 0 ? (
            <div className="space-y-3">
              {pendingDocuments.map((document) => (
                <div key={document._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">{document.documentName}</p>
                      <p className="text-sm text-gray-600">
                        {document.employeeId?.fullName} • {document.documentType}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending documents</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/employees"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Employees</h3>
              <p className="text-gray-600">View, edit, and manage employee profiles and onboarding status</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
              <Users className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-black font-medium">
            <span>Manage Employees</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/admin/documents"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Documents</h3>
              <p className="text-gray-600">Approve or reject employee documents and manage submissions</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-600 font-medium">
            <span>Review Documents</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;