import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, CheckCircle, GitPullRequest } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const HistoryItem = ({ item, index }) => {
  const { t } = useLocale();
  const Icon = item.status === 'Converted' ? CheckCircle : GitPullRequest;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start"
    >
      <div className="flex flex-col items-center mr-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        {index < 100 && <div className="w-px h-8 bg-gray-200"></div>}
      </div>
      <div className="pt-1.5">
        <p className="font-medium text-gray-800">
          Status changed to <span className="font-bold">{t(`${item.status.replace(/[\s-]/g, '')}`)}</span>
        </p>
        <p className="text-sm text-gray-500 flex items-center mt-1">
          <Clock className="w-3 h-3 mr-1.5" />
          {new Date(item.updatedAt).toLocaleString()}
        </p>
        {item.updatedBy && <p className="text-sm text-gray-500">by {item.updatedBy}</p>}
      </div>
    </motion.div>
  );
};

const CustomerStatusHistory = ({ history }) => {
  const { t } = useLocale();

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>{t('details.noHistory')}</p>
      </div>
    );
  }
  
  const sortedHistory = [...history].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="space-y-0">
      <AnimatePresence>
        {sortedHistory.map((item, index) => (
          <HistoryItem key={item.updatedAt} item={item} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CustomerStatusHistory;