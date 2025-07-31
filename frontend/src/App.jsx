import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { CreatorDashboard } from './components/CreatorDashboard';
import { EditorDashboard } from './components/EditorDashboard';
import { LandingPage } from './components/LandingPage'; // ✅ import it
import api from './utils/api.js';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true); // ✅ state for landing

  useEffect(() => {
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

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuth();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('accessToken');
      setUser(null);
      setShowLanding(true); // ✅ return to landing on logout
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

  if (showLanding && !user) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
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
