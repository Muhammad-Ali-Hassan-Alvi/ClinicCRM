import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MoreVertical, Trash2, UserPlus, Settings, AlertTriangle } from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ChatWindow = ({ chat }) => {
  const { messages, sendMessage, deleteChat, addMemberToChat, allUsers, chatMembers } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
            {getInitials(chat.name)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{chat.name}</h2>
            {chat.description && (
              <p className="text-sm text-gray-500">{chat.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">{chatMembers.length} members</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddMember(true)}
            className="h-9 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowAddMember(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isChatCreator && (
                <DropdownMenuItem 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium mb-2">No messages yet</h3>
                <p className="text-gray-500 text-sm">Start the conversation by sending a message!</p>
              </div>
            ) : (
              messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <footer className="p-6 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3" noValidate>
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('teamChat.messagePlaceholder')}
            className="flex-1 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 transition-colors"
            disabled={isSending}
          />
          <Button 
            type="submit"
            disabled={isSending || !newMessage.trim()}
            size="sm"
            className="h-12 px-6 bg-blue-500 hover:bg-blue-600 shadow-sm"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </footer>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Add Member to Chat
            </DialogTitle>
            <DialogDescription>
              Select a user to add to "{chat.name}". They will be able to see and send messages in this conversation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {getInitials(user.name)}
                        </div>
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {availableUsers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">All users are already members of this chat</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember} 
              disabled={!selectedUser || availableUsers.length === 0}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Chat
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chat.name}"? This action cannot be undone. 
              All messages and member associations will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChat}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatWindow;