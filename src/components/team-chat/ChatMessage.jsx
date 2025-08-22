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
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-sm text-white">
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
          <p className="font-semibold text-sm mb-1 text-blue-600">
            {senderInfo.name}
          </p>
        )}
        
        <div className={`p-3 rounded-2xl ${
          isSender 
            ? 'bg-blue-500 text-white rounded-br-lg' 
            : 'bg-white text-gray-800 rounded-bl-lg shadow-sm border border-gray-100'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isSender ? 'text-blue-200' : 'text-gray-400'
          } text-right`}>
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;