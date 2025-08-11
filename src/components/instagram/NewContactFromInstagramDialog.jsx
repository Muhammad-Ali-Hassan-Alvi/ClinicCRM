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
import { sourceOptions } from '@/lib/constants';

const NewContactFromInstagramDialog = ({ isOpen, onOpenChange, onAddContact, instagramUsername }) => {
  const { settings, currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();

  const getInitialFormData = () => ({
    fullName: '',
    phoneNumber: '',
    address: '',
    source: 'Instagram',
    instagramUrl: `https://instagram.com/${instagramUsername}`,
    notes: t('instagram.createContactNotes', { username: instagramUsername }),
    birthday: '',
    branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, currentUser, settings.branches, instagramUsername, t]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.branchId) {
      toast({ title: t('toasts.requiredFields.title'), description: t('toasts.requiredFields.description'), variant: "destructive" });
      return;
    }
    const newContact = { 
      id: Date.now().toString(), 
      ...formData, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      instagramUsername: instagramUsername
    };
    const success = await onAddContact(newContact);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold gradient-text">{t('instagram.createContactTitle')}</h2>
              <p className="text-gray-600 mt-1">{t('instagram.createContactDescription', { username: instagramUsername })}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">{t('contactManagement.addDialog.fullName')}</Label>
                  <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder={t('contactManagement.addDialog.fullName')} className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">{t('contactManagement.addDialog.phoneNumber')}</Label>
                  <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} placeholder={t('contactManagement.addDialog.phoneNumber')} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">{t('contactManagement.addDialog.address')}</Label>
                <Input id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder={t('contactManagement.addDialog.address')} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">{t('contactManagement.addDialog.source')}</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(s => <SelectItem key={s} value={s}>{t(`${s.replace(/[\s-]/g, '')}`)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="branchId">{t('contactManagement.addDialog.branch')}</Label>
                  <Select value={formData.branchId} onValueChange={(value) => handleInputChange('branchId', value)} required>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('contactManagement.addDialog.selectBranch')} /></SelectTrigger>
                    <SelectContent>
                      {settings.branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">{t('contactManagement.addDialog.birthday')}</Label>
                  <Input id="birthday" type="date" value={formData.birthday} onChange={(e) => handleInputChange('birthday', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">{t('contactManagement.addDialog.notes')}</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder={t('contactManagement.addDialog.notes')} className="mt-1" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('actions.cancel')}</Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">{t('instagram.createContactButton')}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default NewContactFromInstagramDialog;