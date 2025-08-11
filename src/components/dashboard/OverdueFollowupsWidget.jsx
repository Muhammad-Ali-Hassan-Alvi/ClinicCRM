import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { getLeadStatusColor } from '@/lib/constants';
import { useLocale } from '@/contexts/LocaleContext';

const OverdueFollowupsWidget = ({ branchFilter }) => {
  const { leads, currentUser } = useData();
  const { t } = useLocale();

  const overdueLeads = leads.filter(lead => {
    const userBranches = currentUser?.branchIds || [];
    const isAdmin = currentUser?.role === 'Admin';
    const userHasAccess = isAdmin || userBranches.includes(lead.branchId);
    const matchesBranchFilter = isAdmin ? (branchFilter === 'all' || lead.branchId === branchFilter) : true;

    if (!userHasAccess || !matchesBranchFilter) return false;

    const leadDate = new Date(lead.date);
    const today = new Date();
    const diffTime = today - leadDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 3 && !['Converted', 'Lost', 'Booked'].includes(lead.status);
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const getDaysOverdue = (date) => {
    const leadDate = new Date(date);
    const today = new Date();
    const diffTime = today - leadDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
        Overdue Follow-ups
      </h3>
      
      {overdueLeads.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {overdueLeads.slice(0, 10).map(lead => (
            <div key={lead.id} className="p-3 bg-white/50 rounded-lg border border-white/30">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{lead.contactFullName}</h4>
                <Badge className={`${getLeadStatusColor(lead.status)} text-xs`}>
                  {t(`${lead.status.replace(' ', '')}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getDaysOverdue(lead.date)} days overdue</span>
                </div>
                <span>Source: {lead.leadSource}</span>
              </div>
            </div>
          ))}
          {overdueLeads.length > 10 && (
            <p className="text-sm text-gray-500 text-center">
              +{overdueLeads.length - 10} more overdue leads
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No overdue follow-ups. Great job!</p>
        </div>
      )}
    </motion.div>
  );
};

export default OverdueFollowupsWidget;