// Test script to verify media handling
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001/';

console.log('🔍 Testing media handling...');

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
});

// Test health endpoint
async function testHealth() {
  try {
    const response = await fetch(`${SOCKET_URL}health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Test media endpoint
async function testMediaEndpoint() {
  try {
    const response = await fetch(`${SOCKET_URL}media-test`);
    const data = await response.json();
    console.log('✅ Media test:', data);
  } catch (error) {
    console.error('❌ Media test failed:', error.message);
  }
}

// Test socket connection and media handling
socket.on('connect', () => {
  console.log('✅ Socket connected!');
  testHealth();
  testMediaEndpoint();
  
  // Test getting chats to see if media is included
  socket.emit('get-chats');
});

socket.on('chats', (chats) => {
  console.log(`📱 Received ${chats.length} chats`);
  
  // If we have chats, test getting messages from the first chat
  if (chats.length > 0) {
    console.log(`🔍 Testing messages from chat: ${chats[0].name}`);
    socket.emit('get-chat-messages', chats[0].id);
  }
});

socket.on('chat-messages', ({ chatId, messages }) => {
  console.log(`💬 Received ${messages.length} messages from chat ${chatId}`);
  
  // Check for media messages
  const mediaMessages = messages.filter(msg => msg.hasMedia || msg.media);
  console.log(`📷 Found ${mediaMessages.length} media messages`);
  
  mediaMessages.forEach((msg, index) => {
    console.log(`📷 Media message ${index + 1}:`, {
      id: msg.id,
      type: msg.type,
      hasMedia: msg.hasMedia,
      mediaData: msg.media ? 'Present' : 'Missing',
      body: msg.body?.substring(0, 50) + '...'
    });
  });
  
  // Disconnect after testing
  setTimeout(() => {
    console.log('🧹 Test completed, disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout');
  process.exit(1);
}, 10000);
