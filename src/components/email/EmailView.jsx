import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CornerUpLeft, CornerUpRight, Forward } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';

const EmailView = ({ email }) => {
  const { toast } = useToast();
  const { t } = useLocale();

  const handleAction = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "This feature isn't available yet—but you can request it! 🚀",
    });
  };

  return (
    <motion.div
      key={email.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 h-full flex flex-col bg-white"
    >
      <header className="pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800">{email.subject}</h1>
        <div className="flex items-center mt-4">
          <Avatar className="w-12 h-12 mr-4">
            <AvatarFallback className="bg-blue-500 text-white font-bold">{email.from.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-700">{email.fromName || email.from}</p>
            <p className="text-sm text-gray-500">{t('email.compose.to')}: You</p>
          </div>
          <span className="ml-auto text-sm text-gray-500">{new Date(email.date).toLocaleString()}</span>
        </div>
      </header>
      <div className="flex-grow overflow-y-auto py-6">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: email.body }}></div>
      </div>
      <footer className="pt-4 border-t flex items-center gap-2">
        <Button variant="outline" onClick={handleAction}><CornerUpLeft className="w-4 h-4 mr-2" /> {t('email.actions.reply')}</Button>
        <Button variant="outline" onClick={handleAction}><CornerUpRight className="w-4 h-4 mr-2" /> {t('email.actions.replyAll')}</Button>
        <Button variant="outline" onClick={handleAction}><Forward className="w-4 h-4 mr-2" /> {t('email.actions.forward')}</Button>
      </footer>
    </motion.div>
  );
};

export default EmailView;