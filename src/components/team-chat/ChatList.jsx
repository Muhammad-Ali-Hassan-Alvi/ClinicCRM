import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Hash, User } from 'lucide-react';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { teamChats, users } = useData();
  const { t } = useLocale();
  const currentUser = users[0] || { id: 'user-1' };

  const channels = teamChats.filter(c => c.type === 'channel');
  const dms = teamChats.filter(c => c.type === 'dm');

  const getDmPartner = (chat) => {
    const partnerId = chat.participantIds.find(id => id !== currentUser.id);
    return users.find(u => u.id === partnerId) || { name: 'Unknown User', avatar: '?' };
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        <h3 className="px-2 py-1 text-sm font-semibold text-gray-500">{t('teamChat.channels')}</h3>
        {channels.map(chat => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedChatId === chat.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            <Hash className="w-5 h-5 text-gray-400" />
            <span className="font-medium">{chat.name}</span>
          </button>
        ))}
        
        <h3 className="px-2 py-1 mt-4 text-sm font-semibold text-gray-500">{t('teamChat.directMessages')}</h3>
        {dms.map(chat => {
          const partner = getDmPartner(chat);
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedChatId === chat.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">
                {partner.avatar}
              </div>
              <span className="font-medium">{partner.name}</span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ChatList;