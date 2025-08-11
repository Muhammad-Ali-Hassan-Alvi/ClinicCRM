import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Download, UserPlus, AlertCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import InstagramChatMessage from '@/components/instagram/InstagramChatMessage';
import NewContactFromInstagramDialog from '@/components/instagram/NewContactFromInstagramDialog';
import { generateInstagramPDF, downloadPDF, getPDFBlob } from '@/lib/pdfExport';
import { useLocale } from '@/contexts/LocaleContext';

const InstagramChatWindow = ({ conversation, instagramAccounts }) => {
  const { addInstagramMessageToConversation, markInstagramConversationAsRead, customers, contacts, updateItem, addContact } = useData();
  const [newMessage, setNewMessage] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(conversation.instagramAccountId || instagramAccounts[0]?.id);
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLocale();
  const messagesEndRef = useRef(null);

  const conversationId = conversation.contactId || conversation.instagramUsername;

  useEffect(() => {
    markInstagramConversationAsRead(conversationId);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, markInstagramConversationAsRead, conversationId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    if (!selectedAccountId) {
      toast({
        title: "No Instagram Account Selected",
        description: "Please select an Instagram account to send messages.",
        variant: "destructive"
      });
      return;
    }

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'user',
      type: 'message',
      instagramAccountId: selectedAccountId,
    };

    addInstagramMessageToConversation(conversationId, message);
    setNewMessage('');
  };

  const handleAttachment = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "Sending attachments isn't available yet—but you can request it! 🚀",
    });
  };

  const handleExportInstagram = async () => {
    const customer = customers.find(c => c.contactId === conversation.contactId) || 
                    contacts.find(c => c.id === conversation.contactId);
    
    if (!customer) {
      toast({
        title: "Cannot Export",
        description: "This conversation is not linked to a customer yet.",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = generateInstagramPDF(customer, conversation);
      const filename = `Instagram_${customer.contactFullName || customer.fullName}_${new Date().toISOString().split('T')[0]}`;
      
      downloadPDF(doc, filename);
      
      const pdfBlob = getPDFBlob(doc);
      const pdfFile = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });
      
      const newAttachment = {
        id: Date.now().toString(),
        name: `${filename}.pdf`,
        size: pdfFile.size,
        type: 'application/pdf',
        url: URL.createObjectURL(pdfFile),
        createdAt: new Date().toISOString(),
        tags: ['Instagram Export', 'Conversation History'],
      };

      const recordType = customers.find(c => c.contactId === conversation.contactId) ? 'customers' : 'contacts';
      const recordId = customer.id;
      
      updateItem(recordType, recordId, { 
        attachments: [...(customer.attachments || []), newAttachment] 
      });

      toast({
        title: "Instagram History Exported! 📄",
        description: "PDF saved to customer's files and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF.",
        variant: "destructive"
      });
    }
  };

  const handleCreateContact = (newContactData) => {
    addContact({ ...newContactData, instagramUsername: conversation.instagramUsername });
    setIsNewContactDialogOpen(false);
  };

  const isUnknownContact = !conversation.contactId;

  return (
    <div className="flex-1 flex flex-col bg-gray-50/50">
      <header className="p-4 border-b border-gray-200/80 bg-white/70 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold mr-3">
              {conversation.contactAvatar}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{conversation.contactName}</h2>
              <p className="text-sm text-gray-500">@{conversation.instagramUsername}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUnknownContact && (
              <Button variant="outline" size="sm" onClick={() => setIsNewContactDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Contact
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportInstagram}
              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              disabled={isUnknownContact}
            >
              <Download className="w-4 h-4 mr-2" />
              {t('whatsapp.exportChat')}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {isUnknownContact && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">This user is not yet a contact. Create a contact to save their history.</p>
          </div>
        )}
        {conversation.messages.map(msg => (
          <InstagramChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>
      
      <footer className="p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200/80 space-y-3">
        {instagramAccounts.length > 1 && (
          <div className="flex items-center gap-2">
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
              className="flex-1"
            >
              {instagramAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.username}
                </option>
              ))}
            </Select>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button type="button" onClick={handleAttachment} className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('whatsapp.messagePlaceholder')}
            className="flex-1 px-4 py-2 rounded-full border bg-gray-100 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            type="submit" 
            disabled={!selectedAccountId}
            className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:from-gray-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
      <NewContactFromInstagramDialog
        isOpen={isNewContactDialogOpen}
        onOpenChange={setIsNewContactDialogOpen}
        onAddContact={handleCreateContact}
        instagramUsername={conversation.instagramUsername}
      />
    </div>
  );
};

export default InstagramChatWindow;