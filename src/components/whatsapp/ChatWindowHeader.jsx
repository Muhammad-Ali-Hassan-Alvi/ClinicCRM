import React from 'react';
import { Smartphone, Download, Bot, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ChatWindowHeader = ({ 
  conversation, 
  selectedNumber, 
  isConnected, 
  isUnknownContact,
  aiSuggestions,
  showAiSuggestions,
  setShowAiSuggestions,
  handleAiSuggestion,
  handleExportWhatsApp,
  t 
}) => {
  return (
    <header className="p-4 border-b border-gray-200/80 bg-white/70 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-white font-bold mr-3">
            {conversation.contactAvatar}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{conversation.contactName}</h2>
            {selectedNumber && (
              <div className="flex items-center gap-2 mt-1">
                <Smartphone className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">{selectedNumber.label}</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isUnknownContact && aiSuggestions.length > 0 && (
            <Popover open={showAiSuggestions} onOpenChange={setShowAiSuggestions}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  AI Suggestions
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" side="bottom" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Smart Reply Suggestions</h4>
                  {aiSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-2 text-sm"
                      onClick={() => handleAiSuggestion(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportWhatsApp}
            disabled={isUnknownContact}
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('whatsapp.exportChat')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;