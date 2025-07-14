import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Documents from './pages/Documents';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminEmployeeDetail from './pages/admin/AdminEmployeeDetail';
import AdminDocuments from './pages/admin/AdminDocuments';
import Messages from './pages/Messages';
import AdminMessages from './pages/admin/AdminMessages';
import Tasks from './pages/Tasks';
import AdminTasks from './pages/admin/AdminTasks';
import AdminInvitations from './pages/admin/AdminInvitations';
import AdminWelcomeVideo from './pages/admin/AdminWelcomeVideo';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminMeetings from './pages/admin/AdminMeetings';
import AdminMentors from './pages/admin/AdminMentors';
import AdminBroadcasts from './pages/admin/AdminBroadcasts';
import Leaves from './pages/Leaves';
import Meetings from './pages/Meetings';
import Mentors from './pages/Mentors';
import Broadcasts from './pages/Broadcasts';
import Notifications from './pages/Notifications';

// Component to handle admin redirect
const AdminRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<AdminRedirect />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Layout>
                  <Onboarding />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <Documents />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <Layout>
                  <Leaves />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Meetings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentors"
            element={
              <ProtectedRoute>
                <Layout>
                  <Mentors />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/broadcasts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Broadcasts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminEmployees />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees/:employeeId"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminEmployeeDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminDocuments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminTasks />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <Messages />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminMessages />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invitations"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminInvitations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leaves"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminLeaves />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/meetings"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminMeetings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mentors"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminMentors />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/broadcasts"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminBroadcasts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/welcome-video"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminWelcomeVideo />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;