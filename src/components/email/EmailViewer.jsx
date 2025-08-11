import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Trash2, Archive, ArrowLeft, MoreVertical, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NewContactFromEmailDialog from '@/components/email/NewContactFromEmailDialog';

const EmailViewer = ({ email, onBack, onMove, onDelete }) => {
  const { contacts } = useData();
  const { t } = useLocale();
  const [isCreateContactOpen, setCreateContactOpen] = useState(false);

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50">
        <p className="text-gray-500">Select an email to read</p>
      </div>
    );
  }

  const senderContact = contacts.find(c => c.email === email.from);
  const isUnknownSender = !senderContact;

  return (
    <motion.div
      key={email.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 flex flex-col bg-white/80 backdrop-blur-lg"
    >
      <header className="p-4 border-b border-gray-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar>
            <AvatarImage src={senderContact?.avatar} />
            <AvatarFallback>{email.from.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{email.subject}</h2>
            <div className="text-sm text-gray-500 flex items-center">
              <span>{email.from}</span>
              {isUnknownSender && (
                <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Unknown Sender</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden md:inline">
            {new Date(email.date).toLocaleString()}
          </span>
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assist
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onMove(email.id, 'archive')}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(email.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
              {isUnknownSender && (
                 <DropdownMenuItem onClick={() => setCreateContactOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Contact
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {isUnknownSender && (
        <div className="bg-yellow-100 border-b border-yellow-200 p-3 text-center text-sm text-yellow-800 flex items-center justify-center gap-3">
          <span>This sender is not in your contacts.</span>
          <Button size="sm" variant="outline" className="bg-white" onClick={() => setCreateContactOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create Contact
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div
          className="p-6 text-gray-800 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </ScrollArea>
      <NewContactFromEmailDialog
        isOpen={isCreateContactOpen}
        onOpenChange={setCreateContactOpen}
        email={email.from}
      />
    </motion.div>
  );
};

export default EmailViewer;