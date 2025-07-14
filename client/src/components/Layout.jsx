import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Home, 
  User, 
  FileText, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X,
  Building2,
  Shield,
  Users,
  FileCheck,
  MessageSquare,
  ClipboardList,
  Mail,
  Calendar,
  UserCheck,
  Video,
  Megaphone,
  Bell
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/employees/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Onboarding', href: '/onboarding', icon: CheckSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList },
    { name: 'Leave Requests', href: '/leaves', icon: Calendar },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Mentorship', href: '/mentors', icon: UserCheck },
    { name: 'Announcements', href: '/broadcasts', icon: Megaphone },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'Manage Employees', href: '/admin/employees', icon: Users },
    { name: 'Review Documents', href: '/admin/documents', icon: FileCheck },
    { name: 'Task Management', href: '/admin/tasks', icon: ClipboardList },
    { name: 'Leave Management', href: '/admin/leaves', icon: Calendar },
    { name: 'Meeting Management', href: '/admin/meetings', icon: Calendar },
    { name: 'Mentor Management', href: '/admin/mentors', icon: UserCheck },
    { name: 'Broadcast Management', href: '/admin/broadcasts', icon: Megaphone },
    { name: 'Employee Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Send Invitations', href: '/admin/invitations', icon: Mail },
    { name: 'Welcome Videos', href: '/admin/welcome-video', icon: Video },
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : employeeNavigation;

  // Helper function to get initials
  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email?.charAt(0).toUpperCase() || 'U';
  };

  // Profile Avatar Component
  const ProfileAvatar = ({ size = 'w-8 h-8' }) => (
    <div className={`${size} rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
      {profile?.profilePicture?.url ? (
        <img 
          src={profile.profilePicture.url} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black to-gray-800">
          <span className="text-white text-sm font-medium">
            {getInitials(profile?.fullName, user?.email)}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between px-2 p-1 border-b">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-black" />
                <span className="text-xl font-bold text-gray-900">OMS</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-6 py-[8px] text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-black bg-blue-50 border-r-2 border-black'
                        : 'text-gray-700 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 border-t">
              {/* Mobile profile section */}
              <div className="flex items-center pb-1 mb-1 border-b">
                <ProfileAvatar />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile?.fullName || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile?.position || 'Employee'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center h-16 px-6 bg-black">
            <Building2 className="h-8 w-8 text-white" />
            <span className="ml-3 text-xl font-bold text-white">OMS</span>
          </div>
          <nav className="flex-1 px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-[8px] text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-black bg-blue-50'
                      : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-2 border-t">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0">
                <ProfileAvatar />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.fullName || user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.position || 'Employee'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Building2 className="h-8 w-8 text-black" />
              <span className="text-xl font-bold text-gray-900">OMS</span>
            </div>
            <div className="flex items-center space-x-2">
              <ProfileAvatar />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;




// import React from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { 
//   Home, 
//   User, 
//   FileText, 
//   CheckSquare, 
//   LogOut, 
//   Menu, 
//   X,
//   Building2,
//   Shield,
//   Users,
//   FileCheck,
//   MessageSquare,
//   ClipboardList,
//   Trophy,
//   Calendar,
//   Mail,
//   Video,
//   Bell,
//   UserCheck,
//   Megaphone
// } from 'lucide-react';

// const Layout = ({ children }) => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const employeeNavigation = [
//     { name: 'Dashboard', href: '/dashboard', icon: Home },
//     { name: 'Onboarding', href: '/onboarding', icon: CheckSquare },
//     { name: 'Documents', href: '/documents', icon: FileText },
//     { name: 'Tasks', href: '/tasks', icon: ClipboardList },
//     { name: 'Leave Requests', href: '/leaves', icon: Calendar },
//     { name: 'Meetings', href: '/meetings', icon: Calendar },
//     { name: 'Mentorship', href: '/mentors', icon: UserCheck },
//     { name: 'Announcements', href: '/broadcasts', icon: Megaphone },
//     { name: 'Notifications', href: '/notifications', icon: Bell },
//     { name: 'Messages', href: '/messages', icon: MessageSquare },
//     { name: 'Profile', href: '/profile', icon: User },
//   ];

//   const adminNavigation = [
//     { name: 'Admin Dashboard', href: '/admin', icon: Shield },
//     { name: 'Manage Employees', href: '/admin/employees', icon: Users },
//     { name: 'Review Documents', href: '/admin/documents', icon: FileCheck },
//     { name: 'Task Management', href: '/admin/tasks', icon: ClipboardList },
//     { name: 'Leave Management', href: '/admin/leaves', icon: Calendar },
//     { name: 'Meeting Management', href: '/admin/meetings', icon: Calendar },
//     { name: 'Mentor Management', href: '/admin/mentors', icon: UserCheck },
//     { name: 'Broadcast Management', href: '/admin/broadcasts', icon: Megaphone },
//     { name: 'Employee Messages', href: '/admin/messages', icon: MessageSquare },
//     { name: 'Send Invitations', href: '/admin/invitations', icon: Mail },
//     { name: 'Welcome Videos', href: '/admin/welcome-video', icon: Video },
//     { name: 'My Profile', href: '/profile', icon: User },
//   ];

//   const navigation = user?.role === 'admin' ? adminNavigation : employeeNavigation;
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile menu overlay */}
//       {isMobileMenuOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
//           <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
//             <div className="flex items-center justify-between p-4 border-b">
//               <div className="flex items-center space-x-3">
//                 <Building2 className="h-8 w-8 text-blue-600" />
//                 <span className="text-xl font-bold text-gray-900">OMS</span>
//               </div>
//               <button
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className="p-2 rounded-md hover:bg-gray-100"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <nav className="mt-6">
//               {navigation.map((item) => {
//                 const Icon = item.icon;
//                 const isActive = location.pathname === item.href;
//                 return (
//                   <Link
//                     key={item.name}
//                     to={item.href}
//                     onClick={() => setIsMobileMenuOpen(false)}
//                     className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
//                       isActive
//                         ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
//                         : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Icon className="h-5 w-5 mr-3" />
//                     {item.name}
//                   </Link>
//                 );
//               })}
//             </nav>
//             <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
//               >
//                 <LogOut className="h-5 w-5 mr-3" />
//                 Sign Out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Desktop sidebar */}
//       <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
//         <div className="flex flex-col flex-grow bg-white shadow-lg">
//           <div className="flex items-center h-16 px-6 bg-blue-600">
//             <Building2 className="h-8 w-8 text-white" />
//             <span className="ml-3 text-xl font-bold text-white">OMS</span>
//           </div>
//           <nav className="flex-1 px-4 py-6 space-y-2">
//             {navigation.map((item) => {
//               const Icon = item.icon;
//               const isActive = location.pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
//                     isActive
//                       ? 'text-blue-600 bg-blue-50'
//                       : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Icon className="h-5 w-5 mr-3" />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>
//           <div className="p-4 border-t">
//             <div className="flex items-center mb-4">
//               <div className="flex-shrink-0">
//                 <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//                   <span className="text-white text-sm font-medium">
//                     {user?.email?.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-gray-700 truncate">
//                   {user?.email}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
//             >
//               <LogOut className="h-5 w-5 mr-3" />
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         {/* Mobile header */}
//         <div className="lg:hidden bg-white shadow-sm border-b">
//           <div className="flex items-center justify-between px-4 py-3">
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={() => setIsMobileMenuOpen(true)}
//                 className="p-2 rounded-md hover:bg-gray-100"
//               >
//                 <Menu className="h-5 w-5" />
//               </button>
//               <Building2 className="h-8 w-8 text-blue-600" />
//               <span className="text-xl font-bold text-gray-900">OMS</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//                 <span className="text-white text-sm font-medium">
//                   {user?.email?.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Page content */}
//         <main className="py-8">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;