import { motion } from 'framer-motion';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isUser ? 'bg-green-500 text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-green-200' : 'text-gray-400'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;