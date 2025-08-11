import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { ticketPriorityOptions, ticketStatusOptions } from '@/lib/constants';

const NewTicketDialog = ({ isOpen, onOpenChange, onAddTicket, selectedCustomer }) => {
  const { customers, users, settings, currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();

  const getInitialFormData = () => ({
    customerId: selectedCustomer?.id || '',
    subject: '',
    department: settings.departments[0] || '',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Unassigned',
    description: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const availableCustomers = customers.filter(c => {
    if (currentUser.role === 'Admin') return true;
    return currentUser.branchIds.includes(c.branchId);
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, selectedCustomer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.subject || !formData.description || !formData.department) {
      toast({ title: t('toasts.requiredFields.title'), description: t('toasts.requiredFields.description'), variant: "destructive" });
      return;
    }
    const customer = customers.find(c => c.id === formData.customerId);
    const newTicket = { 
      ...formData, 
      customerName: customer.contactFullName,
      branchId: customer.branchId,
      createdAt: new Date().toISOString() ,
      updatedAt: new Date().toISOString()
    };
    onAddTicket(newTicket);
    onOpenChange(false);
  };

  const availableUsers = [{name: 'Unassigned'}, ...users];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold gradient-text">{t('New Ticket')}</h2>
              <p className="text-gray-600 mt-1">{t('Description')}</p>
            </div>
            {availableCustomers.length > 0 ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto">
                <div>
                  <Label htmlFor="customerId">{t('Customer')} *</Label>
                  <Select value={formData.customerId} onValueChange={(value) => handleInputChange('customerId', value)} required disabled={!!selectedCustomer}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('Select Customer')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.contactFullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">{t('Subject')} *</Label>
                  <Input id="subject" value={formData.subject} onChange={(e) => handleInputChange('subject', e.target.value)} placeholder="e.g., Billing inquiry" className="mt-1" required />
                </div>
                 <div>
                  <Label htmlFor="description">{t('Description')} *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Describe the issue in detail" className="mt-1" rows={4} required/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="department">{t('Department')} *</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)} required>
                       <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                       <SelectContent>{settings.departments.map(d => <SelectItem key={d} value={d}>{t(`${d.replace(/[\s-]/g, '')}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">{t('Priority')}</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{ticketPriorityOptions.map(p => <SelectItem key={p} value={p}>{t(`${p}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">{t('Assigned To')}</Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{availableUsers.map(u => <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('actions.cancel')}</Button>
                  <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-sky-600 text-white">{t('newTicket')}</Button>
                </div>
              </form>
            ) : (
               <div className="p-8 text-center">
                 <h3 className="text-xl font-semibold text-gray-700">{t('noCustomers')}</h3>
                 <p className="text-gray-500 mt-2">{t('noCustomersForTicket')}</p>
                 <Button className="mt-4" onClick={() => onOpenChange(false)}>{t('actions.close')}</Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default NewTicketDialog;