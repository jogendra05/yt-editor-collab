import React from 'react';
import { Video, Upload, Users, Play, Crown, Scissors, Star, Sparkles, Zap } from 'lucide-react';
import api from '../utils/api'; // Adjust this path based on where your api.js file is located

export const LoginPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-pink-500/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-blue-500/20 to-transparent rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-float-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-pink-300/40 rounded-full animate-float-delayed opacity-50"></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-blue-300/40 rounded-full animate-float-slow opacity-70"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-purple-300/40 rounded-full animate-float opacity-40"></div>
      </div>

      <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(139,69,19,0.3)] animate-slideInUp">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25 animate-pulse-glow hover:scale-110 transition-all duration-300 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <Play className="h-10 w-10 text-white relative z-10" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-spin-slow" />
            <Star className="absolute -bottom-1 -left-1 h-4 w-4 text-yellow-400 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 animate-slideInUp animation-delay-100">
            🎬 YT Editor Hub
            <Zap className="inline-block ml-2 h-8 w-8 text-yellow-400 animate-pulse" />
          </h1>
          <p className="text-gray-300 text-lg animate-slideInUp animation-delay-200">✨ Collaborate seamlessly on YouTube content</p>
        </div>
        
        <div className="space-y-4 animate-slideInUp animation-delay-300">
          <button
            onClick={() => api.signIn('creator')}
            className="group w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 flex items-center justify-center gap-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all relative z-10 group-hover:rotate-12">
              <Upload className="h-5 w-5" />
              <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-bounce" />
            </div>
            <span className="text-lg relative z-10">👑 Sign in as Creator</span>
          </button>
          
          <button
            onClick={() => api.signIn('editor')}
            className="group w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all relative z-10 group-hover:rotate-12">
              <Users className="h-5 w-5" />
              <Scissors className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-bounce" />
            </div>
            <span className="text-lg relative z-10">✂️ Sign in as Editor</span>
          </button>
        </div>
        
        <div className="mt-10 text-center animate-slideInUp animation-delay-400">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-sm">🔒 Secure OAuth login with Google</p>
          </div>
          <p className="text-xs text-gray-500">🛡️ Your data is protected with enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}