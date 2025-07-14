// import React, { createContext, useContext, useEffect, useState } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// const API_URL = 'http://localhost:3001/api';

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       fetchUserProfile();
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/employees/profile`);
//       const token = localStorage.getItem('token');
//       if (token) {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         // Get user role from token payload or API response
//         const userResponse = await axios.get(`${API_URL}/auth/me`);
//         setUser({ 
//           id: payload.id, 
//           email: response.data.email, 
//           role: userResponse.data.role || 'employee' 
//         });
//       }
//     } catch (error) {
//       localStorage.removeItem('token');
//       delete axios.defaults.headers.common['Authorization'];
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/login`, { email, password });
//       const { token, user } = response.data;
      
//       localStorage.setItem('token', token);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setUser(user);
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Login failed');
//     }
//   };

//   const register = async (email, password, fullName, department, position, token = null) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/register`, {
//       email,
//       password,
//       fullName,
//       department,
//       position,
//       token
//     });

//     const { token: authToken, user } = response.data;

//     localStorage.setItem('token', authToken);
//     axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
//     setUser(user);
//   } catch (error) {
//     console.error("Registration error:", error);
//     console.error("Error response:", error.response);
//     throw new Error(error.response?.data?.message || 'Registration failed');
//   }
// };


//   const logout = () => {
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common['Authorization'];
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };





import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL =`${import.meta.env.VITE_API_BASE_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees/profile`);
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Get user role from token payload or API response
        const userResponse = await axios.get(`${API_URL}/auth/me`);
        setUser({ 
          id: payload.id, 
          email: response.data.email, 
          role: userResponse.data.role || 'employee' 
        });
      }
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      // Return user for redirect logic
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email, password, fullName, department, position, token = null) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      fullName,
      department,
      position,
      token
    });

    const { token: authToken, user } = response.data;

    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setUser(user);
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error response:", error.response);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};