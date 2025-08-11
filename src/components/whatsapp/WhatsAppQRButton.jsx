// Create a new file: components/WhatsAppQRButton.jsx

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Phone, MessageSquare } from 'lucide-react';

// This component will take the business phone number and a contact to start a chat with.
export const WhatsAppQRButton = ({ businessPhoneNumber, contact }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Example pre-filled message. You can customize this.
  const initialMessage = `Hello ${contact.fullName}, this is about our conversation.`;
  const encodedMessage = encodeURIComponent(initialMessage);

  // Construct the official 'wa.me' link
  const waLink = `https://wa.me/${businessPhoneNumber}?text=${encodedMessage}`;

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
        <MessageSquare className="w-4 h-4 mr-2" />
        Start Chat on WhatsApp
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat with {contact.fullName} on WhatsApp</DialogTitle>
            <DialogDescription>
              Scan the QR code with your phone's camera or click the link below to open WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="p-4 bg-white rounded-lg border shadow-sm">
              <QRCode
                value={waLink}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>
            
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700">
                <Phone className="w-4 h-4 mr-2" />
                Open WhatsApp
              </Button>
            </a>
            
            <p className="text-sm text-gray-500 text-center">
              This will open WhatsApp on your device and pre-fill a message to {contact.fullName}.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};