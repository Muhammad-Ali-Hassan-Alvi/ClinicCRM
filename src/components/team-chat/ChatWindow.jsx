import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import ChatMessage from '@/components/team-chat/ChatMessage';
import { useLocale } from '@/contexts/LocaleContext';
import { Hash } from 'lucide-react';

const ChatWindow = ({ chat }) => {
  const { addTeamChatMessage, users } = useData();
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const { t } = useLocale();
  const messagesEndRef = useRef(null);
  const currentUser = users[0] || { id: 'user-1' };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
    };

    try {
      const success = await addTeamChatMessage(chat.id, message);
      if (success) {
        setNewMessage('');
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully."
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getChatName = () => {
    if (chat.type === 'channel') {
      return chat.name;
    }
    const partnerId = chat.participantIds.find(id => id !== currentUser.id);
    const partner = users.find(u => u.id === partnerId);
    return partner ? partner.name : 'Direct Message';
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50/50">
      <header className="p-4 border-b border-gray-200/80 bg-white/70 backdrop-blur-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          {chat.type === 'channel' ? (
            <Hash className="w-6 h-6 text-gray-500" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {getChatName().substring(0, 2).toUpperCase()}
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-800">{getChatName()}</h2>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {chat.messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('teamChat.messagePlaceholder')}
            className="flex-1 px-4 py-2 rounded-full border bg-gray-100 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-gray-300">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;