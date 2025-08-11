// src/components/ChatWindow.jsx (Final Refactored Code)

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, MoreVertical, Phone, Video, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Your configured Supabase client

// Import all your UI components and custom hooks
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import ChatMessage from './ChatMessage';
import InternalNote from './InternalNote';
import NewContactFromWhatsAppDialog from './NewContactFromWhatsAppDialog';
import { WhatsAppQRButton } from './WhatsAppQRButton'; // The "Click-to-Chat" component

// The component now has fewer props because it manages its own data flow.
const ChatWindow = ({ conversation, onExportChat, onCreateContact }) => {
  // --- STATE AND HOOKS ---
  const { contacts, settings } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showInternalNote, setShowInternalNote] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // This is our new local state for storing the chat history.
  const [messages, setMessages] = useState([]);

  // Find the full contact record from your DataContext.
  const contact = contacts.find(c => c.phoneNumber === conversation?.phoneNumber);

  // --- DATA FETCHING & REALTIME LISTENER (The New Engine) ---

  // 1. Fetch the message history when a conversation is selected.
  useEffect(() => {
    // If there's no contact, there are no messages to fetch.
    if (!contact?.id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      // Fetch from the new 'whatsapp_messages' table we created.
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('contact_id', contact.id)
        .order('timestamp', { ascending: true });
      
      if (error) {
        toast({ title: "Error", description: "Could not load chat history.", variant: "destructive" });
      } else {
        setMessages(data || []);
      }
    };
    fetchMessages();
  }, [contact, toast]); // Re-run this effect when the user clicks a new contact.

  // 2. Listen for new messages in real-time.
  useEffect(() => {
    if (!contact?.id) return;

    const channel = supabase
      .channel(`chat-for-contact-${contact.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: `contact_id=eq.${contact.id}` },
        (payload) => {
          // When a new message is inserted into the DB, add it to our state.
          // This handles both incoming messages from the webhook and outgoing messages you send.
          setMessages(currentMessages => [...currentMessages, payload.new]);
        }
      )
      .subscribe();

    // Important: Clean up the subscription when the component is unmounted.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [contact]);

  // Scroll to the bottom whenever the messages array updates.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- ACTIONS ---

  // Refactored to call our Supabase Edge Function.
  const handleSendMessage = async () => {
    if (!message.trim() || isSending || !contact) return;

    setIsSending(true);
    const messageText = message.trim();
    setMessage(''); // Optimistically clear the input field for a better user experience.

    try {
      // **KEY CHANGE**: We directly invoke the Edge Function.
      const { error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          contactId: contact.id,
          messageText: messageText,
          // You need to know which of your business numbers is sending the message.
          // This assumes the ID of the connected number is on the conversation object.
          businessNumberId: conversation.whatsappNumberId, 
        },
      });

      if (error) throw error; // The error will be caught by the catch block.

    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "Message Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive"
      });
      setMessage(messageText); // Restore the message in the input box on failure.
    } finally {
      setIsSending(false);
    }
  };
  
  // This function would also be refactored to call an Edge Function.
  const handleAddInternalNote = async () => {
    // await supabase.functions.invoke('add-internal-note', ...);
    toast({ title: "Internal Note Added" });
    setInternalNote('');
    setShowInternalNote(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // A helper function to map our database columns to the props ChatMessage expects.
  const formatMessageForUI = (dbMsg) => ({
      id: dbMsg.id,
      text: dbMsg.message_body,
      timestamp: dbMsg.timestamp,
      sender: dbMsg.direction === 'outgoing' ? 'user' : 'contact',
  });

  // --- RENDER LOGIC ---

  if (!conversation || !contact) {
    // Placeholder UI when no conversation is selected.
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Conversation</h3>
          <p className="text-gray-500">Choose a conversation from the list to start messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              {contact.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{contact.fullName}</h3>
              <p className="text-sm text-gray-500">{conversation.phoneNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* The other header buttons can remain for future features */}
            <Button variant="ghost" size="icon"><Search className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={onExportChat}><MoreVertical className="w-5 h-5" /></Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(dbMsg => (
            <ChatMessage key={dbMsg.id} message={formatMessageForUI(dbMsg)} />
          ))}
        </AnimatePresence>

        {/* If there are no messages, show the "Start Chat" prompt */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Start a conversation with {contact.fullName}</h3>
            <p className="text-gray-500 mb-6">This will open WhatsApp on your device, pre-filled with a message.</p>
            <WhatsAppQRButton 
              businessPhoneNumber={settings.businessPhoneNumber} // Your company number from settings
              contact={contact} 
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        {/* Your internal note UI can stay as is */}
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5" /></Button>
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('whatsapp.messagePlaceholder')}
              className="resize-none"
              rows={1}
              disabled={isSending}
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!message.trim() || isSending}>
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Your dialog for creating a new contact from this window */}
      <NewContactFromWhatsAppDialog
        isOpen={isNewContactDialogOpen}
        onOpenChange={setIsNewContactDialogOpen}
        phoneNumber={conversation.phoneNumber}
        onCreateContact={onCreateContact}
      />
    </div>
  );
};

export default ChatWindow;





// import { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Brain, CreditCard } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/components/ui/use-toast';
// import { useData } from '@/contexts/DataContext';
// import { useLocale } from '@/contexts/LocaleContext';
// import ChatMessage from './ChatMessage';
// import InternalNote from './InternalNote';
// import NewContactFromWhatsAppDialog from './NewContactFromWhatsAppDialog';
// import { getAnswerFromKB } from '@/lib/ai';

// const ChatWindow = ({
//   conversation,
//   whatsappClient,
//   onSendMessage,
//   onAddInternalNote,
//   onCreateContact,
//   onExportChat
// }) => {
//   const { contacts, settings } = useData();
//   const { toast } = useToast();
//   const { t } = useLocale();
//   const [message, setMessage] = useState('');
//   const [internalNote, setInternalNote] = useState('');
//   const [showInternalNote, setShowInternalNote] = useState(false);
//   const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [isAIEnabled, setIsAIEnabled] = useState(true);
//   const messagesEndRef = useRef(null);

//   // --- NEW STATE for messages, fetched from Supabase ---
//   const [messages, setMessages] = useState([]);

//   const contact = contacts.find(c => c.phoneNumber === conversation?.phoneNumber);
//   // Assuming 'settings.businessPhoneNumber' holds your company's WhatsApp number
//   const myBusinessNumber = settings.businessPhoneNumber; // e.g., '923001234567'

//   // Check if there are any messages in the conversation
//   const hasMessages = conversation?.messages && conversation.messages.length > 0;
//   const knowledgeBase = settings.aiKnowledgeBase || [];
//   const aiEnabledFiles = knowledgeBase.filter(f => f.aiEnabled);
//   const creditsRemaining = whatsappClient?.getCreditsRemaining() || 0;

//   useEffect(() => {
//     scrollToBottom();
//   }, [conversation?.messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = async () => {
//     if (!message.trim() || isSending) return;

//     if (!contact) {
//       toast({
//         title: "Contact Required",
//         description: t('whatsapp.createContactPrompt'),
//         variant: "destructive"
//       });
//       return;
//     }

//     if (creditsRemaining <= 0) {
//       toast({
//         title: "Insufficient Credits",
//         description: "You have no message credits remaining. Please contact support to add more credits.",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsSending(true);
//     try {
//       const messageText = message.trim();
//       setMessage('');

//       // Send message with AI knowledge base if enabled
//       const result = await whatsappClient.sendMessage(
//         conversation.phoneNumber,
//         messageText,
//         isAIEnabled ? aiEnabledFiles : []
//       );

//       if (result.success) {
//         toast({
//           title: "Message Sent",
//           description: `Message delivered successfully. ${result.creditsRemaining} credits remaining.`
//         });

//         if (onSendMessage) {
//           onSendMessage(conversation.phoneNumber, messageText);
//         }
//       }
//     } catch (error) {
//       console.error('Send message error:', error);
//       toast({
//         title: "Message Failed",
//         description: error.message || "Failed to send message. Please try again.",
//         variant: "destructive"
//       });
//       // Restore message on failure
//       setMessage(message);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleAddInternalNote = () => {
//     if (!internalNote.trim()) return;

//     if (onAddInternalNote) {
//       onAddInternalNote(conversation.phoneNumber, internalNote.trim());
//     }

//     setInternalNote('');
//     setShowInternalNote(false);

//     toast({
//       title: "Internal Note Added",
//       description: "Note has been saved for this conversation."
//     });
//   };

//   const handleCreateContact = (contactData) => {
//     if (onCreateContact) {
//       onCreateContact({
//         ...contactData,
//         phoneNumber: conversation.phoneNumber
//       });
//     }
//     setIsNewContactDialogOpen(false);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };


//   if (!conversation) {
//     return (
//       <div className="flex-1 flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Phone className="w-12 h-12 text-green-600" />
//           </div>
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Conversation</h3>
//           <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col bg-white">
//       {/* Header */}
//       <div className="p-4 border-b bg-white shadow-sm">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
//               {contact ? contact.fullName.charAt(0).toUpperCase() : conversation.phoneNumber.charAt(-2)}
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900">
//                 {contact ? contact.fullName : conversation.phoneNumber}
//               </h3>
//               <p className="text-sm text-gray-500">
//                 {contact ? conversation.phoneNumber : t('whatsapp.unknownContact')}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {/* Credits Display */}
//             <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
//               <CreditCard className="w-4 h-4 text-blue-600" />
//               <span className="text-sm text-blue-700">{creditsRemaining} credits</span>
//             </div>

//             {/* AI Toggle */}
//             <Button
//               variant={isAIEnabled ? "default" : "outline"}
//               size="sm"
//               onClick={() => setIsAIEnabled(!isAIEnabled)}
//               className={isAIEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}
//             >
//               <Brain className="w-4 h-4 mr-1" />
//               AI {isAIEnabled ? 'ON' : 'OFF'}
//             </Button>

//             {!contact && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setIsNewContactDialogOpen(true)}
//               >
//                 Create Contact
//               </Button>
//             )}

//             <Button variant="ghost" size="icon">
//               <Search className="w-5 h-5" />
//             </Button>
//             <Button variant="ghost" size="icon">
//               <Phone className="w-5 h-5" />
//             </Button>
//             <Button variant="ghost" size="icon">
//               <Video className="w-5 h-5" />
//             </Button>
//             <Button variant="ghost" size="icon" onClick={onExportChat}>
//               <MoreVertical className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>

//         {/* AI Status */}
//         {isAIEnabled && aiEnabledFiles.length > 0 && (
//           <div className="mt-2 p-2 bg-purple-50 rounded-lg">
//             <p className="text-sm text-purple-700">
//               🤖 AI Assistant is active with {aiEnabledFiles.length} knowledge files
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         <AnimatePresence>
//           {conversation.messages?.map((msg, index) => (
//             <motion.div
//               key={msg.id || index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//             >
//               {msg.type === 'internal_note' ? (
//                 <InternalNote note={msg} />
//               ) : (
//                 <ChatMessage message={msg} />
//               )}
//             </motion.div>
//           ))}
//         </AnimatePresence>
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t bg-gray-50">
//         {showInternalNote && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mb-3"
//           >
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//               <label className="block text-sm font-medium text-yellow-800 mb-2">
//                 Internal Note (Not visible to customer)
//               </label>
//               <Textarea
//                 value={internalNote}
//                 onChange={(e) => setInternalNote(e.target.value)}
//                 placeholder={t('whatsapp.notePlaceholder')}
//                 className="bg-white border-yellow-300"
//                 rows={2}
//               />
//               <div className="flex gap-2 mt-2">
//                 <Button size="sm" onClick={handleAddInternalNote}>
//                   Save Note
//                 </Button>
//                 <Button size="sm" variant="outline" onClick={() => setShowInternalNote(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <div className="flex items-end gap-2">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setShowInternalNote(!showInternalNote)}
//             className="text-yellow-600 hover:bg-yellow-50"
//           >
//             <Paperclip className="w-5 h-5" />
//           </Button>

//           <div className="flex-1">
//             <Textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder={contact ? t('whatsapp.messagePlaceholder') : t('whatsapp.createContactPrompt')}
//               className="resize-none"
//               rows={1}
//               disabled={!contact || isSending || creditsRemaining <= 0}
//             />
//           </div>

//           <Button
//             onClick={handleSendMessage}
//             disabled={!message.trim() || !contact || isSending || creditsRemaining <= 0}
//             className="bg-green-600 hover:bg-green-700 text-white"
//           >
//             {isSending ? (
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//             ) : (
//               <Send className="w-5 h-5" />
//             )}
//           </Button>
//         </div>

//         {creditsRemaining <= 10 && (
//           <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
//             <p className="text-sm text-orange-700">
//               ⚠️ Low credits warning: Only {creditsRemaining} messages remaining. Contact support to add more credits.
//             </p>
//           </div>
//         )}
//       </div>

//       <NewContactFromWhatsAppDialog
//         isOpen={isNewContactDialogOpen}
//         onOpenChange={setIsNewContactDialogOpen}
//         phoneNumber={conversation.phoneNumber}
//         onCreateContact={handleCreateContact}
//       />
//     </div>
//   );
// };

// export default ChatWindow;