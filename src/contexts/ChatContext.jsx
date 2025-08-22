import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from '@/lib/chatService';
import { useToast } from '@/components/ui/use-toast';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatMembers, setChatMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Initialize chat service when user changes
  useEffect(() => {
    if (user?.id) {
      initializeChat();
    } else {
      // Cleanup when user logs out
      chatService.cleanup();
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setChatMembers([]);
    }
  }, [user?.id]);

  const initializeChat = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Initialize Realtime subscriptions
      await chatService.initializeRealtime(user.id);
      
      // Fetch user's chats
      await fetchUserChats();
      
      // Fetch all users for adding to chats
      await fetchAllUsers();
      
      // Set up Realtime listeners
      setupRealtimeListeners();
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Chat Error",
        description: "Failed to initialize chat. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    // Listen for new messages
    const unsubscribeMessages = chatService.onNewMessage((newMessage) => {
      setMessages(prevMessages => {
        // Only add if not already present and belongs to current chat
        if (newMessage.chat_id === currentChat?.id && 
            !prevMessages.find(msg => msg.id === newMessage.id)) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });

      // Update chat list with latest message
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === newMessage.chat_id 
            ? { ...chat, latestMessage: newMessage }
            : chat
        )
      );
    });

    // Listen for new chat members
    const unsubscribeChatMembers = chatService.onNewChatMember((newMember) => {
      if (newMember.user_id === user.id) {
        // User was added to a new chat, refresh chat list
        fetchUserChats();
      }
    });

    // Return cleanup function
    return () => {
      unsubscribeMessages();
      unsubscribeChatMembers();
    };
  };

  const fetchUserChats = async () => {
    try {
      const { data, error } = await chatService.getUserChats(user.id);
      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching user chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats.",
        variant: "destructive"
      });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await chatService.getAllUsers();
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const selectChat = useCallback(async (chatId) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      setCurrentChat(chat);
      setMessages([]); // Clear previous messages
      
      // Fetch messages for the selected chat
      const { data, error } = await chatService.getChatMessages(chatId);
      if (error) throw error;
      
      setMessages(data || []);
      
      // Fetch chat members
      const { data: members, error: membersError } = await chatService.getChatMembers(chatId);
      if (membersError) throw membersError;
      
      setChatMembers(members || []);
      
    } catch (error) {
      console.error('Error selecting chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages.",
        variant: "destructive"
      });
    }
  }, [chats, user?.id]);

  const sendMessage = useCallback(async (content) => {
    if (!currentChat || !user?.id || !content.trim()) return;

    try {
      const { data, error } = await chatService.sendMessage(currentChat.id, user.id, content);
      if (error) throw error;
      
      // Message will be added via Realtime subscription
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [currentChat, user?.id]);

  const createChat = useCallback(async (name, description, memberIds = []) => {
    if (!user?.id) return;

    try {
      const { data, error } = await chatService.createChat(name, description, user.id, memberIds);
      if (error) throw error;
      
      // Refresh chat list
      await fetchUserChats();
      
      toast({
        title: "Success",
        description: "Chat created successfully.",
      });
      
      return { success: true, chat: data };
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [user?.id]);

  const addMemberToChat = useCallback(async (chatId, userId) => {
    try {
      const { error } = await chatService.addMemberToChat(chatId, userId);
      if (error) throw error;
      
      // Refresh chat members
      if (currentChat?.id === chatId) {
        const { data: members } = await chatService.getChatMembers(chatId);
        setChatMembers(members || []);
      }
      
      toast({
        title: "Success",
        description: "Member added to chat.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [currentChat?.id]);

  const removeMemberFromChat = useCallback(async (chatId, userId) => {
    try {
      const { error } = await chatService.removeMemberFromChat(chatId, userId);
      if (error) throw error;
      
      // Refresh chat members
      if (currentChat?.id === chatId) {
        const { data: members } = await chatService.getChatMembers(chatId);
        setChatMembers(members || []);
      }
      
      // If user removed themselves, refresh chat list
      if (userId === user?.id) {
        await fetchUserChats();
        setCurrentChat(null);
        setMessages([]);
      }
      
      toast({
        title: "Success",
        description: "Member removed from chat.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [currentChat?.id, user?.id]);

  const deleteChat = useCallback(async (chatId) => {
    if (!user?.id) return;

    try {
      const { error } = await chatService.deleteChat(chatId, user.id);
      if (error) throw error;
      
      // Refresh chat list
      await fetchUserChats();
      
      // If deleted chat was current chat, clear it
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
        setChatMembers([]);
      }
      
      toast({
        title: "Success",
        description: "Chat deleted successfully.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [user?.id, currentChat?.id]);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return;

    try {
      const { data, error } = await chatService.updateProfile(user.id, updates);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [user?.id]);

  const value = {
    // State
    chats,
    currentChat,
    messages,
    loading,
    chatMembers,
    allUsers,
    
    // Actions
    selectChat,
    sendMessage,
    createChat,
    addMemberToChat,
    removeMemberFromChat,
    deleteChat,
    updateProfile,
    fetchUserChats,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
