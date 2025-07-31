import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { CreatorDashboard } from './components/CreatorDashboard';
import { EditorDashboard } from './components/EditorDashboard';
import { LandingPage } from './components/LandingPage';
import api from './utils/api.js';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await api.getUserInfo();
        setUser(user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setShowLanding(true);
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
    return <LoginPage />;
  }

  if (user.role === 'creator') {
    return <CreatorDashboard user={user} onLogout={handleLogout} />;
  }
  if (user.role === 'editor') {
    return <EditorDashboard user={user} onLogout={handleLogout} />;
  }

  // Fallback
  return <LoginPage />;
};

export default App;
