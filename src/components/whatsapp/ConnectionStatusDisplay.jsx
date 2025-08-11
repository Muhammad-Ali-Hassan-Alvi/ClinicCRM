import React from 'react';
import { CheckCircle, AlertCircle, Wifi, WifiOff, QrCode, RefreshCw } from 'lucide-react';

const ConnectionStatusDisplay = ({ connectionStatus }) => {
  const statusConfig = {
    initializing: { 
      text: 'Initializing WhatsApp Web...', 
      color: 'text-blue-600', 
      icon: RefreshCw,
      animate: true 
    },
    qr_ready: { 
      text: 'QR Code Ready - Scan with your phone', 
      color: 'text-green-600', 
      icon: QrCode,
      animate: false 
    },
    authenticated: { 
      text: 'Phone authenticated successfully!', 
      color: 'text-green-600', 
      icon: CheckCircle,
      animate: false 
    },
    ready: { 
      text: 'Connected & Ready to use', 
      color: 'text-green-600', 
      icon: CheckCircle,
      animate: false 
    },
    disconnected: { 
      text: 'Disconnected from WhatsApp', 
      color: 'text-red-600', 
      icon: WifiOff,
      animate: false 
    }
  };
  
  const config = statusConfig[connectionStatus] || statusConfig.initializing;
  const IconComponent = config.icon;
  
  return (
    <div className={`flex items-center justify-center gap-2 ${config.color} p-3 bg-gray-50 rounded-lg`}>
      <IconComponent className={`w-5 h-5 ${config.animate ? 'animate-spin' : ''}`} />
      <span className="font-medium">{config.text}</span>
    </div>
  );
};

export default ConnectionStatusDisplay;