// Test script to debug authentication stuck issue
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001/';

console.log('🔍 Testing authentication stuck issue...');

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
});

let authTimeout = null;

// Socket event handlers
socket.on('connect', () => {
  console.log('✅ Socket connected!');
  console.log('📡 Requesting initial status...');
  socket.emit('request-initial-status');
});

socket.on('initial-status', (status) => {
  console.log('📊 Initial status:', status);
  if (status.ready) {
    console.log('✅ Client is already ready!');
    process.exit(0);
  } else if (status.qr) {
    console.log('📱 QR code available, starting session...');
    socket.emit('start-session');
  } else {
    console.log('❌ No QR available, starting session...');
    socket.emit('start-session');
  }
});

socket.on('status', (status) => {
  console.log('📊 Status update:', status);
  
  if (status === 'authenticated') {
    console.log('🔐 Authentication successful, waiting for ready state...');
    
    // Set a timeout to detect if stuck at authenticated
    authTimeout = setTimeout(() => {
      console.log('⏰ Stuck at authenticated for 30+ seconds!');
      console.log('🔄 Attempting retry...');
      socket.emit('retry-authentication');
    }, 35000); // 35 seconds to be safe
  }
  
  if (status === 'ready') {
    console.log('✅ Client is ready!');
    if (authTimeout) {
      clearTimeout(authTimeout);
    }
    setTimeout(() => {
      console.log('🎯 Test completed successfully!');
      socket.disconnect();
      process.exit(0);
    }, 2000);
  }
  
  if (status === 'auth_timeout') {
    console.log('⏰ Authentication timeout detected by backend');
    console.log('🔄 Backend is attempting to reinitialize...');
  }
  
  if (status === 'auth_failure') {
    console.log('❌ Authentication failed');
    process.exit(1);
  }
});

socket.on('qr', (qrDataUrl) => {
  console.log('📱 QR Code received!');
  console.log('QR Data URL length:', qrDataUrl.length);
  console.log('Please scan the QR code with your mobile app...');
});

socket.on('retry-authentication-success', (data) => {
  console.log('✅ Retry authentication initiated:', data.message);
});

socket.on('retry-authentication-error', (data) => {
  console.error('❌ Retry authentication failed:', data.error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  process.exit(1);
});

// Overall timeout
setTimeout(() => {
  console.log('⏰ Overall test timeout (60 seconds)');
  if (authTimeout) {
    clearTimeout(authTimeout);
  }
  process.exit(1);
}, 60000);
