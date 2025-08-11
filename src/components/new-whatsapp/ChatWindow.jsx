// src/components/ChatWindow.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import socket from '../../lib/whatsappSocket';
import MessageMedia from './MessageMedia'; // <--- IMPORT THE NEW COMPONENT

export default function ChatWindow({ chat, messages = [], loading }) {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // sync messages prop into local state when chat changes
    setLocalMessages(messages || []);
  }, [messages, chat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!chat || !input.trim()) return;
    const payload = { chatId: chat.id, message: input.trim() };

    // Optimistic update
    const optimistic = {
      id: `local-${Date.now()}`,
      body: input.trim(),
      fromMe: true,
      timestamp: Math.floor(Date.now() / 1000),
      media: null, // No media for optimistic text messages
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    setInput('');

    // emit to server
    socket.emit('send-message', payload);

    toast.success('Message sent');
  };

  if (!chat) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to view messages</div>;
  }

  return (
    <div className="flex flex-col h-[78vh]">
      <div className="flex-1 overflow-y-auto p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
        {loading ? (
          <div className="flex items-center justify-center h-full">Loading messages…</div>
        ) : (
          // =============== CHANGE START ===============
          (localMessages || []).map((m) => (
            <div key={m.id} className={`mb-3 flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg max-w-[70%] shadow ${m.fromMe ? 'bg-green-200' : 'bg-white'}`}>
                
                {/* 1. RENDER THE MEDIA IF IT EXISTS */}
                {m.media && <MessageMedia media={m.media} />}

                {/* 2. RENDER THE BODY (CAPTION) IF IT EXISTS */}
                {m.body && (
                  <div className="text-sm">{m.body}</div>
                )}
                
                {/* 3. RENDER THE TIMESTAMP */}
                <div className="text-[10px] text-gray-500 mt-1 text-right">
                  {new Date((m.timestamp || Date.now()/1000) * 1000).toLocaleTimeString()}
                </div>

              </div>
            </div>
          ))
          // =============== CHANGE END =================
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-gray-100 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={chat ? 'Type a message' : 'Select a chat first'}
          disabled={!chat}
          className="flex-1 px-4 py-2 rounded-full border focus:outline-none"
        />
        <button type="submit" disabled={!chat || !input.trim()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}