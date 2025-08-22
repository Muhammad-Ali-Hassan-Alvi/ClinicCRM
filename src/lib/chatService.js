import { supabase } from './supabaseClient';

class ChatService {
  constructor() {
    this.subscriptions = new Map();
    this.messageCallbacks = new Map();
    this.chatMemberCallbacks = new Map();
  }

  // Initialize Realtime subscriptions
  async initializeRealtime(userId) {
    if (this.subscriptions.has('messages')) {
      this.subscriptions.get('messages').unsubscribe();
    }
    if (this.subscriptions.has('chat_members')) {
      this.subscriptions.get('chat_members').unsubscribe();
    }

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          this.handleNewMessage(payload.new);
        }
      )
      .subscribe();

    // Subscribe to new chat members
    const chatMembersSubscription = supabase
      .channel('chat_members')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_members' 
        }, 
        (payload) => {
          this.handleNewChatMember(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.set('messages', messagesSubscription);
    this.subscriptions.set('chat_members', chatMembersSubscription);
  }

  // Handle new message from Realtime
  handleNewMessage(message) {
    this.messageCallbacks.forEach((callback) => {
      callback(message);
    });
  }

  // Handle new chat member from Realtime
  handleNewChatMember(chatMember) {
    this.chatMemberCallbacks.forEach((callback) => {
      callback(chatMember);
    });
  }

  // Register callback for new messages
  onNewMessage(callback) {
    const id = Date.now().toString();
    this.messageCallbacks.set(id, callback);
    return () => this.messageCallbacks.delete(id);
  }

  // Register callback for new chat members
  onNewChatMember(callback) {
    const id = Date.now().toString();
    this.chatMemberCallbacks.set(id, callback);
    return () => this.chatMemberCallbacks.delete(id);
  }

  // Cleanup subscriptions
  cleanup() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.messageCallbacks.clear();
    this.chatMemberCallbacks.clear();
  }

  // Get user's chat list
  async getUserChats(userId) {
    try {
      const { data: chatMemberships, error: membershipError } = await supabase
        .from('chat_members')
        .select(`
          chat_id,
          chats (
            id,
            name,
            description,
            created_at,
            updated_at,
            created_by,
            profiles!chats_created_by_fkey (
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (membershipError) throw membershipError;

      // Get the latest message for each chat
      const chatsWithLatestMessage = await Promise.all(
        chatMemberships.map(async (membership) => {
          const { data: latestMessage } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              user_id,
              profiles!messages_user_id_fkey (
                id,
                name,
                avatar_url
              )
            `)
            .eq('chat_id', membership.chats.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...membership.chats,
            latestMessage: latestMessage || null
          };
        })
      );

      return { data: chatsWithLatestMessage, error: null };
    } catch (error) {
      console.error('Error fetching user chats:', error);
      return { data: null, error };
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!messages_user_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return { data: null, error };
    }
  }

  // Send a message
  async sendMessage(chatId, userId, content) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!messages_user_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
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
