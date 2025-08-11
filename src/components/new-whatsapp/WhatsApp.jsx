// src/components/WhatsApp.jsx

import React, { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import socket from '../../lib/whatsappSocket';
import WhatsappContainer from './WhatsappContainer';
import InitialScreen from './InitialScreen';
import QRModal from './QRModal';

export default function WhatsApp() {
  const [status, setStatus] = useState('initializing'); // initializing | qr_received | ready | disconnected
  const [qr, setQr] = useState(null);
  const [chats, setChats] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true); // Add a general loading state for initial connection

  // Using a ref to prevent state updates on unmounted component
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // This function handles the response from our new handshake
    const handleInitialStatus = (payload) => {
      if (!mounted.current) return;

      if (payload.ready) {
        setStatus('ready');
        setConnected(true);
        setChats(payload.chats || []);
        toast.success('WhatsApp reconnected!');
      } else if (payload.qr) {
        setStatus('qr_received');
        setQr(payload.qr);
        setConnected(false);
      } else {
        setStatus('initializing');
        setConnected(false);
      }
      setLoading(false); // We have our initial status, stop loading
    };

    const onReady = () => {
      if (!mounted.current) return;
      setConnected(true);
      setStatus('ready');
      setQr(null);
      toast.success('WhatsApp is ready!');
      // Ask for chats since we are now ready
      socket.emit('get-chats');
    };

    const onQr = (dataUrl) => {
      if (!mounted.current) return;
      setStatus('qr_received');
      setQr(dataUrl);
      setConnected(false);
      toast('QR code received, please scan.', { icon: '📱' });
    };

    const onChats = (chatList) => {
      if (!mounted.current) return;
      setChats(chatList || []);
    };
    
    const onDisconnect = (reason) => {
        if (!mounted.current) return;
        setStatus('disconnected');
        setConnected(false);
        setQr(null);
        toast.error(`Disconnected: ${reason}`);
    };

    const onError = (msg) => {
        if (!mounted.current) return;
        toast.error(msg || 'An error occurred');
    };

    // --- The new, robust connection logic ---
    const onConnect = () => {
      console.log('Socket connected! Requesting initial status.');
      setLoading(true);
      // Explicitly ask the server for its state upon connecting
      socket.emit('request-initial-status');
    };

    // Register listeners
    socket.on('connect', onConnect);
    socket.on('initial-status', handleInitialStatus); // Our new handshake event
    socket.on('qr', onQr);
    socket.on('ready', onReady);
    socket.on('chats', onChats);
    socket.on('updateChats', onChats); // Can use the same handler
    socket.on('disconnect', onDisconnect);
    socket.on('error-message', onError);

    // If socket is already connected, trigger the handshake manually
    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      // Cleanup
      socket.off('connect', onConnect);
      socket.off('initial-status', handleInitialStatus);
      socket.off('qr', onQr);
      socket.off('ready', onReady);
      socket.off('chats', onChats);
      socket.off('updateChats', onChats);
      socket.off('disconnect', onDisconnect);
      socket.off('error-message', onError);
    };
  }, []);

  const openConnect = () => {
    setStatus('qr_loading'); // A state to show the modal with a loader
    socket.emit('start-session');
  };

  const handleLogout = () => {
    socket.emit('logout');
    setConnected(false);
    setQr(null);
    setChats([]);
    setStatus('initializing');
    toast.success('Logged out successfully.');
  };

  if (loading && !connected) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <p>Connecting to server...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-gray-100 font-sans text-gray-900">
      <Toaster position="top-center" />
      {connected ? (
        <WhatsappContainer chats={chats} onLogout={handleLogout} />
      ) : (
        <div className="max-w-4xl mx-auto py-12 px-4">
          <InitialScreen status={status} onConnect={openConnect} />
        </div>
      )}

      <QRModal
        open={status === 'qr_received' || status === 'qr_loading'}
        qr={qr}
        loading={status === 'qr_loading'}
        onClose={() => setStatus('initializing')}
      />
    </div>
  );
}











// // src/components/WhatsApp.jsx
// import React, { useEffect, useRef, useState } from 'react';
// import { Smartphone, QrCode, Loader2, X, AlertCircle } from 'lucide-react';
// import WhatsappScreen from './WhatsappScreen';
// import socket from '../../lib/whatsappSocket';

// export default function WhatsApp() {
//   const [qrCode, setQrCode] = useState(null);
//   const [status, setStatus] = useState('Connecting to backend...');
//   const [connected, setConnected] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState(null);

//   const mounted = useRef(true);
//   useEffect(() => () => { mounted.current = false; }, []);

//   useEffect(() => {
//     console.log('Setting up socket listeners...');

//     const onConnect = () => {
//       if (!mounted.current) return;
//       console.log('Socket connected to backend');
//       setStatus('Connected to backend');
//       setError(null);
//     };

//     const onDisconnect = () => {
//       if (!mounted.current) return;
//       console.log('Socket disconnected from backend');
//       setStatus('Disconnected from backend');
//       setConnected(false);
//       setQrCode(null);
//     };

//     const onClientStatus = (statusData) => {
//       if (!mounted.current) return;
//       console.log('Client status received:', statusData);
//       if (statusData.ready) {
//         setConnected(true);
//         setShowModal(false);
//         setStatus('✅ WhatsApp ready');
//       } else {
//         setStatus('📱 WhatsApp not connected - click to connect');
//       }
//     };

//     const onQr = (dataUrl) => {
//       if (!mounted.current) return;
//       console.log('QR code received from backend');
//       setQrCode(dataUrl);
//       setLoading(false);
//       setStatus('📱 Scan QR code with WhatsApp');
//       setError(null);
//     };

//     const onAuthenticated = (msg) => {
//       if (!mounted.current) return;
//       console.log('WhatsApp authenticated:', msg);
//       setQrCode(null);
//       setLoading(false);
//       setStatus(msg || '✅ Authenticated - waiting for ready...');
//     };

//     const onReady = () => {
//       if (!mounted.current) return;
//       console.log('WhatsApp client ready');
//       setConnected(true);
//       setShowModal(false);
//       setQrCode(null);
//       setLoading(false);
//       setStatus('✅ WhatsApp ready');
//       setError(null);
//     };

//     const onWhatsAppStatus = (msg) => {
//       if (!mounted.current) return;
//       console.log('WhatsApp status update:', msg);
//       setConnected(false);
//       setQrCode(null);
//       setLoading(false);
//       setStatus(msg || 'Disconnected');
//     };

//     const onError = (msg) => {
//       if (!mounted.current) return;
//       console.error('Error from backend:', msg);
//       setError(msg);
//       setStatus(msg || 'Server error');
//       setLoading(false);
//     };

//     // Register all listeners
//     socket.on('connect', onConnect);
//     socket.on('disconnect', onDisconnect);
//     socket.on('client-status', onClientStatus);
//     socket.on('qr', onQr);
//     socket.on('authenticated', onAuthenticated);
//     socket.on('ready', onReady);
//     socket.on('whatsapp-status', onWhatsAppStatus);
//     socket.on('error-message', onError);

//     // Check if socket is already connected
//     if (socket.connected) {
//       onConnect();
//     }

//     // Cleanup on unmount
//     return () => {
//       socket.off('connect', onConnect);
//       socket.off('disconnect', onDisconnect);
//       socket.off('client-status', onClientStatus);
//       socket.off('qr', onQr);
//       socket.off('authenticated', onAuthenticated);
//       socket.off('ready', onReady);
//       socket.off('whatsapp-status', onWhatsAppStatus);
//       socket.off('error-message', onError);
//     };
//   }, []);

//   const openConnectModal = () => {
//     console.log('Opening connect modal...');
//     setShowModal(true);
//     setLoading(true);
//     setQrCode(null);
//     setError(null);
//     setStatus('🔄 Starting WhatsApp session...');
    
//     // Emit start-session to backend
//     socket.emit('start-session');
    
//     // Set timeout to show error if QR doesn't appear within 5 seconds
//     setTimeout(() => {
//       if (mounted.current && !qrCode && loading && showModal) {
//         setLoading(false);
//         setError('QR code generation timed out. Please try again.');
//         setStatus('Failed to generate QR code');
//       }
//     }, 5000);
//   };

//   const closeModal = () => {
//     console.log('Closing modal...');
//     setShowModal(false);
//     setLoading(false);
//     setError(null);
//   };

//   const handleLogout = () => {
//     console.log('Logging out...');
//     socket.emit('logout');
//     setConnected(false);
//     setQrCode(null);
//     setLoading(false);
//     setShowModal(false);
//     setStatus('🔄 Logging out...');
//   };

//   const retryConnection = () => {
//     setError(null);
//     setLoading(true);
//     setQrCode(null);
//     setStatus('🔄 Retrying...');
//     socket.emit('start-session');
//   };

//   return (
//     <div className="h-screen flex items-center justify-center bg-gray-100">
//       {!connected ? (
//         <div className="text-center space-y-4 max-w-md mx-auto p-6">
//           <Smartphone className="w-16 h-16 mx-auto text-green-500" />
//           <h1 className="text-2xl font-bold text-gray-800">WhatsApp CRM</h1>
//           <p className="text-gray-600">{status}</p>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//               <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//               <span className="text-red-700 text-sm">{error}</span>
//             </div>
//           )}

//           <div className="flex items-center justify-center gap-3">
//             <button
//               onClick={openConnectModal}
//               disabled={loading}
//               className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
//             >
//               {loading ? (
//                 <Loader2 className="w-5 h-5 animate-spin" />
//               ) : (
//                 <QrCode className="w-5 h-5" />
//               )}
//               {loading ? 'Connecting...' : 'Connect WhatsApp'}
//             </button>
//           </div>
//         </div>
//       ) : (
//         <WhatsappScreen onLogout={handleLogout} />
//       )}

//       {/* QR Code Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] relative">
//             <button 
//               onClick={closeModal} 
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
//               <QrCode className="w-6 h-6 text-green-500" /> 
//               Connect WhatsApp
//             </h2>

//             <div className="text-center">
//               {loading && !qrCode && !error ? (
//                 <div className="flex flex-col items-center py-8">
//                   <Loader2 className="animate-spin w-12 h-12 text-green-500 mb-4" />
//                   <p className="text-gray-600">Generating QR code...</p>
//                   <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
//                 </div>
//               ) : error ? (
//                 <div className="py-8">
//                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//                   <p className="text-red-600 mb-4">{error}</p>
//                   <button
//                     onClick={retryConnection}
//                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               ) : qrCode ? (
//                 <div>
//                   <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
//                     <img 
//                       src={qrCode} 
//                       alt="WhatsApp QR Code" 
//                       className="mx-auto w-48 h-48 rounded-lg"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <p className="text-sm font-medium text-gray-700">
//                       Scan with WhatsApp
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Open WhatsApp → Settings → Linked Devices → Link a Device
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="py-8">
//                   <div className="text-gray-500">Waiting for QR code...</div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }