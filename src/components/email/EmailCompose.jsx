import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, X, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { sendEmail } from '@/lib/emailProviders';

const EmailCompose = ({ emailAccount, composeData, onBack }) => {
  const { contacts, leads, customers, tickets } = useData();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: []
  });

  useEffect(() => {
    if (composeData) {
      const newFormData = { ...formData };
      
      if (composeData.to) newFormData.to = composeData.to;
      if (composeData.subject) newFormData.subject = composeData.subject;
      if (composeData.body) newFormData.body = composeData.body;
      
      if (composeData.contactId) {
        const contact = contacts.find(c => c.id === composeData.contactId) ||
                       customers.find(c => c.contactId === composeData.contactId) ||
                       leads.find(l => l.contactId === composeData.contactId);
        
        if (contact && contact.email) {
          newFormData.to = contact.email;
        }
      }
      
      setFormData(newFormData);
    }
  }, [composeData, contacts, customers, leads]);

  const handleSend = async () => {
    if (!formData.to || !formData.subject || !formData.body) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient, subject, and message body.",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    try {
      const result = await sendEmail(emailAccount, {
        to: formData.to,
        cc: formData.cc,
        bcc: formData.bcc,
        subject: formData.subject,
        body: formData.body,
        attachments: formData.attachments
      });

      if (result.success) {
        toast({
          title: "✅ Email Sent!",
          description: `Your email has been sent successfully to ${formData.to}.`
        });
        
        setFormData({
          to: '',
          cc: '',
          bcc: '',
          subject: '',
          body: '',
          attachments: []
        });
        
        if (onBack) onBack();
      } else {
        toast({
          title: "Failed to Send Email",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the email.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleAttachment = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "File attachments aren't available yet—but you can request it! 🚀"
    });
  };

  const handleQuickSelect = (email) => {
    setFormData(prev => ({ ...prev, to: email }));
  };

  const allContacts = [
    ...contacts.filter(c => c.email).map(c => ({ email: c.email, name: c.fullName, type: 'Contact' })),
    ...customers.filter(c => c.contactEmail).map(c => ({ email: c.contactEmail, name: c.contactFullName, type: 'Customer' })),
    ...leads.filter(l => l.contactEmail).map(l => ({ email: l.contactEmail, name: l.contactFullName, type: 'Lead' }))
  ];

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold">Compose Email</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">From: {emailAccount.email}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="to">To *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="to"
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="recipient@example.com"
                className="flex-1"
              />
              {allContacts.length > 0 && (
                <Select onValueChange={handleQuickSelect}>
                  <option value="">Quick Select</option>
                  {allContacts.map((contact, index) => (
                    <option key={index} value={contact.email}>
                      {contact.name} ({contact.type})
                    </option>
                  ))}
                </Select>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="cc">CC</Label>
            <Input
              id="cc"
              value={formData.cc}
              onChange={(e) => setFormData(prev => ({ ...prev, cc: e.target.value }))}
              placeholder="cc@example.com"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Email subject"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="body">Message *</Label>
          <Textarea
            id="body"
            value={formData.body}
            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
            placeholder="Type your message here..."
            className="mt-1 min-h-[200px]"
          />
        </div>

        {formData.attachments.length > 0 && (
          <div>
            <Label>Attachments</Label>
            <div className="mt-1 space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      attachments: prev.attachments.filter((_, i) => i !== index)
                    }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <Button variant="outline" onClick={handleAttachment}>
          <Paperclip className="w-4 h-4 mr-2" />
          Attach Files
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={sending || !formData.to || !formData.subject || !formData.body}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            {sending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailCompose;