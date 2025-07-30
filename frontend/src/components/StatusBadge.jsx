import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';


export const StatusBadge = ({ status }) => {
  const configs = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Approved' },
    changes_requested: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Changes Requested' },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </span>
  );
};