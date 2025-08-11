// src/components/WhatsappScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Send, Phone, RefreshCw, Power } from 'lucide-react';
import socket from '../../lib/whatsappSocket';

export default function WhatsappScreen({ onLogout }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({}); // { chatId: [msgs] }
  const [outText, setOutText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleChats = (list) => {
      setChats(list || []);
    };
    const handleMessage = (m) => {
      setMessages(prev => {
        const list = prev[m.from] ? [...prev[m.from]] : [];
        list.push({ id: m.id, body: m.body, fromMe: m.fromMe, timestamp: m.timestamp });
        return { ...prev, [m.from]: list };
      });
    };
    const handleChatMessages = ({ chatId, messages: msgs }) => {
      setMessages(prev => ({ ...prev, [chatId]: msgs }));
    };

    socket.on('chats', handleChats);
    socket.on('message', handleMessage);
    socket.on('chat-messages', handleChatMessages);

    // initial fetch
    socket.emit('get-chats');

    return () => {
      socket.off('chats', handleChats);
      socket.off('message', handleMessage);
      socket.off('chat-messages', handleChatMessages);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  const selectChat = (chat) => {
    setSelectedChat(chat);
    socket.emit('get-chat-messages', chat.id);
  };

  const sendMessage = () => {
    if (!selectedChat || !outText.trim()) return;
    const payload = { chatId: selectedChat.id, message: outText.trim() };
    socket.emit('send-message', payload);
    setOutText('');
    // optimistic UI
    setMessages(prev => {
      const list = prev[selectedChat.id] ? [...prev[selectedChat.id]] : [];
      list.push({ id: `local-${Date.now()}`, body: payload.message, fromMe: true, timestamp: Math.floor(Date.now()/1000) });
      return { ...prev, [selectedChat.id]: list };
    });
  };

  return (
    <div className="flex h-[82vh] w-full bg-gray-50 border rounded-lg overflow-hidden shadow">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">WhatsApp</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => socket.emit('get-chats')} className="p-2 rounded hover:bg-gray-100"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={onLogout} className="p-2 rounded hover:bg-red-50 text-red-600"><Power className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.length === 0 && <div className="text-gray-500 p-4">No chats yet.</div>}
          <ul>
            {chats.map(c => (
              <li key={c.id} onClick={() => selectChat(c)} className={`p-2 rounded cursor-pointer ${selectedChat?.id === c.id ? 'bg-green-50' : 'hover:bg-gray-100'}`}>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500 truncate">{c.id}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{selectedChat?.name || 'Select a chat'}</h4>
              <div className="text-xs text-gray-500">{selectedChat?.id || '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-gray-100"><Phone className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {selectedChat ? (
            (messages[selectedChat.id] || []).map(m => (
              <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[70%] ${m.fromMe ? 'bg-green-200' : 'bg-white'}`}>
                  <div className="text-sm">{m.body}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{new Date((m.timestamp || Date.now()/1000) * 1000).toLocaleString()}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center mt-10">Choose a chat to view messages</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t bg-white flex gap-2">
          <input value={outText} onChange={(e) => setOutText(e.target.value)} disabled={!selectedChat}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            placeholder={selectedChat ? 'Type a message...' : 'Select a chat first'}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none" />
          <button onClick={sendMessage} disabled={!selectedChat || !outText.trim()} className="bg-green-500 hover:bg-green-600 text-white px-4 rounded">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
