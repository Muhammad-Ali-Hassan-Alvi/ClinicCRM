// src/lib/socket.js
import { io } from 'socket.io-client';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://backend-clinic-production.up.railway.app/';
const socket = io(SOCKET_URL, { autoConnect: true, transports: ['websocket'] });
export default socket;

