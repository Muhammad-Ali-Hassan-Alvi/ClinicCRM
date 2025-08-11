import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const ConversationListItem = ({ conversation, isSelected, onSelect, getAccountUsername }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => onSelect(conversation)}
      className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-purple-100/70' : 'hover:bg-gray-100/70'}`}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg mr-3">
        {conversation.contactAvatar}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 truncate">{conversation.contactName}</h3>
          <span className="text-xs text-gray-500">{timeAgo(conversation.lastMessageTimestamp)}</span>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-sm text-gray-600 truncate pr-2">{conversation.lastMessage}</p>
          {conversation.unreadCount > 0 && (
            <div className="w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {conversation.unreadCount}
            </div>
          )}
        </div>
        {conversation.instagramAccountId && getAccountUsername && (
          <div className="mt-1">
            <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
              {getAccountUsername(conversation.instagramAccountId)}
            </Badge>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const InstagramConversationList = ({ conversations, selectedConversation, onSelectConversation, getAccountUsername }) => {
  const sortedConversations = [...conversations].sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
  const selectedId = selectedConversation?.contactId || selectedConversation?.instagramUsername;

  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence>
        {sortedConversations.map(convo => {
          const convoId = convo.contactId || convo.instagramUsername;
          return (
            <ConversationListItem
              key={convoId}
              conversation={convo}
              isSelected={selectedId === convoId}
              onSelect={onSelectConversation}
              getAccountUsername={getAccountUsername}
            />
          )
        })}
      </AnimatePresence>
    </div>
  );
};

export default InstagramConversationList;