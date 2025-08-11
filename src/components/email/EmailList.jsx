import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return new Date(date).toLocaleDateString();
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m`;
  return 'Just now';
};

const EmailListItem = ({ email, onSelect, isSelected }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    onClick={() => onSelect(email)}
    className={`flex items-start p-4 cursor-pointer border-b border-gray-200/80 transition-colors duration-200 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100/70'} ${!email.read ? 'bg-blue-50/50' : 'bg-white'}`}
  >
    <Avatar className="w-10 h-10 mr-4">
      <AvatarFallback className={!email.read ? "bg-blue-500 text-white" : "bg-gray-200"}>
        {email.from.substring(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between items-center">
        <p className={`font-semibold truncate pr-4 ${!email.read ? 'text-gray-900' : 'text-gray-700'}`}>{email.fromName || email.from}</p>
        <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(email.date)}</span>
      </div>
      <p className={`font-medium truncate ${!email.read ? 'text-gray-800' : 'text-gray-600'}`}>{email.subject}</p>
      <p className="text-sm text-gray-500 truncate">{email.snippet}</p>
    </div>
  </motion.div>
);


const EmailList = ({ emails, onSelectEmail, selectedEmail }) => {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <AnimatePresence>
        {emails.map(email => (
          <EmailListItem 
            key={email.id} 
            email={email} 
            onSelect={onSelectEmail}
            isSelected={selectedEmail?.id === email.id}
          />
        ))}
      </AnimatePresence>
      {emails.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No emails in this folder.</p>
        </div>
      )}
    </div>
  );
};

export default EmailList;