import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocale } from '@/contexts/LocaleContext';
import { useData } from '@/contexts/DataContext';
import { useInstagramManager } from '@/hooks/useInstagramManager';

import InstagramConversationList from '@/components/instagram/InstagramConversationList';
import InstagramChatWindow from '@/components/instagram/InstagramChatWindow';
import InstagramEmptyState from '@/components/instagram/InstagramEmptyState';
import InstagramSettings from '@/components/settings/InstagramSettings';

const InstagramManagement = () => {
  const { t } = useLocale();
  const { currentUser } = useData();
  const [showSettings, setShowSettings] = useState(false);

  const {
    accessibleAccounts,
    selectedAccount,
    setSelectedAccount,
    sortedConversations,
    selectedConversation,
    handleSelectConversation,
    getAccountLabel,
  } = useInstagramManager();

  if (accessibleAccounts.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <InstagramEmptyState
          onManageAccounts={() => setShowSettings(true)}
          isAdmin={currentUser?.role === 'Admin'}
        />
        {showSettings && (
          <InstagramSettings
            isOpen={showSettings}
            onOpenChange={setShowSettings}
          />
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
                <Instagram className="text-pink-500" />
                Instagram Chat
              </h2>
              {currentUser?.role === 'Admin' && (
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>

            {accessibleAccounts.length > 1 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Instagram Account</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accessibleAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        @{account.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{sortedConversations.length} conversations</span>
            </div>
          </div>

          <InstagramConversationList
            conversations={sortedConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            getAccountLabel={getAccountLabel}
          />
        </motion.div>

        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <InstagramChatWindow
              key={selectedConversation.contactId || selectedConversation.instagramUsername}
              conversation={selectedConversation}
              instagramAccounts={accessibleAccounts}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50/50">
              <Users className="w-24 h-24 text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold">Select a Conversation</h2>
              <p>Choose a conversation from the left to start chatting.</p>
            </div>
          )}
        </div>
      </div>
      
      {showSettings && (
        <InstagramSettings
          isOpen={showSettings}
          onOpenChange={setShowSettings}
        />
      )}
    </>
  );
};

export default InstagramManagement;