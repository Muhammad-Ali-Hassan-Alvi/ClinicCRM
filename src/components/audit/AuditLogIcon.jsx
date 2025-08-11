import React from 'react';
import { PlusCircle, Edit, Trash2, FileUp, Send, LogIn, LogOut, Settings, FileDown, MessageSquare, CheckCircle } from 'lucide-react';

const actionIcons = {
  CREATE: { icon: PlusCircle, color: 'text-green-500' },
  UPDATE: { icon: Edit, color: 'text-blue-500' },
  DELETE: { icon: Trash2, color: 'text-red-500' },
  UPLOAD: { icon: FileUp, color: 'text-purple-500' },
  DOWNLOAD: { icon: FileDown, color: 'text-purple-500' },
  SEND_MESSAGE: { icon: Send, color: 'text-cyan-500' },
  CONVERT: { icon: CheckCircle, color: 'text-emerald-500' },
  UPDATE_SETTINGS: { icon: Settings, color: 'text-gray-600' },
  DEFAULT: { icon: MessageSquare, color: 'text-gray-500' },
};

const getActionType = (action) => {
  if (action.startsWith('CREATE')) return 'CREATE';
  if (action.startsWith('UPDATE')) return 'UPDATE';
  if (action.startsWith('DELETE')) return 'DELETE';
  if (action.startsWith('UPLOAD')) return 'UPLOAD';
  if (action.startsWith('DOWNLOAD')) return 'DOWNLOAD';
  if (action.startsWith('SEND')) return 'SEND_MESSAGE';
  if (action.startsWith('CONVERT')) return 'CONVERT';
  if (action.startsWith('SETTINGS')) return 'UPDATE_SETTINGS';
  return 'DEFAULT';
};

const AuditLogIcon = ({ action }) => {
  const actionType = getActionType(action);
  const { icon: Icon, color } = actionIcons[actionType] || actionIcons.DEFAULT;

  return (
    <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

export default AuditLogIcon;