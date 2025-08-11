import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Edit2, Zap, Phone, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getLeadStatusColor } from '@/lib/constants';
import { useLocale } from '@/contexts/LocaleContext';

const LeadCard = ({ lead, index, onCardClick }) => {
  const { t } = useLocale();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300 cursor-pointer"
      onClick={() => onCardClick(lead)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">{lead.contactFullName}</h4>
          <p className="text-xs text-gray-500">{lead.contactPhoneNumber}</p>
        </div>
        <Badge className={`${getLeadStatusColor(lead.status)} text-xs`}>
          {t(`${lead.status.replace(/[\s-]/g, '')}`)}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        {lead.leadSource && (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>{t('details.sourcePrefix')}: {t(`${lead.leadSource.replace(/[\s-]/g, '')}`)}</span>
          </div>
        )}
        
        {lead.serviceOfInterest && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-500" />
            <span>{t('details.servicePrefix')}: {t(`${lead.serviceOfInterest.replace(/[\s-]/g, '')}`)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span>{t('details.agentPrefix')}: {t(`${lead.assignedAgent.replace(/[\s-]/g, '')}`)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-500" />
          <span>{t('details.datePrefix')}: {new Date(lead.date).toLocaleDateString()}</span>
        </div>
        
        {lead.notesData && lead.notesData.length > 0 && (
          <div className="flex items-start gap-2 pt-1">
            <Edit2 className="w-4 h-4 text-orange-500 mt-0.5" />
            <p className="line-clamp-2 text-xs">{lead.notesData[0].text}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LeadCard;