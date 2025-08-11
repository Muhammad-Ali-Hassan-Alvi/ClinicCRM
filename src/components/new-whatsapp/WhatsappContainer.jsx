// src/components/ChatContainer.jsx
import React, { useEffect, useState } from 'react';
import ContactList from './ContactList';
import ChatWindow from './ChatWindow';
import socket from '../../lib/whatsappSocket';

export default function WhatsappContainer({ chats = [], onLogout }) {
  const [selected, setSelected] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({}); // { chatId: [msg,..] }
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const onChatMessages = ({ chatId, messages }) => {
      setMessagesByChat((prev) => ({ ...prev, [chatId]: messages }));
      setLoadingMessages(false);
    };

    const onNewMessage = (m) => {
      setMessagesByChat((prev) => {
        const key = m.from;
        const arr = prev[key] ? [...prev[key]] : [];
        arr.push({
          id: m.id,
          body: m.body,
          fromMe: m.fromMe,
          timestamp: m.timestamp,
        });
        return { ...prev, [key]: arr };
      });
    };

    const onMessageSent = ({ chatId, message, id }) => {
      // server acknowledged message-sent - we already optimistically appended in ChatWindow
      // Optionally update message id or state here
    };

    socket.on('chat-messages', onChatMessages);
    socket.on('newMessage', onNewMessage);
    socket.on('message-sent', onMessageSent);

    // cleanup
    return () => {
      socket.off('chat-messages', onChatMessages);
      socket.off('newMessage', onNewMessage);
      socket.off('message-sent', onMessageSent);
    };
  }, []);

  const selectChat = (chat) => {
    setSelected(chat);
    setLoadingMessages(true);
    socket.emit('get-chat-messages', chat.id);
  };

  return (
    <div className="flex max-h-[85vh]">
      <div className="w-1/3 border-r bg-white">
        <ContactList
          chats={chats}
          onSelectChat={selectChat}
          selectedChatId={selected?.id}
          loading={false}
        />
      </div>

      <div className="w-2/3 flex flex-col">
        <div className="p-3 border-b bg-white flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{selected?.name || 'Select a chat'}</h2>
            <div className="text-xs text-gray-500">{selected?.id || '—'}</div>
          </div>
          {/* <div>
            <button onClick={onLogout} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
          </div> */}
        </div>

        <div className="flex-1">
          <ChatWindow
            chat={selected}
            messages={selected ? messagesByChat[selected.id] || [] : []}
            loading={loadingMessages}
          />
        </div>
      </div>
    </div>
  );
}
