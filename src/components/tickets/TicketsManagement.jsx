import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NewTicketDialog from '@/components/tickets/NewTicketDialog';
import TicketDetailsDialog from '@/components/tickets/TicketDetailsDialog';
import TicketsList from '@/components/tickets/TicketsList';
import ExportControls from '@/components/shared/ExportControls';
import { useLocale } from '@/contexts/LocaleContext';
import { ticketStatusOptions } from '@/lib/constants';

const TicketsManagement = () => {
    const { tickets, customers, users, settings, addTicket, updateTicket, currentUser } = useData();
    const { t } = useLocale();
    const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [assignedToFilter, setAssignedToFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');

    const handleOpenDetails = (ticket) => {
        setSelectedTicket(ticket);
        setIsDetailsDialogOpen(true);
    };

    const filteredTickets = tickets.filter(ticket => {
      const isAdmin = currentUser?.role === 'Admin';
      
      const ticketDate = new Date(ticket.createdAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || ticket.department === departmentFilter;
      const matchesAssigned = assignedToFilter === 'all' || ticket.assignedTo === assignedToFilter;
      const matchesDate = (!fromDate || ticketDate >= fromDate) && (!toDate || ticketDate <= toDate);
      
      const matchesBranchFilter = !isAdmin || branchFilter === 'all' || ticket.branchId === branchFilter;

      return matchesStatus && matchesDepartment && matchesAssigned && matchesDate && matchesBranchFilter;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const exportColumns = [
      { key: 'id', label: t('Ticket Id') },
      { key: 'subject', label: t('Subject') },
      { key: 'customerName', label: t('Customer Name') },
      { key: 'status', label: t('Status') },
      { key: 'priority', label: t('Priority') },
      { key: 'assignedTo', label: t('Assigned To') },
      { key: 'createdAt', label: t('Created At') },
      { key: 'branchId', label: t('Branch'), transform: (id) => settings.branches.find(b => b.id === id)?.name || 'N/A' },
    ];
    
    const availableUsers = useMemo(() => [{name: 'all'}, {name: 'Unassigned'}, ...users], [users]);

    return (
        <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="glass-effect rounded-2xl p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold gradient-text mb-2">{t('ticketsManagement.title')}</h1>
                            <p className="text-gray-600 text-lg">{t('ticketsManagement.description')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <ExportControls data={filteredTickets} columns={exportColumns} filenamePrefix="Tickets_Export" noteKey="notes" />
                            <Button onClick={() => setIsNewTicketDialogOpen(true)} className="bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                <Plus className="w-5 h-5 me-2" />
                                {t('New Ticket')}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="glass-effect rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger><SelectValue placeholder={t('customerManagement.allStatuses')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('customerManagement.allStatuses')}</SelectItem>
                            {ticketStatusOptions.map(status => (<SelectItem key={status} value={status}>{t(`${status.replace(/[\s-]/g, '')}`)}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger><SelectValue placeholder={t('customerManagement.allDepartments')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('customerManagement.allDepartments')}</SelectItem>
                            {settings?.departments.map(dept => (<SelectItem key={dept} value={dept}>{t(`${dept.replace(/[\s-]/g, '')}`)}</SelectItem>))}
                        </SelectContent>
                    </Select>
                     <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                        <SelectTrigger><SelectValue placeholder={t('customerManagement.allUsers')} /></SelectTrigger>
                        <SelectContent>
                           {availableUsers.map(u => (<SelectItem key={u.name} value={u.name}>{u.name === 'all' ? t('All Users') : u.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                     {currentUser?.role === 'Admin' && (
                      <Select value={branchFilter} onValueChange={setBranchFilter}>
                        <SelectTrigger><SelectValue placeholder={t('settings.branches.all')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('settings.branches.all')}</SelectItem>
                            {settings.branches.map(branch => (<SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    )}
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <TicketsList tickets={filteredTickets} onRowClick={handleOpenDetails} />
            </motion.div>
            
            <NewTicketDialog
                isOpen={isNewTicketDialogOpen}
                onOpenChange={setIsNewTicketDialogOpen}
                onAddTicket={addTicket}
            />
            <TicketDetailsDialog 
                isOpen={!!selectedTicket} 
                onOpenChange={(isOpen) => !isOpen && setSelectedTicket(null)} 
                ticket={selectedTicket}
                onUpdateTicket={updateTicket}
            />
        </div>
    );
};

export default TicketsManagement;