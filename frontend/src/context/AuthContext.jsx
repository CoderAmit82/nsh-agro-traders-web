import React, { createContext, useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logged in user profile on load or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          fetchNotifications(token);
        } else {
          // Token is invalid/expired
          logout();
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Connection error. Server may be offline.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Fetch notifications
  const fetchNotifications = async (authToken = token) => {
    if (!authToken) return;
    try {
      const response = await fetch(`${API_BASE}/messages/notifications/all`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Mark notification as read
  const markNotificationRead = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/messages/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev =>
          prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
        );
      }
    } catch (err) {
      console.error('Error reading notification:', err);
    }
  };

  // Sign up user
  const signup = async (name, email, password, mobile, address, farmDetails) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, mobile, address, farmDetails })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Registration failed. Server is offline.');
      return { success: false, message: 'Server connection error' };
    }
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Login failed. Server is offline.');
      return { success: false, message: 'Server connection error' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setNotifications([]);
    setError(null);
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Profile update failed. Server is offline.');
      return { success: false, message: 'Server connection error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        notifications,
        loading,
        error,
        signup,
        login,
        logout,
        updateProfile,
        fetchNotifications,
        markNotificationRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
