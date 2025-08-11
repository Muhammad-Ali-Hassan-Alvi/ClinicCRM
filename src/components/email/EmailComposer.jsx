import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Paperclip, Send } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { DialogContent } from '../ui/dialog';
import { sendEmail } from '../../lib/emailProviders';
import { CLIENT_ID, SCOPES } from '../../main';

const EmailComposer = ({ isOpen, onOpenChange, initialTo = '', initialSubject = '', contactId = null, recordType = null }) => {
  const { settings } = useData();
  const { toast } = useToast();
  const [fromAccount, setFromAccount] = useState('');
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState('');
  const { t } = useLocale();

  const connectedAccounts = settings.emailAccounts?.filter(acc => acc.status === 'connected') || [];


  
  useEffect(() => {
    if (isOpen) {
      if (connectedAccounts.length > 0) {
        setFromAccount(connectedAccounts[0].email);
      }
      setTo(initialTo);
      setSubject(initialSubject);
      setBody('');
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!fromAccount || !to || !subject || !body) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before sending.",
        variant: "destructive"
      });
      return;
    }

    const emailAccount = {
      email: fromAccount,
      apiKey: "re_XWPZwwAC_GmCtkpbR6WiKLN4AMmWMLM8x"
    };

    const emailData = {
      to,
      subject,
      body,
      contactId,
      recordType,
    };

    const result = await sendEmail(emailAccount, emailData);

    if (result.success) {
      toast({ title: "Email Sent!", description: "Your email has been successfully sent." });
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Something went wrong.",
        variant: "destructive"
      });
    }
  };


  const handleClose = () => {
    onOpenChange(false);
  }

  const handleAttachment = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "Sending attachments isn't available yet—but you can request it! 🚀",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 bg-transparent border-none max-w-3xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold gradient-text">{t('Email Compose Title')}</h2>
            </div>
            <div className="p-6 flex-grow space-y-4 overflow-y-auto">
              <div className="flex items-center gap-4">
                <label className="w-16 text-right text-sm font-medium text-gray-600">{t('From')}:</label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="flex-1 p-2 border rounded-md bg-white"
                >
                  {connectedAccounts.length > 0 ? (
                    connectedAccounts.map((acc) => (
                      <option key={acc.id} value={acc.email}>{acc.email}</option>
                    ))
                  ) : (
                    <option>No accounts connected</option>
                  )}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-16 text-right text-sm font-medium text-gray-600">{t('To')}:</label>
                <Input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder={t('To Placeholder')}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-16 text-right text-sm font-medium text-gray-600">{t('Subject')}:</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('Subject Placeholder')}
                />
              </div>
              <div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t('Email Body Placeholder')}
                  rows={12}
                  className="min-h-[250px]"
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-2xl">
              <Button variant="ghost" onClick={handleAttachment}>
                <Paperclip className="w-4 h-4 mr-2" />
                {t('Attach')}
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  {t('actions.cancel')}
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!fromAccount}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t('Send')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailComposer;

// 215088288728-bidv6bmfc9gip7sgbc5lr93fr4i2215n.apps.googleusercontent.com
// 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

// client web 2
// 215088288728-q1uutkk9u1d0aq8jbtnicbdq3vj3o47v.apps.googleusercontent.com
// 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