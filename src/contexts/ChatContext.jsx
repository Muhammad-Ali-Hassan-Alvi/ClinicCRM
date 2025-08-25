import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { chatService } from "@/lib/chatService";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient"; // Import supabase client directly

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMembers, setChatMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const isInitialized = useRef(false);

  // --- FIX: Master initialization effect for user session ---
  useEffect(() => {
    const userId = user?.id;
    if (userId && !isInitialized.current) {
      isInitialized.current = true;
      initializeChatData(userId);

      // Listens for when this user is added to a NEW chat.
      const userChannel = supabase
        .channel(`user-notifications:${userId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_members', 
          filter: `user_id=eq.${userId}` 
        }, 
          () => { fetchUserChats(userId); }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(userChannel);
        isInitialized.current = false;
      };
    } 
    else if (!userId) {
      // Cleanup on logout
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setChatMembers([]);
      isInitialized.current = false;
    }
  }, [user?.id]);

  // --- FIX: Dedicated effect for listening to messages in the active chat room ---
  useEffect(() => {
    let messageChannel;

    if (currentChat?.id) {
      // Create a specific channel for the active chat room.
      messageChannel = supabase.channel(`chat-room:${currentChat.id}`);
      messageChannel
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `chat_id=eq.${currentChat.id}` 
        }, 
          async (payload) => {
            // Fetch the profile data for the new message to display the sender's name/avatar.
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.user_id)
              .single();

            const messageWithProfile = { ...payload.new, profiles: profile || {} };

            setMessages((prev) => [...prev, messageWithProfile]);
          }
        )
        .subscribe();
    }
    
    // This cleanup function is crucial. It runs when the user switches chats (currentChat.id changes).
    return () => {
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
      }
    };
  }, [currentChat?.id]);

  const initializeChatData = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      await fetchUserChats(userId);
      await fetchAllUsers();
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast({
        title: "Chat Error",
        description: "Failed to initialize chat. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChats = useCallback(async (userId) => {
    try {
      const { data, error } = await chatService.getUserChats(userId);
      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error("Error fetching user chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chats.",
        variant: "destructive",
      });
    }
  }, []);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await chatService.getAllUsers();
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const selectChat = useCallback(async (chatId) => {
    try {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat || currentChat?.id === chatId) return;

      setCurrentChat(chat);
      setMessages([]);

      const { data: messagesData, error: messagesError } =
        await chatService.getChatMessages(chatId);
      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      const { data: members, error: membersError } =
        await chatService.getChatMembers(chatId);
      if (membersError) throw membersError;
      setChatMembers(members || []);
    } catch (error) {
      console.error("Error selecting chat:", error);
      toast({
        title: "Error",
        description: "Failed to load chat messages.",
        variant: "destructive",
      });
    }
  }, [chats, currentChat?.id]);

  const sendMessage = useCallback(async (content) => {
    if (!currentChat || !user?.id || !content.trim()) {
      return { success: false, error: "Invalid parameters" };
    }
    try {
      const { error } = await chatService.sendMessage(
        currentChat.id,
        user.id,
        content
      );
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [currentChat, user?.id]);

  const createChat = useCallback(async (name, description, memberIds = []) => {
    if (!user?.id) return { success: false, error: "User not authenticated" };
    try {
      const { data, error } = await chatService.createChat(
        name,
        description,
        user.id,
        memberIds
      );
      if (error) throw error;
      await fetchUserChats(user.id);
      toast({ title: "Success", description: "Chat created successfully." });
      return { success: true, chat: data };
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create chat.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [user?.id, fetchUserChats]);

  const addMemberToChat = useCallback(async (chatId, userId) => {
    try {
      const { error } = await chatService.addMemberToChat(chatId, userId);
      if (error) throw error;
      if (currentChat?.id === chatId) {
        const { data: members } = await chatService.getChatMembers(chatId);
        setChatMembers(members || []);
      }
      toast({ title: "Success", description: "Member added to chat." });
      return { success: true };
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: "Failed to add member.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [currentChat?.id]);

  const removeMemberFromChat = useCallback(async (chatId, userId) => {
    try {
      const { error } = await chatService.removeMemberFromChat(
        chatId,
        userId
      );
      if (error) throw error;

      // Refresh chat members
      if (currentChat?.id === chatId) {
        const { data: members } = await chatService.getChatMembers(chatId);
        setChatMembers(members || []);
      }

      // If user removed themselves, refresh chat list
      if (userId === user?.id) {
        await fetchUserChats(user.id);
        setCurrentChat(null);
        setMessages([]);
      }

      toast({
        title: "Success",
        description: "Member removed from chat.",
      });

      return { success: true };
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [currentChat?.id, user?.id, fetchUserChats]);

  const deleteChat = useCallback(async (chatId) => {
    if (!user?.id) return { success: false, error: "User not authenticated" };
    try {
      const { error } = await chatService.deleteChat(chatId, user.id);
      if (error) throw error;
      await fetchUserChats(user.id);
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
        setChatMembers([]);
      }
      toast({ title: "Success", description: "Chat deleted successfully." });
      return { success: true };
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [user?.id, currentChat?.id, fetchUserChats]);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return;

    try {
      const { data, error } = await chatService.updateProfile(
        user.id,
        updates
      );
      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      return { success: true, profile: data };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
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

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
