import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Battery, Plug, RefreshCw, Smartphone } from 'lucide-react';
import ConnectionStatusDisplay from './ConnectionStatusDisplay';

const QRCodeStep = ({ 
  formData, 
  connectionStatus, 
  qrCodeUrl, 
  phoneInfo, 
  onClose,
  onRetry 
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  useEffect(() => {
    if (connectionStatus === 'qr_ready' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [connectionStatus, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-semibold text-xl mb-2">Scan QR Code with WhatsApp</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connecting: <strong>{formData.label}</strong>
        </p>
        
        <ConnectionStatusDisplay connectionStatus={connectionStatus} />
        
        {connectionStatus === 'qr_ready' && timeLeft > 0 && (
          <div className="mt-2">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              QR Code expires in {formatTime(timeLeft)}
            </Badge>
          </div>
        )}
      </div>

      {qrCodeUrl ? (
        <div className="flex justify-center">
          <div className="p-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg">
            <img 
              src={qrCodeUrl} 
              alt="WhatsApp QR Code" 
              className="w-64 h-64 rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="p-6 bg-gray-100 rounded-xl border-2 border-gray-200 w-64 h-64 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Generating QR Code...</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">📱 How to Scan:</h4>
        <ol className="text-sm text-blue-700 space-y-2">
          <li><strong>1.</strong> Open WhatsApp on your phone</li>
          <li><strong>2.</strong> Tap the three dots (⋮) in the top right</li>
          <li><strong>3.</strong> Select "Linked Devices"</li>
          <li><strong>4.</strong> Tap "Link a Device"</li>
          <li><strong>5.</strong> Point your camera at this QR code</li>
        </ol>
      </div>

      {phoneInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Phone Connected Successfully!</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Number:</strong> {phoneInfo.phoneNumber}</p>
            {phoneInfo.sessionData?.battery && (
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4" />
                <span>Battery: {phoneInfo.sessionData.battery}%</span>
                {phoneInfo.sessionData.plugged && (
                  <>
                    <Plug className="w-4 h-4 text-green-600" />
                    <span>Charging</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {timeLeft === 0 && connectionStatus === 'qr_ready' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 mb-3">QR Code has expired</p>
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New QR Code
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {connectionStatus === 'qr_ready' && (
          <Button 
            onClick={onRetry} 
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh QR Code
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRCodeStep;