import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Users, UserCheck, Ticket, HeartHandshake, Phone } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { useData } from '@/contexts/DataContext';
import useHistoryData from '@/hooks/useHistoryData';
import HistoryViewer from '@/components/shared/HistoryViewer';

const HistoryManagement = () => {
  const { t } = useLocale();
  const { currentUser, settings } = useData();
  const { 
    contactHistory, 
    leadHistory, 
    customerHistory, 
    ticketHistory, 
    userLoginHistory,
    loading 
  } = useHistoryData();
  
  const [selectedBranch, setSelectedBranch] = useState('all');

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const filterHistoryByBranch = (history) => {
    console.log(history)
    if (selectedBranch === 'all') return history;
    return history.filter(item => item.branch_id === selectedBranch);
  };

  const getHistoryStats = (history) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const todayCount = history.filter(item => {
      const itemDate = new Date(item.changed_at || item.login_time);
      return itemDate >= today;
    }).length;
    
    const weekCount = history.filter(item => {
      const itemDate = new Date(item.changed_at || item.login_time);
      return itemDate >= thisWeek;
    }).length;
    
    return { total: history.length, today: todayCount, week: weekCount };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const filteredContactHistory = filterHistoryByBranch(contactHistory);
  const filteredLeadHistory = filterHistoryByBranch(leadHistory);
  const filteredCustomerHistory = filterHistoryByBranch(customerHistory);
  const filteredTicketHistory = filterHistoryByBranch(ticketHistory);
  const filteredLoginHistory = filterHistoryByBranch(userLoginHistory);
  
  const contactStats = getHistoryStats(filteredContactHistory);
  const leadStats = getHistoryStats(filteredLeadHistory);
  const customerStats = getHistoryStats(filteredCustomerHistory);
  const ticketStats = getHistoryStats(filteredTicketHistory);
  const loginStats = getHistoryStats(filteredLoginHistory);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{t('Management')}</h1>
              <p className="text-gray-600 text-lg">{t('Audit Log History Description')}</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('settings.branches.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('settings.branches.all')}</SelectItem>
                  {settings.branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sidebar.contacts')}</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {contactStats.today} today, {contactStats.week} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sidebar.leads')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {leadStats.today} today, {leadStats.week} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sidebar.customers')}</CardTitle>
            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.today} today, {customerStats.week} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sidebar.tickets')}</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {ticketStats.today} today, {ticketStats.week} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('User Logins')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loginStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {loginStats.today} today, {loginStats.week} this week
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* History Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-2xl p-6">
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contacts">{t('sidebar.contacts')}</TabsTrigger>
            <TabsTrigger value="leads">{t('sidebar.leads')}</TabsTrigger>
            <TabsTrigger value="customers">{t('sidebar.customers')}</TabsTrigger>
            <TabsTrigger value="tickets">{t('sidebar.tickets')}</TabsTrigger>
            <TabsTrigger value="logins">{t('User Logins')}</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="mt-6">
            <HistoryViewer 
              history={filteredContactHistory}
              title={t('Contact History')}
              type="contact"
            />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <HistoryViewer 
              history={filteredLeadHistory}
              title={t('Lead History')}
              type="lead"
            />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <HistoryViewer 
              history={filteredCustomerHistory}
              title={t('Customer History')}
              type="customer"
            />
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <HistoryViewer 
              history={filteredTicketHistory}
              title={t('Ticket History')}
              type="ticket"
            />
          </TabsContent>

          <TabsContent value="logins" className="mt-6">
            <HistoryViewer 
              history={filteredLoginHistory}
              title={t('Login History')}
              type="login"
              showUserFilter={true}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default HistoryManagement;