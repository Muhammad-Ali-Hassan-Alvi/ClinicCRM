import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const ConnectionSuccessStep = ({ formData, phoneInfo, onClose }) => {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-green-800">Successfully Connected!</h3>
        <p className="text-gray-600 mt-1">
          <strong>{formData.label}</strong> is now ready to use
        </p>
        {phoneInfo && (
          <p className="text-sm text-gray-500 mt-1">
            Number: {phoneInfo.phoneNumber}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
        <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your WhatsApp is now connected and active</li>
          <li>• You can send and receive real messages</li>
          <li>• Messages will sync automatically with your CRM</li>
          <li>• Keep your phone connected to the internet</li>
          <li>• Don't log out of WhatsApp Web on your phone</li>
        </ul>
      </div>

      <Button onClick={onClose} className="w-full">
        Start Using WhatsApp
      </Button>
    </div>
  );
};

export default ConnectionSuccessStep;