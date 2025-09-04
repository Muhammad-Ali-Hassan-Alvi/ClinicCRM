// src/lib/socket.js
import { io } from 'socket.io-client';
// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://webappmernclinixbackend-production.up.railway.app/';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001/';
const socket = io(SOCKET_URL, { 
  autoConnect: true, 
  transports: ['websocket', 'polling'], // Add polling as fallback
  timeout: 20000, // Increase timeout
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});
export default socket;

