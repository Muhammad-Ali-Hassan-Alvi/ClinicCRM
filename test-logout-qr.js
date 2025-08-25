// Test script to verify logout and QR generation
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001/';

console.log('🔍 Testing logout and QR generation...');

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
});

let testStep = 0;

// Test steps
const testSteps = [
  {
    name: 'Connect and check status',
    action: () => {
      console.log('📡 Step 1: Checking current status...');
      socket.emit('request-initial-status');
    }
  },
  {
    name: 'Force reset if needed',
    action: () => {
      console.log('🔄 Step 2: Force resetting client state...');
      socket.emit('force-reset');
    }
  },
  {
    name: 'Start new session',
    action: () => {
      console.log('🚀 Step 3: Starting new session...');
      socket.emit('start-session');
    }
  },
  {
    name: 'Wait for QR',
    action: () => {
      console.log('⏳ Step 4: Waiting for QR code...');
      // This step just waits for the QR event
    }
  }
];

// Socket event handlers
socket.on('connect', () => {
  console.log('✅ Socket connected!');
  runNextTest();
});

socket.on('initial-status', (status) => {
  console.log('📊 Initial status:', status);
  if (status.ready) {
    console.log('✅ Client is ready, proceeding to force reset...');
    runNextTest();
  } else {
    console.log('❌ Client not ready, proceeding to force reset...');
    runNextTest();
  }
});

socket.on('force-reset-success', (data) => {
  console.log('✅ Force reset successful:', data.message);
  runNextTest();
});

socket.on('force-reset-error', (data) => {
  console.error('❌ Force reset failed:', data.error);
  process.exit(1);
});

socket.on('status', (status) => {
  console.log('📊 Status update:', status);
  if (status === 'qr_received') {
    console.log('✅ QR code received successfully!');
    console.log('🎯 Test completed successfully!');
    setTimeout(() => {
      socket.disconnect();
      process.exit(0);
    }, 2000);
  }
});

socket.on('qr', (qrDataUrl) => {
  console.log('📱 QR Code received!');
  console.log('QR Data URL length:', qrDataUrl.length);
  console.log('QR starts with:', qrDataUrl.substring(0, 50) + '...');
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  process.exit(1);
});

function runNextTest() {
  if (testStep < testSteps.length) {
    const step = testSteps[testStep];
    console.log(`\n🔄 Running: ${step.name}`);
    step.action();
    testStep++;
  }
}

// Timeout after 30 seconds
setTimeout(() => {
  console.log('⏰ Test timeout');
  process.exit(1);
}, 30000);
