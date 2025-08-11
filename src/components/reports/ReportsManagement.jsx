import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileDown, Users, TrendingUp, UserCheck, AlertTriangle, Clock, Target, Award } from 'lucide-react';
import LeadSummaryPanel from '@/components/reports/LeadSummaryPanel';
import CustomerSummaryPanel from '@/components/reports/CustomerSummaryPanel';
import TicketSummaryPanel from '@/components/reports/TicketSummaryPanel';
import InteractiveDataView from '@/components/reports/InteractiveDataView';
import ExportControls from '@/components/shared/ExportControls';

const ReportsManagement = () => {
  const { leads, customers, tickets, settings, currentUser } = useData();
  const { t } = useLocale();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [activeView, setActiveView] = useState(null);

  const filteredData = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);

    const isWithinRange = (date) => {
      if (!date) return false;
      const d = new Date(date);
      return (!from || d >= from) && (!to || d <= to);
    };

    const matchesFilters = (item) => {
      const matchesDept = departmentFilter === 'all' || item.department === departmentFilter;
      const matchesAgent = agentFilter === 'all' || item.assignedAgent === agentFilter || item.assignedTo === agentFilter;
      const matchesBranch = currentUser.role !== 'Admin' || branchFilter === 'all' || item.branchId === branchFilter;
      return matchesDept && matchesAgent && matchesBranch;
    };

    const fLeads = leads.filter(l => isWithinRange(l.createdAt) && matchesFilters(l));
    const fCustomers = customers.filter(c => isWithinRange(c.appointmentDate) && matchesFilters(c));
    const fTickets = tickets.filter(t => isWithinRange(t.createdAt) && matchesFilters(t));

    return { leads: fLeads, customers: fCustomers, tickets: fTickets };
  }, [leads, customers, tickets, dateFrom, dateTo, departmentFilter, agentFilter, branchFilter, currentUser.role]);

  const summaryStats = useMemo(() => {
    const { leads: fLeads, customers: fCustomers, tickets: fTickets } = filteredData;
    
    const convertedCustomerIds = fCustomers.filter(c => c.leadCreatedAt).map(c => c.id);
    const convertedLeads = fLeads.filter(l => convertedCustomerIds.includes(l.id));
    const conversionRate = fLeads.length > 0 ? (convertedLeads.length / fLeads.length) * 100 : 0;
    
    const noShows = fCustomers.filter(c => c.status === 'No-Show').length;
    const showRate = fCustomers.length > 0 ? ((fCustomers.length - noShows) / fCustomers.length) * 100 : 0;
    
    const openTickets = fTickets.filter(t => ['Open', 'In Progress'].includes(t.status)).length;
    const resolvedTickets = fTickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;
    const resolutionRate = fTickets.length > 0 ? (resolvedTickets / fTickets.length) * 100 : 0;

    return {
      totalLeads: fLeads.length,
      conversionRate,
      totalCustomers: fCustomers.length,
      showRate,
      noShows,
      totalTickets: fTickets.length,
      openTickets,
      resolutionRate
    };
  }, [filteredData]);

  const handleDataClick = (type, filter = {}) => {
    setActiveView({ type, filter, data: filteredData[type] });
  };

  const exportColumns = {
    leads: [
      { key: 'contactFullName', label: t('tables.contactName') },
      { key: 'status', label: t('tables.status') },
      { key: 'leadSource', label: t('tables.source') },
      { key: 'assignedAgent', label: t('tables.assignedAgent') },
      { key: 'date', label: t('tables.date') },
      { key: 'branchId', label: t('tables.branch'), transform: (id) => settings.branches.find(b => b.id === id)?.name || 'N/A' },
    ],
    customers: [
      { key: 'contactFullName', label: t('tables.customerName') },
      { key: 'department', label: t('tables.department') },
      { key: 'status', label: t('tables.status') },
      { key: 'appointmentDate', label: t('tables.appointmentDate'), transform: (date) => new Date(date).toLocaleString() },
      { key: 'branchId', label: t('tables.branch'), transform: (id) => settings.branches.find(b => b.id === id)?.name || 'N/A' },
    ],
    tickets: [
      { key: 'subject', label: t('tables.subject') },
      { key: 'customerName', label: t('tables.customerName') },
      { key: 'status', label: t('tables.status') },
      { key: 'priority', label: t('tables.priority') },
      { key: 'assignedTo', label: t('tables.assignedAgent') },
      { key: 'branchId', label: t('tables.branch'), transform: (id) => settings.branches.find(b => b.id === id)?.name || 'N/A' },
    ]
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{t('reports.title')}</h1>
              <p className="text-gray-600 text-lg">{t('reports.description')}</p>
            </div>
            <div className="flex items-center gap-4">
              <ExportControls 
                data={[...filteredData.leads, ...filteredData.customers, ...filteredData.tickets]} 
                columns={[...exportColumns.leads, ...exportColumns.customers, ...exportColumns.tickets]} 
                filenamePrefix="Complete_Report" 
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">{t('reports.filterByDate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('reports.from')}</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('reports.to')}</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('tables.department')}</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger><SelectValue placeholder={t('customerManagement.allDepartments')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('customerManagement.allDepartments')}</SelectItem>
                    {settings?.departments?.map(dept => (
                      <SelectItem key={dept} value={dept}>{t(`${dept.replace(/[\s-]/g, '')}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('tables.assignedAgent')}</label>
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger><SelectValue placeholder={t('leadsManagement.allAgents')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('leadsManagement.allAgents')}</SelectItem>
                    {settings?.agents?.map(agent => (
                      <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentUser?.role === 'Admin' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t('tables.branch')}</label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger><SelectValue placeholder={t('settings.branches.all')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('settings.branches.all')}</SelectItem>
                      {settings.branches?.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-effect border-0 cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleDataClick('leads')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('reports.totalLeads')}</p>
                <p className="text-3xl font-bold text-blue-600">{summaryStats.totalLeads}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryStats.conversionRate.toFixed(1)}% {t('reports.conversionRate').toLowerCase()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-0 cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleDataClick('customers')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('customerManagement.totalCustomers')}</p>
                <p className="text-3xl font-bold text-green-600">{summaryStats.totalCustomers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryStats.showRate.toFixed(1)}% show rate
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-0 cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleDataClick('customers', { status: 'No-Show' })}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('reports.noShows')}</p>
                <p className="text-3xl font-bold text-red-600">{summaryStats.noShows}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryStats.totalCustomers > 0 ? ((summaryStats.noShows / summaryStats.totalCustomers) * 100).toFixed(1) : 0}% of appointments
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-0 cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => handleDataClick('tickets')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('ticketsManagement.totalTickets')}</p>
                <p className="text-3xl font-bold text-purple-600">{summaryStats.totalTickets}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryStats.openTickets} open, {summaryStats.resolutionRate.toFixed(1)}% resolved
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t('sidebar.leads')}
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('sidebar.customers')}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {t('sidebar.tickets')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <LeadSummaryPanel 
              leads={filteredData.leads} 
              onDataClick={handleDataClick}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerSummaryPanel 
              customers={filteredData.customers} 
              onDataClick={handleDataClick}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketSummaryPanel 
              tickets={filteredData.tickets} 
              onDataClick={handleDataClick}
              settings={settings}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {activeView && (
        <InteractiveDataView 
          view={activeView} 
          onClose={() => setActiveView(null)}
          exportColumns={exportColumns}
        />
      )}
    </div>
  );
};

export default ReportsManagement;