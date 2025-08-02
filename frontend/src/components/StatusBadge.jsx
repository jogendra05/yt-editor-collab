import React from 'react';
import { Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const configs = {
    pending: {
      icon: Clock,
      color: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-200 border border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]',
      text: '⏳ Pending',
      iconColor: 'text-yellow-400 animate-spin-slow'
    },
    approved: {
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 border border-green-500/30 hover:border-green-400/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]',
      text: '✅ Approved',
      iconColor: 'text-green-400 animate-pulse'
    },
    changes_requested: {
      icon: XCircle,
      color: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-200 border border-red-500/30 hover:border-red-400/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      text: '❌ Changes Requested',
      iconColor: 'text-red-400 animate-bounce'
    },
    completed: {
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border border-blue-500/30 hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      text: '🎉 Completed',
      iconColor: 'text-blue-400 animate-bounce'
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 group cursor-default ${config.color}`}>
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <Zap className="h-3 w-3 text-yellow-300 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
      {config.text}
    </span>
  );
}