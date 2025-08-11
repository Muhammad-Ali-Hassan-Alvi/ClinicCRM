import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Filter, Users, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NewLeadDialog from '@/components/leads/NewLeadDialog';
import LeadKanbanBoard from '@/components/leads/LeadKanbanBoard';
import LeadDetailsDialog from '@/components/leads/LeadDetailsDialog';
import { useData } from '@/contexts/DataContext';
import ConvertLeadDialog from '@/components/leads/ConvertLeadDialog';
import ExportControls from '@/components/shared/ExportControls';
import { useLocale } from '@/contexts/LocaleContext';
import { agentOptions } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowUpView from '@/components/leads/FollowUpView';

const LeadsManagement = () => {
  const { leads, contacts, addLead, updateLead, convertLeadToCustomer, settings, currentUser } = useData();
  const { t } = useLocale();
  const [isNewLeadDialogOpen, setIsNewLeadDialogOpen] = useState(false);
  const [isConvertLeadDialogOpen, setIsConvertLeadDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateLead = (leadToUpdate) => {
    if (leadToUpdate.status === 'Converted' || leadToUpdate.status === 'Booked') {
      setLeadToConvert(leadToUpdate);
      setIsConvertLeadDialogOpen(true);
    } else {
      updateLead(leadToUpdate);
    }
  };

  const handleUpdateLeadStatusFromKanban = (leadId, newStatus) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      handleUpdateLead({ ...lead, status: newStatus });
    }
  };

  const handleConvertLead = async (appointmentDetails) => {
    if (leadToConvert) {
      const result = await convertLeadToCustomer(leadToConvert, appointmentDetails);
      if (result && result.success) {
        setLeadToConvert(null);
        setIsConvertLeadDialogOpen(false);
        setIsDetailsDialogOpen(false);
        return result;
      }
      return { success: false };
    }
    return { success: false };
  };

  const handleOpenDetails = (lead) => {
    setSelectedLead(lead);
    setIsDetailsDialogOpen(true);
  };

  const activeLeads = leads.filter(lead => lead.status !== 'No-Show' && lead.status !== 'Re-follow' && lead.status !== 'Converted');

  const filteredLeads = activeLeads.filter(lead => {
    const isAdmin = currentUser?.role === 'Admin';
    const lowerSearchTerm = searchTerm.toLowerCase();

    const matchesSearch = (lead.contactFullName || '').toLowerCase().includes(lowerSearchTerm) ||
                         (lead.contactPhoneNumber && lead.contactPhoneNumber.includes(searchTerm)) ||
                         (lead.leadSource && lead.leadSource.toLowerCase().includes(lowerSearchTerm)) ||
                         (lead.serviceOfInterest && lead.serviceOfInterest.toLowerCase().includes(lowerSearchTerm));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || lead.assignedAgent === agentFilter;
    const matchesDepartment = departmentFilter === 'all' || lead.serviceOfInterest === departmentFilter;
    
    const leadDate = new Date(lead.date);
    const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
    const toDate = dateToFilter ? new Date(dateToFilter) : null;
    
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    const matchesDate = 
      (!fromDate || leadDate >= fromDate) && 
      (!toDate || leadDate <= toDate);
      
    const matchesBranchFilter = !isAdmin || branchFilter === 'all' || lead.branchId === branchFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesBranchFilter && matchesAgent && matchesDepartment;
  });

  const exportColumns = [
    { key: 'contactFullName', label: t('tables.contactName') },
    { key: 'contactPhoneNumber', label: t('tables.phone') },
    { key: 'status', label: t('tables.status') },
    { key: 'leadSource', label: t('tables.source') },
    { key: 'serviceOfInterest', label: t('details.serviceOfInterest') },
    { key: 'assignedAgent', label: t('tables.assignedAgent') },
    { key: 'date', label: t('tables.date') },
    { key: 'notesData', label: t('tables.notes') },
    { key: 'branchId', label: t('tables.branch'), transform: (id) => settings.branches.find(b => b.id === id)?.name || 'N/A' },
  ];
  
  const kanbanStatuses = settings.leadStatuses.filter(s => s !== 'No-Show' && s !== 'Re-follow' && s !== 'Converted');

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{t('leadsManagement.title')}</h1>
              <p className="text-gray-600 text-lg">{t('leadsManagement.description')}</p>
            </div>
            <div className="flex items-center gap-4">
              <ExportControls data={filteredLeads} columns={exportColumns} filenamePrefix="Leads_Export" noteKey="notesData" />
              <Button onClick={() => setIsNewLeadDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5 me-2" />
                {t('leadsManagement.newLead')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pipeline">
            <Users className="w-4 h-4 mr-2" />
            Lead Pipeline
          </TabsTrigger>
          <TabsTrigger value="follow-up">
            <RotateCw className="w-4 h-4 mr-2" />
            Follow-Up Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <div className="glass-effect rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('leadsManagement.search')}</label>
                  <Input 
                    placeholder={t('leadsManagement.searchLeads')} 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('leadsManagement.status')}</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('contactManagement.allStatuses')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('contactManagement.allStatuses')}</SelectItem>
                      {kanbanStatuses.map(status => (<SelectItem key={status} value={status}>{t(`${status.replace(/[\s-]/g, '')}`)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('leadsManagement.dateFrom')}</label>
                  <Input type="date" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('leadsManagement.dateTo')}</label>
                  <Input type="date" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('leadsManagement.assignedAgent')}</label>
                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('leadsManagement.allAgents')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('leadsManagement.allAgents')}</SelectItem>
                      {agentOptions.map(agent => (<SelectItem key={agent} value={agent}>{t(`${agent.replace(/[\s-]/g, '')}`)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('leadsManagement.department')}</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('leadsManagement.allDepartments')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('leadsManagement.allDepartments')}</SelectItem>
                      {settings.departments.map(dept => (<SelectItem key={dept} value={dept}>{t(`${dept.replace(/[\s-]/g, '')}`)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                {currentUser?.role === 'Admin' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('tables.branch')}</label>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={t('settings.branches.all')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('settings.branches.all')}</SelectItem>
                        {settings.branches.map(branch => (<SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                <Filter className="w-4 h-4" />{filteredLeads.length} {t('leadsManagement.filterResult')} {activeLeads.length} {t('leadsManagement.leads')}
              </div>
            </div>
          </motion.div>

          {activeLeads.length > 0 ? (
            <LeadKanbanBoard leads={filteredLeads} onUpdateLeadStatus={handleUpdateLeadStatusFromKanban} leadStatusOptions={kanbanStatuses} onCardClick={handleOpenDetails} />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Target className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">{t('leadsManagement.noLeadsYet')}</h3>
              <p className="text-gray-500 mb-4">
                {contacts.length === 0 ? t('leadsManagement.noLeadsBodyWithContacts') : t('leadsManagement.noLeadsBody')}
              </p>
              {contacts.length > 0 && 
                <Button onClick={() => setIsNewLeadDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  <Plus className="w-4 h-4 me-2" />
                  {t('leadsManagement.createLead')}
                </Button>
              }
            </motion.div>
          )}
        </TabsContent>
        <TabsContent value="follow-up">
          <FollowUpView />
        </TabsContent>
      </Tabs>

      <NewLeadDialog 
        isOpen={isNewLeadDialogOpen} 
        onOpenChange={setIsNewLeadDialogOpen} 
        onAddLead={addLead}
        contacts={contacts}
        leadStatusOptions={settings.leadStatuses}
      />
      <ConvertLeadDialog
        isOpen={isConvertLeadDialogOpen}
        onOpenChange={setIsConvertLeadDialogOpen}
        onConvert={handleConvertLead}
        lead={leadToConvert}
      />
      <LeadDetailsDialog 
        isOpen={isDetailsDialogOpen} 
        onOpenChange={setIsDetailsDialogOpen} 
        lead={selectedLead} 
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
};

export default LeadsManagement;