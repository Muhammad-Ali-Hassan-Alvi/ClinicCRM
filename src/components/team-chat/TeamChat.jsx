import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessagesSquare, Search } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import ChatList from '@/components/team-chat/ChatList';
import ChatWindow from '@/components/team-chat/ChatWindow';
import { useLocale } from '@/contexts/LocaleContext';
import { Input } from '@/components/ui/input';

const TeamChat = () => {
  const { teamChats } = useData();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const { t } = useLocale();

  useEffect(() => {
    if (chatId) {
      const chat = teamChats.find(c => c.id === chatId);
      setSelectedChat(chat);
    } else if (teamChats.length > 0) {
      const generalChannel = teamChats.find(c => c.id === 'channel-general') || teamChats[0];
      setSelectedChat(generalChannel);
      navigate(`/team-chat/${generalChannel.id}`, { replace: true });
    }
  }, [chatId, teamChats, navigate]);

  const handleSelectChat = (id) => {
    navigate(`/team-chat/${id}`);
  };

  return (
    <div className="flex h-screen bg-transparent">
      <motion.div 
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-80 border-r border-gray-200/50 bg-white/60 backdrop-blur-lg flex flex-col"
      >
        <div className="p-4 border-b border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessagesSquare className="text-blue-500" />
            {t('sidebar.teamChat')}
          </h2>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder={t('teamChat.searchPlaceholder')} className="pl-9" />
          </div>
        </div>
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChat?.id}
        />
      </motion.div>
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} key={selectedChat.id} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50/50">
            <MessagesSquare className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold">{t('teamChat.welcomeTitle')}</h2>
            <p>{t('teamChat.welcomeMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamChat;