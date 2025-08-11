import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Calendar, Building2, User, History, RotateCw, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/LocaleContext';
import { getLeadStatusColor } from '@/lib/constants';

const FollowUpCard = ({ lead, index, onCardClick, onReschedule }) => {
  const { t } = useLocale();

  const lastNote = lead.notesData && lead.notesData.length > 0 
    ? lead.notesData[lead.notesData.length - 1].text 
    : 'No notes available.';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{lead.contactFullName}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4" />
              {lead.contactPhoneNumber}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" asChild>
              <a href={`tel:${lead.contactPhoneNumber}`} onClick={(e) => e.stopPropagation()}><Phone className="w-4 h-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" asChild>
              <a href={`https://wa.me/${lead.contactPhoneNumber}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><MessageSquare className="w-4 h-4" /></a>
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <Badge className={`${getLeadStatusColor(lead.status)}`}>
            {t(`${lead.status.replace(/[\s-]/g, '')}`)}
          </Badge>
        </div>

        <div className="space-y-3 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>Missed Date: {new Date(lead.date).toLocaleDateString()}</span>
          </div>
          {lead.nextFollowupDate && (
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-red-500" />
              <span>Next Reminder: {new Date(lead.nextFollowupDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Original Dept: {lead.serviceOfInterest}</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-green-500" />
            <span>Agent: {lead.assignedAgent}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-1">Last Note:</p>
          <p className="text-sm text-gray-800 line-clamp-2">{lastNote}</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-4 border-t border-gray-100 grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" onClick={() => onCardClick(lead)}>
          <History className="w-4 h-4 mr-2" />
          View Details
        </Button>
        <Button 
          size="sm" 
          onClick={() => onReschedule(lead)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Reschedule
        </Button>
      </div>
    </motion.div>
  );
};

export default FollowUpCard;