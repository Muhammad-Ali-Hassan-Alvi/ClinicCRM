import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MoreVertical, Trash2, UserPlus } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import ChatMessage from '@/components/team-chat/ChatMessage';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatWindow = ({ chat }) => {
  const { messages, sendMessage, deleteChat, addMemberToChat, allUsers, chatMembers } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const { toast } = useToast();
  const { t } = useLocale();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newMessage.trim() === '' || isSending) {
      return false;
    }

    setIsSending(true);
    try {
      const result = await sendMessage(newMessage.trim());
      if (result && result.success) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsSending(false);
    }
    
    return false;
  };

  const handleDeleteChat = async () => {
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteChat(chat.id);
      if (result.success) {
        toast({
          title: "Chat Deleted",
          description: "The chat has been deleted successfully."
        });
      }
    } catch (error) {
      console.error('Delete chat error:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      const result = await addMemberToChat(chat.id, selectedUser);
      if (result.success) {
        setShowAddMember(false);
        setSelectedUser('');
        toast({
          title: "Member Added",
          description: "The member has been added to the chat."
        });
      }
    } catch (error) {
      console.error('Add member error:', error);
    }
  };

  const isChatCreator = chat?.created_by === user?.id;
  const availableUsers = allUsers.filter(u => 
    u.id !== user?.id && 
    !chatMembers.find(member => member.user_id === u.id)
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50/50">
      {/* Header */}
      <header className="p-4 border-b border-gray-200/80 bg-white/70 backdrop-blur-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
            {getInitials(chat.name)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{chat.name}</h2>
            {chat.description && (
              <p className="text-sm text-gray-500">{chat.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <UserPlus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member to Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">Select User</Label>
                  <select
                    id="user-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Choose a user...</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAddMember} disabled={!selectedUser}>
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAddMember(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </DropdownMenuItem>
              {isChatCreator && (
                <DropdownMenuItem onClick={handleDeleteChat} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <footer className="p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200/80">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2" noValidate>
  <Input
    ref={inputRef}
    type="text"
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    placeholder={t('teamChat.messagePlaceholder')}
    className="flex-1"
    disabled={isSending}
  />
  <Button 
    type="submit"   // keep this submit, but preventDefault handles reload
    disabled={isSending || !newMessage.trim()}
    size="sm"
  >
    <Send className="w-4 h-4" />
  </Button>
</form>

      </footer>
    </div>
  );
};

export default ChatWindow;