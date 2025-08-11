import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Filter, Search, Calendar, Building2, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FollowUpCard from './FollowUpCard';
import LeadDetailsDialog from '@/components/leads/LeadDetailsDialog';
import ConvertLeadDialog from '@/components/leads/ConvertLeadDialog';

const FollowUpCenter = () => {
  const { leads, settings, currentUser, updateLead, convertLeadToCustomer } = useData();
  const { t } = useLocale();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  const noShowLeads = useMemo(() => {
    return leads.filter(lead => lead.status === 'No-Show' || lead.status === 'Re-follow');
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return noShowLeads.filter(lead => {
      const isAdmin = currentUser?.role === 'Admin';
      const lowerSearchTerm = searchTerm.toLowerCase();

      const matchesSearch = (lead.contactFullName || '').toLowerCase().includes(lowerSearchTerm) ||
                           (lead.contactPhoneNumber && lead.contactPhoneNumber.includes(searchTerm));
      const matchesBranch = !isAdmin || branchFilter === 'all' || lead.branchId === branchFilter;
      const matchesDepartment = departmentFilter === 'all' || lead.serviceOfInterest === departmentFilter;
      const matchesAgent = agentFilter === 'all' || lead.assignedAgent === agentFilter;

      const leadDate = new Date(lead.date);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);
      const matchesDate = (!fromDate || leadDate >= fromDate) && (!toDate || leadDate <= toDate);

      return matchesSearch && matchesBranch && matchesDepartment && matchesAgent && matchesDate;
    });
  }, [noShowLeads, searchTerm, branchFilter, departmentFilter, agentFilter, dateFromFilter, dateToFilter, currentUser]);

  const handleCardClick = (lead) => {
    setSelectedLead(lead);
    setIsDetailsOpen(true);
  };

  const handleReschedule = (lead) => {
    setLeadToConvert(lead);
    setIsConvertOpen(true);
  };

  const handleUpdateLead = (leadToUpdate) => {
    if (leadToUpdate.status === 'Converted' || leadToUpdate.status === 'Booked') {
      setLeadToConvert(leadToUpdate);
      setIsConvertOpen(true);
    } else {
      updateLead(leadToUpdate);
    }
  };

  const handleConvertLead = async (appointmentDetails) => {
    if (leadToConvert) {
      const result = await convertLeadToCustomer(leadToConvert, appointmentDetails);
      if (result && result.success) {
        setLeadToConvert(null);
        setIsConvertOpen(false);
        setIsDetailsOpen(false);
        return result;
      }
      return { success: false };
    }
    return { success: false };
  };

  const stats = {
    total: noShowLeads.length,
    highPriority: noShowLeads.filter(l => l.priority === 'High').length,
    needsAction: noShowLeads.filter(l => new Date(l.nextFollowupDate) < new Date()).length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
                <RotateCw className="w-10 h-10" />
                Follow-Up Center
              </h1>
              <p className="text-gray-600 text-lg">Manage and re-engage with no-show customers.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700">Total No-Shows</h3>
          <p className="text-4xl font-bold gradient-text">{stats.total}</p>
        </div>
        <div className="glass-effect p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700">High Priority</h3>
          <p className="text-4xl font-bold gradient-text">{stats.highPriority}</p>
        </div>
        <div className="glass-effect p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700">Overdue Follow-up</h3>
          <p className="text-4xl font-bold gradient-text">{stats.needsAction}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Search className="w-4 h-4" /> Search</label>
              <Input placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> From</label>
              <Input type="date" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> To</label>
              <Input type="date" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Building2 className="w-4 h-4" /> Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {settings.departments.map(dept => (<SelectItem key={dept} value={dept}>{t(`${dept.replace(/[\s-]/g, '')}`)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {currentUser?.role === 'Admin' && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Branch</label>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {settings.branches.map(branch => (<SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
            <Filter className="w-4 h-4" />{filteredLeads.length} of {noShowLeads.length} follow-ups match your filters.
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead, index) => (
          <FollowUpCard 
            key={lead.id} 
            lead={lead} 
            index={index} 
            onCardClick={handleCardClick}
            onReschedule={handleReschedule}
          />
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <RotateCw className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Follow-Ups Found</h3>
          <p className="text-gray-500">
            {noShowLeads.length === 0 ? "There are currently no no-show customers to follow up with." : "No records match your current filters."}
          </p>
        </motion.div>
      )}

      <LeadDetailsDialog 
        isOpen={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
        lead={selectedLead} 
        onUpdateLead={handleUpdateLead}
      />
      <ConvertLeadDialog
        isOpen={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        onConvert={handleConvertLead}
        lead={leadToConvert}
      />
    </div>
  );
};

export default FollowUpCenter;