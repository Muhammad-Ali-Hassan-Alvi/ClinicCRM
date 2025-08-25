import { supabase } from './supabaseClient';

class ChatService {
  cleanup() {
    // This is a good safety net to clean up all connections on logout.
    supabase.removeAllChannels();
  }

  // Get user's chat list - Logic is fine, can be slightly optimized.
  async getUserChats(userId) {
    try {
      const { data: chatMemberships, error: membershipError } = await supabase
        .from('chat_members')
        .select(`chats(*, profiles!chats_created_by_fkey(*))`)
        .eq('user_id', userId);
      if (membershipError) throw membershipError;

      const chats = chatMemberships.map(m => m.chats).filter(Boolean);
      return { data: chats, error: null };
    } catch (error) {
      console.error('Error fetching user chats:', error);
      return { data: null, error };
    }
  }

  // Get messages for a specific chat - Logic is fine.
  async getChatMessages(chatId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`*, profiles!messages_user_id_fkey(*)`)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return { data: null, error };
    }
  }

  // Send a message - Logic is fine.
  async sendMessage(chatId, userId, content) {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({ chat_id: chatId, user_id: userId, content: content.trim() });
      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
  }

  // Create a new chat
  async createChat(name, description, createdBy, memberIds = []) {
    try {
      // Start a transaction
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          description,
          created_by: createdBy
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members to the chat
      const memberPromises = memberIds.map(userId =>
        supabase
          .from('chat_members')
          .insert({
            chat_id: chat.id,
            user_id: userId
          })
      );

      // Always add the creator as a member
      memberPromises.push(
        supabase
          .from('chat_members')
          .insert({
            chat_id: chat.id,
            user_id: createdBy
          })
      );

      await Promise.all(memberPromises);

      return { data: chat, error: null };
    } catch (error) {
      console.error('Error creating chat:', error);
      return { data: null, error };
    }
  }

  // Add member to chat
  async addMemberToChat(chatId, userId) {
    try {
      const { data, error } = await supabase
        .from('chat_members')
        .insert({
          chat_id: chatId,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding member to chat:', error);
      return { data: null, error };
    }
  }

  // Remove member from chat
  async removeMemberFromChat(chatId, userId) {
    try {
      const { error } = await supabase
        .from('chat_members')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error removing member from chat:', error);
      return { data: null, error };
    }
  }

  // Get chat members
  async getChatMembers(chatId) {
    try {
      const { data, error } = await supabase
        .from('chat_members')
        .select(`
          user_id,
          joined_at,
          profiles!chat_members_user_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching chat members:', error);
      return { data: null, error };
    }
  }

  // Get all users (for adding to chats)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: null, error };
    }
  }

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  }

  // Delete chat (only by creator)
  async deleteChat(chatId, userId) {
    try {
      // Verify user is the creator
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('created_by')
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;
      if (chat.created_by !== userId) {
        throw new Error('Only chat creator can delete the chat');
      }

      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting chat:', error);
      return { data: null, error };
    }
  }
}

// Create singleton instance
export const chatService = new ChatService();
