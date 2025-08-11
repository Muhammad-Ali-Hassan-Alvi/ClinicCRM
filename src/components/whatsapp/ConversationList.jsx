import { useState , useEffect, useCallback} from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle , MessageSquare } from 'lucide-react';

// A simple helper function for displaying relative time.
const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
const ConversationListItem = ({ conversation, isSelected, onSelect, getNumberLabel }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => onSelect(conversation)}
      className={`flex items-center p-3 cursor-pointer transition-colors duration-200 border-l-4 ${isSelected
          ? 'bg-blue-100/70 border-l-blue-500'
          : 'hover:bg-gray-100/70 border-l-transparent'
        }`}
    >
      <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg mr-3 ${conversation.is_unknown
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
          : 'bg-gradient-to-br from-green-400 to-cyan-500'
        }`}>
        {conversation.is_unknown ? '?' : conversation.contact_avatar}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 truncate">{conversation.contact_name}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {timeAgo(conversation.last_message_timestamp)}
          </span>
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-600 truncate pr-2">{conversation.last_message}</p>
          {conversation.unread_count > 0 && (
            <div className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              {conversation.unread_count}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ConversationList = ({ selectedConversation, onSelectConversation, getNumberLabel }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // We use useCallback to memoize the function so it doesn't get redefined on every render.
  const fetchConversations = useCallback(async () => {
    // 'rpc' is how you call a PostgreSQL function in Supabase.
    const { data, error } = await supabase.rpc('get_conversations_summary');

    if (error) {
      console.error("Error fetching conversations:", error);
      // You could show a toast message here.
    } else {
      setConversations(data || []);
    }
    setIsLoading(false);
  }, []);

  // Fetch the initial list of conversations when the component first mounts.
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Set up a Realtime listener to automatically refresh the list when new messages arrive.
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-conversations-list')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' },
        // When any new message is inserted, simply re-fetch the entire summary.
        // This is a simple and effective way to keep the list and unread counts up to date.
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {totalUnread > 0 && (
        <div className="p-3 bg-green-50 border-b border-green-200">
          <p className="text-sm text-green-800 font-medium">
            {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <AnimatePresence>
        {conversations.map(convo => (
          <ConversationListItem
            key={convo.contact_id}
            conversation={convo}
            isSelected={selectedConversation?.contact_id === convo.contact_id}
            onSelect={onSelectConversation}
            getNumberLabel={getNumberLabel}
          />
        ))}
      </AnimatePresence>

      {conversations.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-semibold">No Conversations Yet</p>
          <p className="text-sm mt-1">When you receive a message, it will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;