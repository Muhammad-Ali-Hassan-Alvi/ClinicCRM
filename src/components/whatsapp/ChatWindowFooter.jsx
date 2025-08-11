import React from 'react';
import { Send, Paperclip, StickyNote, Sparkles, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AiAssistantPanel from '@/components/ai/AiAssistantPanel';

const ChatWindowFooter = ({
  whatsappNumbers,
  selectedNumberId,
  setSelectedNumberId,
  handleSendMessage,
  handleAttachment,
  isNoteMode,
  setIsNoteMode,
  newMessage,
  setNewMessage,
  isUnknownContact,
  isSending,
  isConnected,
  conversationText,
  handleAiSuggestion,
  t
}) => {
  return (
    <footer className="p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200/80 space-y-3">
      {whatsappNumbers.length > 1 && (
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-gray-500" />
          <Select value={selectedNumberId} onValueChange={setSelectedNumberId}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {whatsappNumbers.map(number => (
                <SelectItem key={number.id} value={number.id}>
                  {number.label} ({number.phoneNumber}) - {number.status === 'connected' ? '🟢' : '🔴'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <button 
          type="button" 
          onClick={handleAttachment} 
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors" 
          disabled={isUnknownContact}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <button 
          type="button" 
          onClick={() => setIsNoteMode(!isNoteMode)} 
          className={`p-2 rounded-full transition-colors ${
            isNoteMode ? 'bg-yellow-200 text-yellow-800' : 'text-gray-500 hover:text-gray-700'
          }`} 
          disabled={isUnknownContact}
        >
          <StickyNote className="w-5 h-5" />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button 
              type="button" 
              className="p-2 text-purple-600 hover:text-purple-800 transition-colors" 
              disabled={isUnknownContact}
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-md mb-2" side="top" align="start">
            <AiAssistantPanel contextText={conversationText} onSuggestion={handleAiSuggestion} />
          </PopoverContent>
        </Popover>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={
            isUnknownContact 
              ? t('whatsapp.createContactPrompt') 
              : isNoteMode 
                ? t('whatsapp.notePlaceholder') 
                : !isConnected 
                  ? 'Type message (will be saved as note - WhatsApp disconnected)'
                  : t('whatsapp.messagePlaceholder')
          }
          className={`flex-1 px-4 py-2 rounded-full border transition-all duration-300 ${
            isNoteMode 
              ? 'bg-yellow-50 border-yellow-300 focus:ring-yellow-400' 
              : !isConnected 
                ? 'bg-red-50 border-red-300 focus:ring-red-400'
                : 'bg-gray-100 border-gray-200 focus:ring-blue-500'
          } focus:outline-none focus:ring-2 disabled:bg-gray-200`}
          disabled={isUnknownContact || isSending}
        />
        <button 
          type="submit" 
          disabled={!selectedNumberId || isUnknownContact || isSending}
          className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors disabled:bg-gray-300"
        >
          <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
        </button>
      </form>
      
      {!isConnected && !isUnknownContact && (
        <div className="text-xs text-red-600 text-center">
          ⚠️ WhatsApp disconnected - messages will be saved as internal notes
        </div>
      )}
    </footer>
  );
};

export default ChatWindowFooter;