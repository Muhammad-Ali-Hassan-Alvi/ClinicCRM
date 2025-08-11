import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MailOpen, Paperclip, Reply, Forward, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchEmails } from '@/lib/emailProviders';

const EmailInbox = ({ emailAccount, onCompose }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadEmails = async () => {
    setLoading(true);
    try {
      const result = await fetchEmails(emailAccount);
      if (result.success) {
        setEmails(result.emails);
      } else {
        toast({
          title: "Failed to Load Emails",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch emails",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [emailAccount]);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    if (!email.read) {
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, read: true } : e
      ));
    }
  };

  const handleReply = (email) => {
    onCompose({
      to: email.from,
      subject: `Re: ${email.subject}`,
      replyTo: email.id
    });
  };

  const handleForward = (email) => {
    onCompose({
      subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.from}\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`,
      forward: email.id
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading emails...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[600px]">
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Inbox ({emails.length})</h3>
          <Button variant="ghost" size="sm" onClick={loadEmails}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {emails.map(email => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
              } ${!email.read ? 'bg-blue-25' : ''}`}
              onClick={() => handleEmailClick(email)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {email.read ? (
                    <MailOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${!email.read ? 'font-semibold' : ''}`}>
                      {email.from}
                    </p>
                    <p className={`text-sm text-gray-600 truncate ${!email.read ? 'font-medium' : ''}`}>
                      {email.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {email.attachments?.length > 0 && (
                    <Paperclip className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTime(email.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">{selectedEmail.subject}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleReply(selectedEmail)}>
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleForward(selectedEmail)}>
                    <Forward className="w-4 h-4 mr-1" />
                    Forward
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">From:</span> {selectedEmail.from}
                </div>
                <div>
                  {new Date(selectedEmail.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800">
                  {selectedEmail.body}
                </div>
              </div>
              {selectedEmail.attachments?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInbox;