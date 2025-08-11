import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox, Send, Edit, Trash2, FileText, Mail } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import EmailList from '@/components/email/EmailList';
import EmailView from '@/components/email/EmailView';
import EmailComposer from '@/components/email/EmailComposer';
import { useLocale } from '@/contexts/LocaleContext';
import { CLIENT_ID, SCOPES } from '../../main';

const EmailManagement = () => {
  const { markEmailAsRead } = useData();
  const { folder = 'inbox', emailId } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const filteredEmails = emails.filter(email => email.folder === folder)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => {
    if (emailId) {
      const email = emails.find(e => e.id === emailId);
      if (email) {
        setSelectedEmail(email);
        if (!email.read) {
          markEmailAsRead(email.id);
        }
      }
    } else {
      setSelectedEmail(null);
    }
  }, [emailId, emails, markEmailAsRead]);

  const handleSelectEmail = (email) => {
    navigate(`/email/${folder}/${email.id}`);
  };

  const folders = [
    { id: 'inbox', name: t('Inbox'), icon: Inbox },
    { id: 'sent', name: t('Sent'), icon: Send },
    { id: 'drafts', name: t('Drafts'), icon: FileText },
    { id: 'trash', name: t('Trash'), icon: Trash2 },
  ];

  // email

  const tokenClientRef = useRef(null);
  const [accessToken, setAccessToken] = useState(null);

  async function listMessagesByLabel(labelId) {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${labelId}&maxResults=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    return data.messages || [];
  }

  async function getMessageDetails(id) {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res.json();
  }

  const LABELS = {
    SENT: 'SENT',
    DRAFT: 'DRAFT',
    TRASH: 'TRASH'
  };

  async function loadEmails(labelId) {
    const ids = await listMessagesByLabel(labelId);
    const details = await Promise.all(ids.map(m => getMessageDetails(m.id)));
    setEmails(details);
  }

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.access_token) setAccessToken(resp.access_token);
        },
      });
    }
  }, []);

  const connectGmail = () => {
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  };

  return (
    <div className="flex h-full bg-gray-100/50">
      <EmailComposer isOpen={isComposerOpen} onOpenChange={setIsComposerOpen} />
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/80 p-4 flex flex-col"
      >
        <Button onClick={() => setIsComposerOpen(true)} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6">
          <Edit className="w-4 h-4 mr-2" /> {t('Email Compose Title')}
        </Button>
        <nav className="space-y-2">
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => navigate(`/email/${f.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${folder === f.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <f.icon className="w-5 h-5" />
              <span>{f.name}</span>
            </button>
          ))}
        </nav>
      </motion.div>
      <div className="w-96 border-r border-gray-200/80">
        <EmailList
          emails={filteredEmails}
          onSelectEmail={handleSelectEmail}
          selectedEmail={selectedEmail}
        />
      </div>
      <main className="flex-1">
        {selectedEmail ? (
          <EmailView email={selectedEmail} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Mail className="w-24 h-24 mb-4 text-gray-300" />
            <h2 className="text-xl font-medium">{t('Select Email Prompt')}</h2>
            <p>{t('Select Email Subtext')}</p>
            <div>
              {!accessToken
                ? <Button onClick={connectGmail}>Connect Gmail</Button>
                : <div>Connected!</div>
              }
            </div>
            <div>
              <button onClick={() => loadEmails(LABELS.SENT)}>Show Sent</button>
              <button onClick={() => loadEmails(LABELS.DRAFT)}>Show Drafts</button>
              <button onClick={() => loadEmails(LABELS.TRASH)}>Show Trash</button>

              <ul>
                {emails.map(email => {
                  const headers = Object.fromEntries(email.payload.headers.map(h => [h.name, h.value]));
                  return (
                    <li key={email.id}>
                      <strong>{headers.Subject}</strong> — {headers.From} — {headers.Date}
                      <br />Snippet: {email.snippet}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmailManagement;