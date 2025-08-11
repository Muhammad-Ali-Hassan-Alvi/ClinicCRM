import React from 'react';
import { AlertTriangle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatWindowAlerts = ({ 
  isUnknownContact, 
  isConnected, 
  setIsAddByPhoneOpen, 
  setCreateContactOpen, 
  t 
}) => {
  if (isUnknownContact) {
    return (
      <div className="bg-yellow-100 border-b border-yellow-200 p-3 text-center text-sm text-yellow-800 flex items-center justify-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <span>{t('whatsapp.unknownContact')}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-white" onClick={() => setIsAddByPhoneOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add by Phone
          </Button>
          <Button size="sm" variant="outline" className="bg-white" onClick={() => setCreateContactOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('contactManagement.newContact')}
          </Button>
        </div>
      </div>
    );
  }

  if (!isConnected && !isUnknownContact) {
    return (
      <div className="bg-red-100 border-b border-red-200 p-3 text-center text-sm text-red-800 flex items-center justify-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <span>WhatsApp number is disconnected. Messages will be saved as notes only.</span>
      </div>
    );
  }

  return null;
};

export default ChatWindowAlerts;