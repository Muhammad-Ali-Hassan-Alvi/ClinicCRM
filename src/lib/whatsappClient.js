import { supabase } from '@/lib/supabaseClient';

class WhatsAppWebClient {
  constructor() {
    this.isConnected = false;
    this.phoneNumber = null;
    this.sessionData = null;
    this.listeners = {};
    this.qrCode = null;
    this.numberId = null;
    this.sessionId = null;
    this.pollingInterval = null;
    this.messagePollingInterval = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.connectionTimeout = null;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  async initialize(numberId) {
    try {
      this.numberId = numberId;
      this.retryCount = 0;
      this.emit('status', 'initializing');
      
      // Set connection timeout (10 minutes)
      this.connectionTimeout = setTimeout(() => {
        this.emit('error', new Error('Connection timeout - please try again'));
        this.cleanup();
      }, 10 * 60 * 1000);
      
      // Initialize WhatsApp Web connection through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('whatsapp-initialize', {
        body: JSON.stringify({ numberId })
      });

      if (error) {
        console.error('Initialize error:', error);
        this.clearConnectionTimeout();
        throw new Error(error.message || 'Failed to initialize WhatsApp session');
      }

      if (!data || !data.sessionId) {
        this.clearConnectionTimeout();
        throw new Error('Invalid response from initialization');
      }

      this.sessionId = data.sessionId;
      console.log('WhatsApp session initialized:', this.sessionId);
      
      // Start polling for status updates
      this.startPolling();
      
      return true;
    } catch (error) {
      console.error('WhatsApp initialization error:', error);
      this.clearConnectionTimeout();
      this.emit('error', error);
      return false;
    }
  }

  clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  async startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    let pollCount = 0;
    const maxPolls = 300; // 10 minutes at 2-second intervals

    this.pollingInterval = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        clearInterval(this.pollingInterval);
        this.clearConnectionTimeout();
        this.emit('error', new Error('Connection timeout - no response after 10 minutes'));
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-status', {
          body: JSON.stringify({ sessionId: this.sessionId })
        });

        if (error) {
          console.error('Status polling error:', error);
          
          // Handle specific error cases
          if (error.message && (error.message.includes('Session not found') || error.message.includes('Session expired'))) {
            clearInterval(this.pollingInterval);
            this.clearConnectionTimeout();
            this.emit('error', new Error('Session expired or not found. Please try connecting again.'));
            return;
          }
          
          // Increment retry count for other errors
          this.retryCount++;
          if (this.retryCount >= this.maxRetries) {
            clearInterval(this.pollingInterval);
            this.clearConnectionTimeout();
            this.emit('error', new Error('Too many connection errors. Please try again.'));
            return;
          }
          
          // Continue polling for temporary errors
          return;
        }

        // Reset retry count on successful response
        this.retryCount = 0;

        if (!data) {
          console.warn('No data received from status check');
          return;
        }

        // Handle session expiration
        if (data.expired) {
          clearInterval(this.pollingInterval);
          this.clearConnectionTimeout();
          this.emit('error', new Error('Session expired. Please generate a new QR code.'));
          return;
        }

        // Handle QR code
        if (data.qr && data.qr !== this.qrCode) {
          this.qrCode = data.qr;
          this.emit('qr', data.qr);
          this.emit('status', 'qr_ready');
          console.log('QR code received');
        }

        // Handle authentication
        if (data.authenticated && !this.isConnected) {
          this.isConnected = true;
          this.phoneNumber = data.phoneNumber;
          this.sessionData = data.sessionData;
          
          console.log('WhatsApp authenticated:', this.phoneNumber);
          
          this.emit('authenticated', {
            phoneNumber: this.phoneNumber,
            sessionData: this.sessionData
          });
          
          this.emit('status', 'ready');
          this.emit('ready');
          
          clearInterval(this.pollingInterval);
          this.clearConnectionTimeout();
          this.startMessagePolling();
        }

        // Handle disconnection
        if (data.disconnected) {
          this.isConnected = false;
          this.emit('disconnected');
          clearInterval(this.pollingInterval);
          this.clearConnectionTimeout();
        }

      } catch (error) {
        console.error('Status polling error:', error);
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
          clearInterval(this.pollingInterval);
          this.clearConnectionTimeout();
          this.emit('error', new Error('Connection failed after multiple attempts. Please try again.'));
        }
      }
    }, 2000);
  }

  async startMessagePolling() {
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }

    this.messagePollingInterval = setInterval(async () => {
      if (!this.isConnected || !this.sessionId) return;

      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-messages', {
          body: JSON.stringify({ sessionId: this.sessionId })
        });

        if (error) {
          console.error('Message polling error:', error);
          
          if (error.message && (error.message.includes('Session not found') || error.message.includes('Session not authenticated'))) {
            this.isConnected = false;
            this.emit('disconnected');
            clearInterval(this.messagePollingInterval);
          }
          return;
        }

        if (data && data.messages && data.messages.length > 0) {
          data.messages.forEach(message => {
            this.emit('message', message);
          });
        }

        if (data && data.battery !== undefined) {
          this.emit('heartbeat', {
            timestamp: Date.now(),
            battery: data.battery,
            plugged: data.plugged
          });
        }

      } catch (error) {
        console.error('Message polling error:', error);
        if (error.message && error.message.includes('Session not authenticated')) {
          this.isConnected = false;
          this.emit('disconnected');
          clearInterval(this.messagePollingInterval);
        }
      }
    }, 5000); // Poll every 5 seconds for messages
  }

  async sendMessage(to, message) {
    if (!this.isConnected || !this.sessionId) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: JSON.stringify({ 
          sessionId: this.sessionId,
          to,
          message 
        })
      });

      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }

      this.emit('message_sent', {
        id: data.messageId,
        to,
        body: message,
        timestamp: Date.now(),
        status: 'sent'
      });

      return data.messageId;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.sessionId) {
        await supabase.functions.invoke('whatsapp-disconnect', {
          body: JSON.stringify({ sessionId: this.sessionId })
        });
      }
      
      this.cleanup();
      this.emit('disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      this.cleanup();
    }
  }

  cleanup() {
    this.isConnected = false;
    this.phoneNumber = null;
    this.sessionData = null;
    this.qrCode = null;
    this.sessionId = null;
    this.retryCount = 0;
    
    this.clearConnectionTimeout();
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
      this.messagePollingInterval = null;
    }
  }

  destroy() {
    this.disconnect();
    this.listeners = {};
  }
}

export default WhatsAppWebClient;