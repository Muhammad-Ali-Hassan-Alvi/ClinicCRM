import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { sourceOptions } from '@/lib/constants';

const NewContactFromWhatsAppDialog = ({ isOpen, onOpenChange, phoneNumber }) => {
  const { settings, currentUser, addContact } = useData();
  const { toast } = useToast();
  const { t } = useLocale();

  const getInitialFormData = () => ({
    fullName: '',
    phoneNumber: phoneNumber || '',
    secondaryPhoneNumber: '',
    address: '',
    source: 'WhatsApp',
    instagramUrl: '',
    notes: '',
    birthday: '',
    branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, phoneNumber, currentUser, settings.branches]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.branchId || !formData.source) {
      toast({ title: t('toasts.requiredFields.title'), description: t('toasts.requiredFields.description'), variant: "destructive" });
      return;
    }
    const newContact = { ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const success = await addContact(newContact);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold gradient-text">{t('contactManagement.addDialog.title')}</h2>
              <p className="text-gray-600 mt-1">{t('whatsapp.createContactFromNumber', { number: phoneNumber })}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">{t('contactManagement.addDialog.fullName')}</Label>
                  <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder={t('contactManagement.addDialog.fullName')} className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">{t('contactManagement.addDialog.phoneNumber')}</Label>
                  <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} placeholder={t('contactManagement.addDialog.phoneNumber')} className="mt-1" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondaryPhoneNumber">{t('contactManagement.addDialog.secondaryPhoneNumber')}</Label>
                  <Input id="secondaryPhoneNumber" value={formData.secondaryPhoneNumber} onChange={(e) => handleInputChange('secondaryPhoneNumber', e.target.value)} placeholder={t('contactManagement.addDialog.secondaryPhoneNumber')} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="address">{t('contactManagement.addDialog.address')}</Label>
                  <Input id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder={t('contactManagement.addDialog.address')} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('contactManagement.addDialog.source')} *</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)} required>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('contactManagement.addDialog.selectSource')} /></SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(s => <SelectItem key={s} value={s}>{t(`${s.replace(/[\s-]/g, '')}`)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('contactManagement.addDialog.branch')}</Label>
                  <Select value={formData.branchId} onValueChange={(value) => handleInputChange('branchId', value)} required>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('contactManagement.addDialog.selectBranch')} /></SelectTrigger>
                    <SelectContent>
                      {settings.branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('actions.cancel')}</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">{t('contactManagement.newContact')}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default NewContactFromWhatsAppDialog;