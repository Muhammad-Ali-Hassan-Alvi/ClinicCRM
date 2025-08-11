import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const EmailListItem = ({ email, isSelected, onSelect }) => {
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
      onClick={onSelect}
      className={`p-4 border-b cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-start">
        <p className={`font-semibold truncate pr-4 ${!email.read ? 'text-gray-900' : 'text-gray-600'}`}>{email.from.name}</p>
        <p className="text-xs text-gray-500 flex-shrink-0">{timeAgo(email.date)}</p>
      </div>
      <p className={`text-sm truncate ${!email.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{email.subject}</p>
      <div className="mt-2 flex gap-1">
        {email.tags?.map(tag => (
          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
        ))}
      </div>
    </motion.div>
  );
};

export default EmailListItem;