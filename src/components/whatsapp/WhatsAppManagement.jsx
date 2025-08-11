import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Smartphone, Settings, Plus, QrCode, Phone } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConversationList from '@/components/whatsapp/ConversationList';
import ChatWindow from '@/components/whatsapp/ChatWindow';
import WhatsAppNumberManager from '@/components/whatsapp/WhatsAppNumberManager';
import WhatsAppConnectionDialog from '@/components/whatsapp/WhatsAppConnectionDialog';
import AddContactByPhoneDialog from '@/components/whatsapp/AddContactByPhoneDialog';
import { useLocale } from '@/contexts/LocaleContext';


const WhatsAppManagement = () => {
  const { conversations, contacts, settings, currentUser } = useData();
  const { contactId } = useParams();
  const navigate = useNavigate();


  // whatsapp web client integration here
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('⏳ Connecting...');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState('all');
  const [showConnectionManager, setShowConnectionManager] = useState(false);
  const [showNumberManager, setShowNumberManager] = useState(false);
  const [showAddByPhoneDialog, setShowAddByPhoneDialog] = useState(false);
  const { t } = useLocale();

  const whatsappNumbers = settings.whatsappNumbers || [];
  const connectedNumbers = whatsappNumbers.filter(n => n.status === 'connected');

  const getAccessibleNumbers = () => {
    if (currentUser?.role === 'Admin') {
      return connectedNumbers;
    }
    
    return connectedNumbers.filter(number => {
      if (!number.assignedUsers || number.assignedUsers.length === 0) return true;
      return number.assignedUsers.includes(currentUser?.id);
    });
  };

  const accessibleNumbers = getAccessibleNumbers();

  const processedConversations = conversations.map(conv => {
    const contact = contacts.find(c => 
      c.id === conv.contactId || 
      c.phoneNumber === conv.contactId || 
      c.secondaryPhoneNumber === conv.contactId
    );
    
    if (contact) {
      return {
        ...conv,
        contactId: contact.id,
        contactName: contact.fullName,
        contactAvatar: contact.fullName ? contact.fullName.substring(0, 2).toUpperCase() : '#',
        isUnknown: false,
      };
    }
    
    return {
      ...conv,
      contactName: conv.contactId,
      contactAvatar: '#',
      isUnknown: true,
    };
  });

  const filteredConversations = processedConversations.filter(conv => {
    if (selectedNumber === 'all') {
      // Show conversations from all accessible numbers
      return accessibleNumbers.some(num => num.id === conv.whatsappNumberId);
    }
    return conv.whatsappNumberId === selectedNumber;
  });

  useEffect(() => {
    if (contactId) {
      const conversation = filteredConversations.find(c => c.contactId === contactId);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        navigate('/whatsapp');
      }
    } else if (filteredConversations.length > 0) {
      const firstConvo = filteredConversations.sort((a, b) => 
        new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp)
      )[0];
      setSelectedConversation(firstConvo);
      if (firstConvo?.contactId) {
        navigate(`/whatsapp/${firstConvo.contactId}`);
      }
    } else {
      setSelectedConversation(null);
    }
  }, [contactId, conversations, contacts, navigate, selectedNumber]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/whatsapp/${conversation.contactId}`);
  };

  const getNumberLabel = (numberId) => {
    const number = connectedNumbers.find(n => n.id === numberId);
    return number ? number.label : 'Unknown Number';
  };

  if (accessibleNumbers.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Smartphone className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No WhatsApp Access</h2>
          <p className="text-gray-500 mb-6">
            {currentUser?.role === 'Admin' 
              ? "You haven't connected any WhatsApp numbers yet. Connect your first number to get started."
              : 'No WhatsApp numbers have been assigned to you. Please contact an administrator.'
            }
          </p>
          {currentUser?.role === 'Admin' && (
            <div className="space-y-3">
              <Button 
                onClick={() => setShowConnectionManager(true)} 
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Connect WhatsApp Number
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowNumberManager(true)} 
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Numbers
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAddByPhoneDialog(true)} 
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Add Contact by Phone
              </Button>
            </div>
          )}
        </div>
        
        <WhatsAppConnectionDialog 
          isOpen={showConnectionManager}
          onOpenChange={setShowConnectionManager}
        />
        
        <AddContactByPhoneDialog 
          isOpen={showAddByPhoneDialog}
          onOpenChange={setShowAddByPhoneDialog}
        />
        
        {showNumberManager && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold gradient-text">WhatsApp Number Management</h2>
                  <Button variant="ghost" onClick={() => setShowNumberManager(false)}>✕</Button>
                </div>
              </div>
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <WhatsAppNumberManager />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-transparent">
        <motion.div 
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-80 border-r border-gray-200/50 bg-white/60 backdrop-blur-lg flex flex-col"
        >
          <div className="p-4 border-b border-gray-200/50 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="text-green-500" />
                {t('whatsapp.title')}
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddByPhoneDialog(true)}
                  title="Add Contact by Phone"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                {currentUser?.role === 'Admin' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowConnectionManager(true)}
                      title="Add New Number"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNumberManager(true)}
                      title="Manage Numbers"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {accessibleNumbers.length > 1 && (
              <div>
                <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                <Select value={selectedNumber} onValueChange={setSelectedNumber}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Numbers</SelectItem>
                    {accessibleNumbers.map(number => (
                      <SelectItem key={number.id} value={number.id}>
                        {number.label} ({number.phoneNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{filteredConversations.length} conversations</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
          
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            getNumberLabel={getNumberLabel}
          />
        </motion.div>
        
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatWindow 
              conversation={selectedConversation} 
              key={selectedConversation.contactId}
              whatsappNumbers={accessibleNumbers}
              isUnknownContact={selectedConversation.isUnknown}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50/50">
              <Users className="w-24 h-24 text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold">{t('whatsapp.welcomeTitle')}</h2>
              <p>{t('whatsapp.welcomeMessage')}</p>
              {selectedNumber !== 'all' && (
                <p className="text-sm mt-2">
                  Using: {getNumberLabel(selectedNumber)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <WhatsAppConnectionDialog 
        isOpen={showConnectionManager}
        onOpenChange={setShowConnectionManager}
      />
      
      <AddContactByPhoneDialog 
        isOpen={showAddByPhoneDialog}
        onOpenChange={setShowAddByPhoneDialog}
      />
      
      {showNumberManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold gradient-text">WhatsApp Number Management</h2>
                <Button variant="ghost" onClick={() => setShowNumberManager(false)}>✕</Button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <WhatsAppNumberManager />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppManagement;