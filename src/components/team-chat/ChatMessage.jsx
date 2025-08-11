import React from 'react';
import { useData } from '@/contexts/DataContext';

const ChatMessage = ({ message }) => {
  const { users } = useData();
  const currentUser = users[0] || { id: 'user-1' };
  const isSender = message.userId === currentUser.id;
  const senderInfo = users.find(u => u.id === message.userId) || { name: 'Unknown', avatar: '?' };

  return (
    <div className={`flex items-end gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {!isSender && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">
          {senderInfo.avatar}
        </div>
      )}
      <div className={`max-w-md p-3 rounded-2xl ${isSender ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg shadow-sm'}`}>
        {!isSender && <p className="font-semibold text-sm mb-1 text-blue-600">{senderInfo.name}</p>}
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isSender ? 'text-blue-200' : 'text-gray-400'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;