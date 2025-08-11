// src/components/ContactList.jsx
import React from 'react';
import { UserCircle } from 'lucide-react';
import { ClockLoader } from 'react-spinners';

const ContactListItem = ({ chat, onSelectChat, isSelected }) => {
  console.log(chat)
 return <li
    onClick={() => onSelectChat(chat)}
    className={`flex items-center p-3 cursor-pointer transition ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
  >
    {chat.profilePicUrl ? (
      <img src={chat.profilePicUrl} alt={chat.name} className="w-12 h-12 rounded-full mr-3" />
    ) : (
      <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
        <UserCircle className="text-gray-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <div className="font-medium truncate">{chat?.name}</div>
        {chat.unreadCount > 0 && (
          <span className="text-xs bg-teal-600 text-white rounded-full px-2 py-0.5 ml-2">{chat.unreadCount}</span>
        )}
      </div>
      <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
    </div>
  </li>
};

export default function ContactList({ chats = [], onSelectChat, selectedChatId, loading }) {
  return (
    <div className="flex flex-col h-[85vh]">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-xl font-semibold">Whatsapp Chats</h3>
      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClockLoader color="#128C7E" />
          </div>
        ) : (
          <ul>
            {chats.map((c) => (
              <ContactListItem key={c.id} chat={c} onSelectChat={onSelectChat} isSelected={c.id === selectedChatId} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
