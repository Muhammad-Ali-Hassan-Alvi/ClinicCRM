import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ChatMessage = ({ message }) => {
  const { user } = useAuth();
  const isSender = message.user_id === user?.id;
  const senderInfo = message.profiles || { name: 'Unknown', avatar_url: null };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatar = () => {
    if (senderInfo.avatar_url) {
      return (
        <img 
          src={senderInfo.avatar_url} 
          alt={senderInfo.name}
          className="w-8 h-8 rounded-full object-cover shadow-sm"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center font-semibold text-xs text-white shadow-sm">
        {getInitials(senderInfo.name)}
      </div>
    );
  };

  return (
    <div className={`flex items-end gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {!isSender && (
        <div className="flex-shrink-0">
          {getAvatar()}
        </div>
      )}
      
      <div className={`max-w-md ${isSender ? 'order-first' : ''}`}>
        {!isSender && (
          <p className="font-medium text-sm mb-1 text-gray-700">
            {senderInfo.name}
          </p>
        )}
        
        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
          isSender 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : 'bg-gray-50 text-gray-900 rounded-bl-md border border-gray-100'
        }`}>
          <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
            {message.content}
          </p>
          <p className={`text-xs mt-2 ${
            isSender ? 'text-blue-100' : 'text-gray-400'
          } text-right`}>
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;