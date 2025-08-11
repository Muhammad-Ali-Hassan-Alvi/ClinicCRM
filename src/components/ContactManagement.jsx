import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Users, GitBranch, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sourceOptions } from '@/lib/constants';
import NewContactDialog from '@/components/contacts/NewContactDialog';
import ContactsList from '@/components/contacts/ContactsList';
import ContactDetailsDialog from '@/components/contacts/ContactDetailsDialog';
import AddContactByPhoneDialog from '@/components/whatsapp/AddContactByPhoneDialog';
import ExportControls from '@/components/shared/ExportControls';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';

const ContactManagement = () => {
  const { contacts, addContact, updateContact, settings, currentUser } = useData();
  const { t } = useLocale();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAddByPhoneDialogOpen, setIsAddByPhoneDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const handleOpenDetails = (contact) => {
    setSelectedContact(contact);
    setIsDetailsDialogOpen(true);
  };

  const filteredContacts = contacts.filter(contact => {
    const userBranches = currentUser?.branch_ids || [];
    const isAdmin = currentUser?.role === 'Admin';
    const lowerSearchTerm = searchTerm.toLowerCase();

    const matchesSearch = (contact.fullName || '').toLowerCase().includes(lowerSearchTerm) ||
                         (contact.phoneNumber || '').includes(searchTerm) ||
                         (contact.secondaryPhoneNumber && contact.secondaryPhoneNumber.includes(searchTerm)) ||
                         (contact.address && contact.address.toLowerCase().includes(lowerSearchTerm)) ||
                         (contact.instagramUrl && contact.instagramUrl.toLowerCase().includes(lowerSearchTerm));

    const matchesSource = sourceFilter === 'all' || contact.source === sourceFilter;
    
    // Filtering is now handled by DataContext based on activeBranch, so we only need admin-specific filtering here.
    const matchesBranchFilter = !isAdmin || branchFilter === 'all' || contact.branchId === branchFilter;

    return matchesSearch && matchesSource && matchesBranchFilter;
  }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const exportColumns = [
    { key: 'fullName', label: t('tables.fullName') },
    { key: 'phoneNumber', label: t('tables.phone') },
    { key: 'secondaryPhoneNumber', label: t('contactManagement.addDialog.secondaryPhoneNumber') },
    { key: 'address', label: t('tables.address') },
    { key: 'source', label: t('tables.source') },
    { key: 'birthday', label: t('tables.birthday') },
    { key: 'instagramUrl', label: t('details.instagramUrl') },
    { key: 'createdAt', label: t('tables.createdAt') },
    { key: 'branchId', label: t('tables.branch'), transform: (id) => settings.branches.find(b => b.id === id)?.name || 'N/A' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{t('contactManagement.title')}</h1>
              <p className="text-gray-600 text-lg">{t('contactManagement.description')}</p>
            </div>
            <div className="flex items-center gap-4">
              <ExportControls data={filteredContacts} columns={exportColumns} filenamePrefix="Contacts_Export" noteKey="notes" />
              <Button onClick={() => setIsAddByPhoneDialogOpen(true)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Phone className="w-5 h-5 me-2" />
                Add by Phone
              </Button>
              <Button onClick={() => setIsNewDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5 me-2" />
                {t('contactManagement.newContact')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder={t('contactManagement.searchContacts')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10 bg-white/50 border-white/30" />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
               <SelectTrigger><SelectValue placeholder={t('contactManagement.allSources')} /></SelectTrigger>
               <SelectContent>
                <SelectItem value="all">{t('contactManagement.allSources')}</SelectItem>
                {sourceOptions.map(source => (<SelectItem key={source} value={source}>{t(`${source.replace(/[\s-]/g, '')}`)}</SelectItem>))}
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

      <ContactsList contacts={filteredContacts} onRowClick={handleOpenDetails} />
      
      {filteredContacts.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('contactManagement.noContactsFound')}</h3>
          <p className="text-gray-500">
            {contacts.length === 0 ? t('contactManagement.noContactsBody') : t('contactManagement.noContactsFilteredBody')}
          </p>
        </motion.div>
      )}

      <NewContactDialog isOpen={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} onAddContact={addContact} />
      <AddContactByPhoneDialog isOpen={isAddByPhoneDialogOpen} onOpenChange={setIsAddByPhoneDialogOpen} />
      <ContactDetailsDialog isOpen={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} contact={selectedContact} updateContact={updateContact} />
    </div>
  );
};

export default ContactManagement;