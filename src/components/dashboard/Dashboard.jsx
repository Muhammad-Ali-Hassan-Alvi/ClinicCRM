import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import TodaysAppointmentsWidget from '@/components/dashboard/TodaysAppointmentsWidget';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import OverdueFollowupsWidget from '@/components/dashboard/OverdueFollowupsWidget';
import BirthdayRemindersWidget from '@/components/dashboard/BirthdayRemindersWidget';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const { t } = useLocale();
  const { currentUser, settings } = useData();

  const [branchFilter, setBranchFilter] = useState(
    currentUser?.branchIds?.length > 0 ? currentUser.branchIds[0] : 'all'
  );

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8"
      >
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{t('dashboard.title')}</h1>
              <p className="text-gray-600 text-lg">{t('dashboard.description')}</p>
            </div>
            {currentUser?.role === 'Admin' && (
              <div className="w-64">
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('settings.branches.all')}</SelectItem>
                    {settings?.branches?.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-6">
        <DashboardStatCards branchFilter={branchFilter} />
        <DashboardQuickActions />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodaysAppointmentsWidget branchFilter={branchFilter} />
          <BirthdayRemindersWidget branchFilter={branchFilter} />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <OverdueFollowupsWidget branchFilter={branchFilter} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;