import React from 'react';
import { Video, Upload, Users } from 'lucide-react';
import api from '../utils/api'; // Adjust this path based on where your api.js file is located


export const LoginPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Video className="mx-auto h-12 w-12 text-purple-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YT Editor Hub</h1>
          <p className="text-gray-600">Collaborate seamlessly on YouTube content</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => api.signIn('creator')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <Upload className="h-5 w-5" />
            Sign in as Creator
          </button>
          
          <button
            onClick={() => api.signIn('editor')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <Users className="h-5 w-5" />
            Sign in as Editor
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure OAuth login with Google</p>
        </div>
      </div>
    </div>
  );
};
