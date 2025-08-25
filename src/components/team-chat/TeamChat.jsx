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
  const { 
    chats, 
    currentChat, 
    loading, 
    selectChat, 
    createChat 
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // --- THIS useEffect IS NOW CORRECT AND STABLE ---
  useEffect(() => {
    const isReady = chats.length > 0;
    
    // Don't do anything until the initial chats have been loaded.
    if (!isReady) {
      return;
    }

    if (chatId) {
      // The URL has an ID. We need to make sure our context state matches it.
      // We only call selectChat if the current chat is NOT the one in the URL.
      if (!currentChat || currentChat.id !== chatId) {
        selectChat(chatId);
      }
    } else {
      // No ID in the URL, so default to the first chat.
      const firstChat = chats[0];
      // Navigate to the first chat. This will change the URL,
      // which will re-trigger this effect and run the logic above.
      navigate(`/team-chat/${firstChat.id}`, { replace: true });
    }
  // This effect ONLY depends on the URL param and the list of chats.
  // It is now stable and will not cause an infinite loop.
  }, [chatId, chats, selectChat, navigate, currentChat]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (id) => {
    // A user click should ONLY change the URL.
    // The useEffect above is responsible for syncing the state with the URL.
    // This creates a clean, one-way data flow.
    navigate(`/team-chat/${id}`);
  };

  const handleCreateChat = async (chatData) => {
    const result = await createChat(chatData.name, chatData.description, chatData.memberIds);
    if (result.success) {
      setShowCreateDialog(false);
      // Navigate to the new chat, which will trigger the useEffect.
      navigate(`/team-chat/${result.chat.id}`);
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <MessagesSquare className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 w-6 h-6" />
          </div>
          <p className="text-gray-600 font-medium">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessagesSquare className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('sidebar.teamChat')}</h2>
                <p className="text-sm text-gray-500">{chats.length} conversations</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="h-9 w-9 p-0 bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder={t('teamChat.searchPlaceholder')} 
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            chats={filteredChats}
            onSelectChat={handleSelectChat}
            selectedChatId={currentChat?.id}
          />
        </div>
      </motion.div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentChat ? (
          <ChatWindow chat={currentChat} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-white">
            <div className="max-w-md mx-auto px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessagesSquare className="w-12 h-12 text-blue-500" />
              </div>
              
              {loading && chats.length > 0 ? (
                <div className="space-y-4">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600">Loading conversation...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">{t('teamChat.welcomeTitle')}</h2>
                  <p className="text-gray-600 leading-relaxed">{t('teamChat.welcomeMessage')}</p>
                  
                  {chats.length === 0 && !loading && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Chat
                    </Button>
                  )}
                </div>
              )}
            </div>
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