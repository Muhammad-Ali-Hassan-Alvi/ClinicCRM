import { supabase } from '@/lib/supabaseClient';
import { getAnswerFromKB } from '@/lib/ai';

class WhatsAppWebClient {
  constructor() {
    this.isConnected = false;
    this.sessionId = null;
    this.messageCredits = 100; // Starting credits
    this.conversations = new Map();
    this.eventListeners = new Map();
  }

  async initialize() {
    try {
      // Simulate WhatsApp Web initialization
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Simulate connection process
      setTimeout(() => {
        this.emit('qr', `whatsapp_qr_${Date.now()}`);
      }, 1000);

      return { success: true, sessionId: this.sessionId };
    } catch (error) {
      console.error('WhatsApp initialization error:', error);
      throw error;
    }
  }

  async getStatus() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return {
      status: this.isConnected ? 'authenticated' : 'connecting',
      sessionId: this.sessionId
    };
  }

  async sendMessage(phoneNumber, message, knowledgeBase = []) {
    if (!this.isConnected) {
      throw new Error('WhatsApp not connected');
    }

    // Check credits before sending
    if (this.messageCredits <= 0) {
      throw new Error('Insufficient message credits. Please contact support to add more credits.');
    }

    try {
      // Simulate message sending delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Simulate potential failure (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Message delivery failed due to network issues');
      }

      // Only deduct credit after successful delivery
      this.messageCredits -= 1;
      console.log(`Message sent successfully. Credits remaining: ${this.messageCredits}`);
      
      // Store message in conversation
      this.addMessageToConversation(phoneNumber, {
        id: Date.now().toString(),
        text: message,
        timestamp: new Date().toISOString(),
        isFromMe: true,
        status: 'sent'
      });

      // Generate AI response if enabled
      if (knowledgeBase && knowledgeBase.length > 0) {
        setTimeout(async () => {
          try {
            const aiResponse = await getAnswerFromKB(message, knowledgeBase);
            if (aiResponse && aiResponse !== message) {
              // Simulate AI response
              this.addMessageToConversation(phoneNumber, {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                timestamp: new Date().toISOString(),
                isFromMe: false,
                status: 'received',
                isAI: true
              });
              
              // Trigger message received event
              this.emit('message', {
                phoneNumber,
                message: {
                  text: aiResponse,
                  isFromMe: false,
                  isAI: true
                }
              });
            }
          } catch (aiError) {
            console.warn('AI response generation failed:', aiError);
          }
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      }

      return { success: true, creditsRemaining: this.messageCredits };
    } catch (error) {
      console.error('Send message error:', error);
      // Don't deduct credits on failure
      throw error;
    }
  }

  async getConversations() {
    if (!this.isConnected) {
      return [];
    }

    // Return mock conversations or stored conversations
    return Array.from(this.conversations.values());
  }

  async getMessages(phoneNumber) {
    if (!this.isConnected) {
      return [];
    }

    const conversation = this.conversations.get(phoneNumber);
    return conversation ? conversation.messages : [];
  }

  addMessageToConversation(phoneNumber, message) {
    if (!this.conversations.has(phoneNumber)) {
      this.conversations.set(phoneNumber, {
        phoneNumber,
        contactName: phoneNumber,
        lastMessage: message.text,
        lastMessageTime: message.timestamp,
        unreadCount: message.isFromMe ? 0 : 1,
        messages: []
      });
    }

    const conversation = this.conversations.get(phoneNumber);
    conversation.messages.push(message);
    conversation.lastMessage = message.text;
    conversation.lastMessageTime = message.timestamp;
    
    if (!message.isFromMe) {
      conversation.unreadCount += 1;
    }
  }

  // Simulate authentication success
  simulateAuthentication(phoneNumber = '+1234567890') {
    this.isConnected = true;
    this.emit('authenticated', {
      phoneNumber,
      sessionData: { authenticated: true }
    });
    
    setTimeout(() => {
      this.emit('ready');
    }, 1000);
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  async disconnect() {
    try {
      this.isConnected = false;
      this.sessionId = null;
      this.conversations.clear();
      this.eventListeners.clear();
      this.emit('disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  destroy() {
    this.disconnect();
  }

  getCreditsRemaining() {
    return this.messageCredits;
  }

  addCredits(amount) {
    this.messageCredits += amount;
    console.log(`${amount} credits added. Total credits: ${this.messageCredits}`);
  }
}

export default WhatsAppWebClient;