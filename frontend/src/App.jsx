import React, { useState, useEffect } from 'react';
import {LoginPage} from './components/LoginPage';
import {CreatorDashboard} from './components/CreatorDashboard';
import {EditorDashboard} from './components/EditorDashboard';
import api from './utils/api.js';

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Move checkAuth function inside useEffect to fix dependency issue
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const data = await api.getUserInfo();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuth();
    }
  }, []); // Now the dependency array is correct since checkAuth is defined inside

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('accessToken');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  if (user.role === 'creator') {
    return <CreatorDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.role === 'editor') {
    return <EditorDashboard user={user} onLogout={handleLogout} />;
  }

  return <LoginPage onLogin={setUser} />;
};

export default App;