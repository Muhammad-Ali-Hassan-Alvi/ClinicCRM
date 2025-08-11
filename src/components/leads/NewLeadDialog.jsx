import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { sourceOptions, agentOptions } from '@/lib/constants';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import ContactSearch from './ContactSearch';
import NewContactDialog from '@/components/contacts/NewContactDialog';
import { AlertTriangle, X } from 'lucide-react';

const NewLeadDialog = ({ isOpen, onOpenChange, onAddLead, contacts, leadStatusOptions }) => {
  const { currentUser, settings, addContact } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);

  const getInitialFormData = () => ({
    contactId: '',
    leadSource: '',
    serviceOfInterest: '',
    date: new Date().toISOString().split('T')[0],
    assignedAgent: 'Unassigned',
    status: 'Fresh',
    notes: ''
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const availableContacts = contacts.filter(c => {
    if (currentUser?.role === 'Admin') return true;
    return currentUser?.branchIds?.includes(c.branchId);
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, contacts, currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactId) {
      toast({
        title: t('toasts.validationError.title'),
        description: t('toasts.contactRequired'),
        variant: "destructive"
      });
      return;
    }
    
    const selectedContact = contacts.find(c => c.id === formData.contactId);
    if (!selectedContact) {
      toast({
        title: t('toasts.error'),
        description: 'Selected contact not found. Please select a valid contact.',
        variant: "destructive"
      });
      return;
    }

    const newLead = { 
      ...formData, 
      contactFullName: selectedContact.fullName,
      contactPhoneNumber: selectedContact.phoneNumber,
      branchId: selectedContact.branchId,
    };
    
    const success = await onAddLead(newLead);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleAddNewContact = () => {
    setIsNewContactDialogOpen(true);
  };

  const handleContactAdded = async (newContactData) => {
    const success = await addContact(newContactData);
    if (success) {
      setIsNewContactDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">{t('Add New Lead')}</h2>
                    <p className="text-gray-600 mt-1">{t('New Lead')}</p>
                  </div> 
                  <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {availableContacts.length > 0 ? (
                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto">
                  <div>
                    <Label htmlFor="contactId" className="flex items-center gap-2">
                      {t('Contact')} 
                      <span className="text-red-500">*</span>
                    </Label>
                    <ContactSearch
                      contacts={availableContacts}
                      selectedContactId={formData.contactId}
                      onSelectContact={(contactId) => handleInputChange('contactId', contactId)}
                      onAddNewContact={handleAddNewContact}
                    />
                    {!formData.contactId && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {t('Contact Required')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="leadSource">{t('Lead Source')}</Label>
                      <Select value={formData.leadSource} onValueChange={(value) => handleInputChange('leadSource', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('Select Source')} />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceOptions.map(s => (
                            <SelectItem key={s} value={s}>{t(`${s.replace(/[\s-]/g, '')}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="serviceOfInterest">{t('Service Of Interest')}</Label>
                      <Select value={formData.serviceOfInterest} onValueChange={(value) => handleInputChange('serviceOfInterest', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('Select Service')} />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{t(`${dept.replace(/[\s-]/g, '')}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">{t('Date')}</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={formData.date} 
                        onChange={(e) => handleInputChange('date', e.target.value)} 
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignedAgent">{t('Assigned Agent')}</Label>
                      <Select value={formData.assignedAgent} onValueChange={(value) => handleInputChange('assignedAgent', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agentOptions.map(a => (
                            <SelectItem key={a} value={a}>{t(`${a.replace(/[\s-]/g, '')}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">{t('Status')}</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {leadStatusOptions.filter(s => s !== 'Converted' && s !== 'Booked' && s !== 'No-Show').map(s => (
                          <SelectItem key={s} value={s}>{t(`${s.replace(/[\s-]/g, '')}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">{t('Notes')}</Label>
                    <Textarea 
                      id="notes" 
                      value={formData.notes} 
                      onChange={(e) => handleInputChange('notes', e.target.value)} 
                      placeholder={t('Notes')} 
                      className="mt-1" 
                      rows={3} 
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      {t('actions.cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      disabled={!formData.contactId}
                    >
                      {t('leadsManagement.newLead')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center">
                   <h3 className="text-xl font-semibold text-gray-700">{t('noContacts')}</h3>
                   <p className="text-gray-500 mt-2">{t('noContactsDesc')}</p>
                   <Button className="mt-4" onClick={() => onOpenChange(false)}>{t('actions.cancel')}</Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </Dialog>
      <NewContactDialog
        isOpen={isNewContactDialogOpen}
        onOpenChange={setIsNewContactDialogOpen}
        onAddContact={handleContactAdded}
      />
    </>
  );
};

export default NewLeadDialog;