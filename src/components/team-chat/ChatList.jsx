import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocale } from '@/contexts/LocaleContext';
import { Hash, MessageCircle, Clock } from 'lucide-react';

const ChatList = ({ chats, onSelectChat, selectedChatId }) => {
  const { t } = useLocale();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (chats.length === 0) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-4 text-center text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No chats yet</p>
          <p className="text-xs text-gray-400">Create a chat to get started</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 ${
              selectedChatId === chat.id 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-700'
            }`}
          >
            {/* Chat Avatar/Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(chat.name)}
              </div>
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm truncate">{chat.name}</h3>
                {chat.latestMessage && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(chat.latestMessage.created_at)}
                  </span>
                )}
              </div>
              
              {chat.description && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {chat.description}
                </p>
              )}
              
              {chat.latestMessage && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600 font-medium">
                    {chat.latestMessage.profiles?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {chat.latestMessage.content}
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatList;