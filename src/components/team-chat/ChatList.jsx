import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocale } from '@/contexts/LocaleContext';
import { Hash, MessageCircle, Clock, Users } from 'lucide-react';

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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm">Start a new chat to begin messaging</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-3 space-y-1">
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full text-left flex items-start gap-3 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 group ${
              selectedChatId === chat.id 
                ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                : 'hover:shadow-sm'
            }`}
          >
            {/* Chat Avatar */}
            <div className="flex-shrink-0 mt-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-all duration-200 ${
                selectedChatId === chat.id
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-blue-500'
              }`}>
                {getInitials(chat.name)}
              </div>
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className={`font-semibold text-sm truncate transition-colors ${
                  selectedChatId === chat.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {chat.name}
                </h3>
                {chat.latestMessage && (
                  <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    {formatTime(chat.latestMessage.created_at)}
                  </span>
                )}
              </div>
              
              {chat.description && (
                <p className="text-xs text-gray-500 truncate mb-2 leading-relaxed">
                  {chat.description}
                </p>
              )}
              
              {chat.latestMessage ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">
                    {chat.latestMessage.profiles?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {chat.latestMessage.content}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">New conversation</span>
                </div>
              )}
            </div>

            {/* Selection Indicator */}
            {selectedChatId === chat.id && (
              <div className="w-1 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatList;