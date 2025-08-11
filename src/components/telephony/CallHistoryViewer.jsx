import React from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, User, Timer } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { Badge } from '@/components/ui/badge';

const CallHistoryViewer = ({ callLogs, loading }) => {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getCallIcon = (type, status) => {
    if (status === 'missed' || status === 'failed') return <PhoneMissed className="w-5 h-5 text-red-500" />;
    if (type === 'incoming') return <PhoneIncoming className="w-5 h-5 text-blue-500" />;
    if (type === 'outgoing') return <PhoneOutgoing className="w-5 h-5 text-green-500" />;
    return <Phone className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {callLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">{t('No Call History')}</h3>
          <p>{t('No Call History Description')}</p>
        </div>
      ) : (
        callLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-start gap-4 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mt-1">
              {getCallIcon(log.call_type, log.status)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">
                  {log.call_type === 'incoming' ? `From: ${log.from_number}` : `To: ${log.to_number}`}
                </p>
                <Badge className={getStatusBadge(log.status)}>{t(`calls.status.${log.status}`, { defaultValue: log.status })}</Badge>
              </div>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /><span>{new Date(log.created_at).toLocaleString()}</span></div>
                {log.duration_seconds && (
                  <div className="flex items-center gap-1.5"><Timer className="w-3 h-3" /><span>{log.duration_seconds}s</span></div>
                )}
                {log.user_id && <div className="flex items-center gap-1.5"><User className="w-3 h-3" /><span>{log.user_id}</span></div>}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default CallHistoryViewer;