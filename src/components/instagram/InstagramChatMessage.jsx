import React from 'react';
import { motion } from 'framer-motion';

const InstagramChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-white ${isUser ? 'bg-gradient-to-r from-purple-500 to-pink-500 rounded-br-none' : 'bg-gradient-to-r from-gray-700 to-gray-800 rounded-bl-none'}`}>
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-purple-200' : 'text-gray-300'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

export default InstagramChatMessage;