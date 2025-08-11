import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { getCustomerStatusColor } from '@/lib/constants';
import { useLocale } from '@/contexts/LocaleContext';

const TodaysAppointmentsWidget = ({ branchFilter }) => {
  const { customers, currentUser } = useData();
  const { t } = useLocale();

  const todaysAppointments = customers.filter(customer => {
    const appointmentDate = new Date(customer.appointmentDate);
    const today = new Date();
    const isToday = appointmentDate.toDateString() === today.toDateString();
    
    const userBranches = currentUser?.branchIds || [];
    const isAdmin = currentUser?.role === 'Admin';
    const userHasAccess = isAdmin || userBranches.includes(customer.branchId);
    const matchesBranchFilter = isAdmin ? (branchFilter === 'all' || customer.branchId === branchFilter) : true;

    return isToday && userHasAccess && matchesBranchFilter;
  }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-600" />
        {t('dashboard.todaysAppointments')}
      </h3>
      
      {todaysAppointments.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {todaysAppointments.map(customer => (
            <div key={customer.id} className="p-3 bg-white/50 rounded-lg border border-white/30">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{customer.contactFullName}</h4>
                <Badge className={`${getCustomerStatusColor(customer.status)} text-xs`}>
                  {t(`${customer.status.replace('-', '')}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(customer.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{customer.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t('dashboard.noAppointments')}</p>
        </div>
      )}
    </motion.div>
  );
};

export default TodaysAppointmentsWidget;