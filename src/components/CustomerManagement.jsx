import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, HeartHandshake } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { customerStatusOptions } from '@/lib/constants';
import CustomersList from '@/components/customers/CustomersList';
import CustomerDetailsDialog from '@/components/customers/CustomerDetailsDialog';
import ExportControls from '@/components/shared/ExportControls';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useLocation } from 'react-router-dom';

const CustomerManagement = () => {
  const { customers, updateCustomer, settings, currentUser } = useData();
  const { t } = useLocale();
  const location = useLocation();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('details');

  // Handle navigation from lead conversion
  useEffect(() => {
    if (location.state?.openCustomerId && customers.length > 0) {
      const customerToOpen = customers.find(c => c.id === location.state.openCustomerId);
      if (customerToOpen) {
        setSelectedCustomer(customerToOpen);
        setIsDetailsDialogOpen(true);
        if (location.state.openAppointmentTab) {
          setActiveTab('appointments');
        }
        // Clear the state to prevent reopening on subsequent renders
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, customers]);

  const handleOpenDetails = (customer, defaultTab = 'details') => {
    setSelectedCustomer(customer);
    setActiveTab(defaultTab);
    setIsDetailsDialogOpen(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const isAdmin = currentUser?.role === 'Admin';

    const matchesSearch = (customer.contactFullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.contactPhoneNumber && customer.contactPhoneNumber.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || customer.department === departmentFilter;
    
    const matchesBranchFilter = !isAdmin || branchFilter === 'all' || customer.branchId === branchFilter;

    return matchesSearch && matchesStatus && matchesDepartment && matchesBranchFilter;
  }).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  const exportColumns = [
    { key: 'contactFullName', label: t('tables.customerName') },
    { key: 'contactPhoneNumber', label: t('tables.phone') },
    { key: 'leadSource', label: t('tables.leadSource') },
    { key: 'department', label: t('tables.department') },
    { key: 'appointmentDate', label: t('tables.appointmentDate') },
    { key: 'status', label: t('tables.status') },
    { key: 'branchId', label: t('tables.branch'), transform: (id) => settings.branches.find(b => b.id === id)?.name || 'N/A' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{t('customerManagement.title')}</h1>
              <p className="text-gray-600 text-lg">{t('customerManagement.description')}</p>
            </div>
            <ExportControls data={filteredCustomers} columns={exportColumns} filenamePrefix="Customers_Export" noteKey="notes" />
          </div>
        </div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder={t('customerManagement.searchCustomers')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10 bg-white/50 border-white/30" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder={t('customerManagement.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('customerManagement.allStatuses')}</SelectItem>
                {customerStatusOptions.map(status => (<SelectItem key={status} value={status}>{t(`${status.replace(/[\s-]/g, '')}`)}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger><SelectValue placeholder={t('customerManagement.allDepartments')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('customerManagement.allDepartments')}</SelectItem>
                {settings.departments.map(dept => (<SelectItem key={dept} value={dept}>{t(`${dept.replace(/[\s-]/g, '')}`)}</SelectItem>))}
              </SelectContent>
            </Select>
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
      </motion.div>

      <CustomersList customers={filteredCustomers} onRowClick={handleOpenDetails} />
      
      {filteredCustomers.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <HeartHandshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('customerManagement.noCustomersFound')}</h3>
          <p className="text-gray-500">
            {customers.length === 0 ? t('customerManagement.noCustomersBody') : t('customerManagement.noCustomersFilteredBody')}
          </p>
        </motion.div>
      )}

      <CustomerDetailsDialog 
        isOpen={isDetailsDialogOpen} 
        onOpenChange={setIsDetailsDialogOpen} 
        customer={selectedCustomer} 
        updateCustomer={updateCustomer}
        defaultTab={activeTab}
      />
    </div>
  );
};

export default CustomerManagement;