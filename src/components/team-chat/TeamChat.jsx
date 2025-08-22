import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessagesSquare, Search, Plus, Loader2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import ChatList from '@/components/team-chat/ChatList';
import ChatWindow from '@/components/team-chat/ChatWindow';
import CreateChatDialog from '@/components/team-chat/CreateChatDialog';
import { useLocale } from '@/contexts/LocaleContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TeamChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user } = useAuth();
  const { 
    chats, 
    currentChat, 
    loading, 
    selectChat, 
    createChat 
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Handle chat selection from URL or default
  useEffect(() => {
    if (chatId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat && (!currentChat || currentChat.id !== chatId)) {
        selectChat(chatId);
      }
    } else if (chats.length > 0 && !currentChat) {
      // Select first chat by default
      const firstChat = chats[0];
      selectChat(firstChat.id);
      navigate(`/team-chat/${firstChat.id}`, { replace: true });
    }
  }, [chatId, chats, currentChat, selectChat, navigate]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (id) => {
    selectChat(id);
    navigate(`/team-chat/${id}`);
  };

  const handleCreateChat = async (chatData) => {
    const result = await createChat(chatData.name, chatData.description, chatData.memberIds);
    if (result.success) {
      setShowCreateDialog(false);
      // Navigate to the new chat
      navigate(`/team-chat/${result.chat.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent">
      <motion.div 
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-80 border-r border-gray-200/50 bg-white/60 backdrop-blur-lg flex flex-col"
      >
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessagesSquare className="text-blue-500" />
              {t('sidebar.teamChat')}
            </h2>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder={t('teamChat.searchPlaceholder')} 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ChatList
          chats={filteredChats}
          onSelectChat={handleSelectChat}
          selectedChatId={currentChat?.id}
        />
      </motion.div>
      
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatWindow chat={currentChat} key={currentChat.id} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50/50">
            <MessagesSquare className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold">{t('teamChat.welcomeTitle')}</h2>
            <p className="mb-6">{t('teamChat.welcomeMessage')}</p>
            {chats.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Chat
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateChatDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
};

export default TeamChat;