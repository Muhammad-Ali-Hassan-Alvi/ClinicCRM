import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstagramEmptyState = ({ onManageAccounts, isAdmin }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex h-full items-center justify-center bg-gray-50/50"
    >
      <div className="text-center p-8">
        <Instagram className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Connect Your Instagram</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {isAdmin 
            ? 'Integrate your first Instagram account to start managing DMs and engaging with customers directly from the CRM.'
            : 'No Instagram accounts have been assigned to you. Please contact an administrator.'
          }
        </p>
        {isAdmin && (
          <Button onClick={onManageAccounts}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Instagram Accounts
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default InstagramEmptyState;