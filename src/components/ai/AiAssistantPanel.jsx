import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Languages, FileQuestion, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import * as ai from '@/lib/ai';

const AiAssistantPanel = ({ contextText, onSuggestion, onTranslate }) => {
  const { settings, contacts, leads, customers, tickets } = useData();
  const { t, locale } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [kbQuestion, setKbQuestion] = useState('');
  
  const allFiles = useMemo(() => {
    const combined = [];
    const mapRecord = (record) => {
      (record.attachments || []).forEach(file => combined.push(file));
    };
    contacts.forEach(mapRecord);
    leads.forEach(mapRecord);
    customers.forEach(mapRecord);
    tickets.forEach(mapRecord);
    return combined;
  }, [contacts, leads, customers, tickets]);


  const handleAction = async (action) => {
    setIsLoading(true);
    setResult('');
    setActiveAction(action);

    try {
      let res;
      switch (action) {
        case 'summarize':
          res = await ai.getSummary(contextText);
          break;
        case 'suggest':
          res = await ai.getReplySuggestion(contextText);
          break;
        case 'translate':
          res = await ai.getTranslation(contextText, locale === 'en' ? 'ar' : 'en');
          break;
        case 'ask':
          if (!kbQuestion) {
            res = "Please enter a question to ask the knowledge base.";
            break;
          }
          res = await ai.getAnswerFromKB(kbQuestion, allFiles);
          break;
        default:
          res = "Unknown action.";
      }
      setResult(res);
    } catch (error) {
      setResult("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    onSuggestion(suggestion);
    setResult('');
    setActiveAction(null);
  };

  const actionButtons = [
    { id: 'summarize', icon: MessageSquare, label: t('ai.summarize') },
    { id: 'suggest', icon: Sparkles, label: t('ai.suggestReply') },
    { id: 'translate', icon: Languages, label: t('ai.translate') },
    { id: 'ask', icon: FileQuestion, label: t('ai.askKB') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl p-4 shadow-lg"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {actionButtons.map(btn => (
          <Button
            key={btn.id}
            variant="outline"
            className="flex-col h-auto py-2"
            onClick={() => handleAction(btn.id)}
            disabled={isLoading}
          >
            <btn.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{btn.label}</span>
          </Button>
        ))}
      </div>

      {activeAction === 'ask' && (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder={t('ai.askPlaceholder')}
            value={kbQuestion}
            onChange={(e) => setKbQuestion(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={() => handleAction('ask')} disabled={isLoading || !kbQuestion}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-4 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>{t('ai.thinking')}</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="bg-blue-50/70 p-3 rounded-lg mt-2">
          {activeAction === 'suggest' && Array.isArray(result) ? (
            <div className="space-y-2">
              {result.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto"
                  onClick={() => handleUseSuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          ) : (
            <Textarea
              readOnly
              value={result}
              className="bg-transparent border-0"
              rows={4}
            />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AiAssistantPanel;