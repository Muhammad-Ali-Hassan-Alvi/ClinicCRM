import { supabase } from '@/lib/supabaseClient';

const toSnakeCase = (str) => {
  if (!str) return str;
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const keysToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToSnakeCase(v));
  } else if (obj !== null && obj?.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => {
        const newKey = toSnakeCase(key);
        result[newKey] = keysToSnakeCase(obj[key]);
        return result;
      },
      {}
    );
  }
  return obj;
};

export const createTeamChatActions = ({ performDbAction, toast, t, refreshData, dataState }) => {
  const addTeamChatMessage = async (chatId, message) => {
    try {
      // For now, we'll update the local state since team chat is using mock data
      // In a real implementation, this would save to Supabase
      dataState.setState(prev => ({
        ...prev,
        teamChats: prev.teamChats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message.text,
                lastMessageTime: message.timestamp
              }
            : chat
        )
      }));

      // Simulate API call for future Supabase integration
      const { error } = await supabase
        .from('team_chat_messages')
        .insert({
          chat_id: chatId,
          user_id: message.userId,
          message_text: message.text,
          created_at: message.timestamp
        });

      if (error && !error.message.includes('relation "team_chat_messages" does not exist')) {
        console.error('Failed to save team chat message:', error);
        toast({
          title: "Message Save Failed",
          description: "Message sent but failed to save to database",
          variant: 'destructive'
        });
      }

      return true;
    } catch (error) {
      console.error('Team chat message error:', error);
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: 'destructive'
      });
      return false;
    }
  };

  const createTeamChat = async (chatData) => {
    try {
      const newChat = {
        id: `chat-${Date.now()}`,
        ...chatData,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dataState.setState(prev => ({
        ...prev,
        teamChats: [...prev.teamChats, newChat]
      }));

      toast({
        title: "Chat Created",
        description: `${chatData.type === 'channel' ? 'Channel' : 'Direct message'} created successfully`
      });

      return newChat;
    } catch (error) {
      console.error('Create team chat error:', error);
      toast({
        title: "Chat Creation Failed",
        description: "Failed to create chat. Please try again.",
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateTeamChat = async (chatId, updates) => {
    try {
      dataState.setState(prev => ({
        ...prev,
        teamChats: prev.teamChats.map(chat =>
          chat.id === chatId
            ? { ...chat, ...updates, updatedAt: new Date().toISOString() }
            : chat
        )
      }));

      toast({
        title: "Chat Updated",
        description: "Chat settings updated successfully"
      });

      return true;
    } catch (error) {
      console.error('Update team chat error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update chat. Please try again.",
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteTeamChat = async (chatId) => {
    try {
      dataState.setState(prev => ({
        ...prev,
        teamChats: prev.teamChats.filter(chat => chat.id !== chatId)
      }));

      toast({
        title: "Chat Deleted",
        description: "Chat deleted successfully"
      });

      return true;
    } catch (error) {
      console.error('Delete team chat error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete chat. Please try again.",
        variant: 'destructive'
      });
      return false;
    }
  };

  const markTeamChatAsRead = async (chatId, userId) => {
    try {
      dataState.setState(prev => ({
        ...prev,
        teamChats: prev.teamChats.map(chat =>
          chat.id === chatId
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      }));

      return true;
    } catch (error) {
      console.error('Mark team chat as read error:', error);
      return false;
    }
  };

  return {
    addTeamChatMessage,
    createTeamChat,
    updateTeamChat,
    deleteTeamChat,
    markTeamChatAsRead
  };
};