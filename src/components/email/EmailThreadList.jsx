import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Star, Archive } from 'lucide-react';

const EmailThreadList = ({ threads, selectedThread, onThreadSelect }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getParticipantName = (thread) => {
    const otherParticipants = thread.participants.filter(p => !p.isCurrentUser);
    if (otherParticipants.length === 0) return 'Me';
    if (otherParticipants.length === 1) return otherParticipants[0].name || otherParticipants[0].email;
    return `${otherParticipants[0].name || otherParticipants[0].email} +${otherParticipants.length - 1}`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence>
        {threads.map(thread => (
          <motion.div
            key={thread.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => onThreadSelect(thread)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
              selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium truncate ${thread.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                    {getParticipantName(thread)}
                  </p>
                  {thread.hasAttachments && <Paperclip className="w-3 h-3 text-gray-400" />}
                  {thread.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                </div>
                <p className={`text-sm truncate mb-1 ${thread.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                  {thread.subject}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {thread.preview}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                <span className="text-xs text-gray-500">
                  {formatDate(thread.lastMessageAt)}
                </span>
                {!thread.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {threads.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No emails found</p>
        </div>
      )}
    </div>
  );
};

export default EmailThreadList;