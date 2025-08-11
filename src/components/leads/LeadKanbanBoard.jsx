import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadCard from '@/components/leads/LeadCard';
import { getLeadStatusColor } from '@/lib/constants';
import { useLocale } from '@/contexts/LocaleContext';

const LeadKanbanBoard = ({ leads, onUpdateLeadStatus, leadStatusOptions, onCardClick }) => {
  const { t } = useLocale();
  const handleDragEnd = (event, info) => {
    const dropTarget = event.target.closest('[data-status]');
    if (dropTarget) {
      const newStatus = dropTarget.dataset.status;
      const leadId = event.target.dataset.leadid;
      if (newStatus && leadId) {
        onUpdateLeadStatus(leadId, newStatus);
      }
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
      {leadStatusOptions.map(status => {
        const leadsInStatus = leads.filter(lead => lead.status === status);
        return (
          <div
            key={status}
            data-status={status}
            className="kanban-column"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getLeadStatusColor(status)}`}></span>
                <h3 className="font-semibold text-gray-700">{t(`${status.replace(' ', '')}`)}</h3>
              </div>
              <span className="text-sm font-bold text-gray-500 bg-gray-200/80 rounded-full px-2 py-0.5">{leadsInStatus.length}</span>
            </div>
            <motion.div layout className="space-y-4 h-full">
              <AnimatePresence>
                {leadsInStatus.map((lead, index) => (
                  <motion.div
                    key={lead.id}
                    data-leadid={lead.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    layoutId={lead.id}
                  >
                    <LeadCard lead={lead} index={index} onCardClick={onCardClick} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadKanbanBoard;