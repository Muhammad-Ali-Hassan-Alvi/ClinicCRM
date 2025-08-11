import React from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
};

const NotificationItem = ({ Icon, title, description, link, timestamp, color }) => {
  return (
    <DropdownMenuItem asChild className="p-0">
      <Link to={link} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors w-full cursor-pointer">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
          <p className="text-xs text-gray-400 mt-1">{timeAgo(timestamp)}</p>
        </div>
      </Link>
    </DropdownMenuItem>
  );
};

export default NotificationItem;