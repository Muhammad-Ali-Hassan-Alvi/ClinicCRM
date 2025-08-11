import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { sourceOptions } from '@/lib/constants';
import { Phone, UserPlus, Search } from 'lucide-react';

const AddContactByPhoneDialog = ({ isOpen, onOpenChange }) => {
  const { settings, currentUser, addContact, contacts } = useData();
  const { toast } = useToast();
  const { t } = useLocale();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [existingContact, setExistingContact] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getInitialFormData = () => ({
    fullName: '',
    phoneNumber: phoneNumber,
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
      setPhoneNumber('');
      setExistingContact(null);
      setShowCreateForm(false);
      setFormData(getInitialFormData());
    }
  }, [isOpen, currentUser, settings.branches]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, phoneNumber: phoneNumber }));
  }, [phoneNumber]);

  const searchContactByPhone = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to search.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Search in existing contacts
    const foundContact = contacts.find(contact => 
      contact.phoneNumber === phoneNumber || 
      contact.secondaryPhoneNumber === phoneNumber
    );

    setTimeout(() => {
      if (foundContact) {
        setExistingContact(foundContact);
        setShowCreateForm(false);
      } else {
        setExistingContact(null);
        setShowCreateForm(true);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.branchId || !formData.source) {
      toast({ 
        title: t('toasts.requiredFields.title'), 
        description: t('toasts.requiredFields.description'), 
        variant: "destructive" 
      });
      return;
    }

    const newContact = { 
      ...formData, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
    
    const createdContact = await addContact(newContact);
    if (createdContact) {
      toast({
        title: "Contact Created Successfully! 🎉",
        description: `${formData.fullName} has been added to your contacts.`
      });
      // onContactSelected(createdContact); 
      onOpenChange(false);
    }
  };

  const handleUseExistingContact = () => {
    toast({
      title: "Contact Found! ✅",
      description: `${existingContact.fullName} is already in your contacts.`
    });
    // onContactSelected(existingContact);
    onOpenChange(false);
  };

  const formatPhoneNumber = (phone) => {
    // Simple phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    // if (cleaned.length === 10) {
    //   return `+1${cleaned}`;
    // } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    //   return `+${cleaned}`;
    // }
    return phone;
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Add Contact by Phone Number
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Phone Number Search */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneSearch">Phone Number</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="phoneSearch"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+1234567890 or 1234567890"
                  className="flex-1"
                />
                <Button 
                  onClick={searchContactByPhone}
                  disabled={isSearching || !phoneNumber.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Search className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {existingContact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">Contact Found!</h3>
                    <p className="text-green-700">{existingContact.fullName}</p>
                    <p className="text-sm text-green-600">{existingContact.phoneNumber}</p>
                    {existingContact.secondaryPhoneNumber && (
                      <p className="text-sm text-green-600">Secondary: {existingContact.secondaryPhoneNumber}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleUseExistingContact}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Use This Contact
                  </Button>
                </div>
              </motion.div>
            )}

            {showCreateForm && !existingContact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Contact Not Found</h3>
                </div>
                <p className="text-blue-700 text-sm mb-4">
                  No existing contact found with this phone number. Create a new contact below.
                </p>
              </motion.div>
            )}
          </div>

          {/* Create New Contact Form */}
          {showCreateForm && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCreateContact}
              className="space-y-6 border-t pt-6"
            >
              <h3 className="text-lg font-semibold text-gray-800">Create New Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">{t('contactManagement.addDialog.fullName')} *</Label>
                  <Input 
                    id="fullName" 
                    value={formData.fullName} 
                    onChange={(e) => handleInputChange('fullName', e.target.value)} 
                    placeholder="Enter full name" 
                    className="mt-1" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">{t('contactManagement.addDialog.phoneNumber')} *</Label>
                  <Input 
                    id="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)} 
                    placeholder="Phone number" 
                    className="mt-1" 
                    required 
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondaryPhoneNumber">{t('contactManagement.addDialog.secondaryPhoneNumber')}</Label>
                  <Input 
                    id="secondaryPhoneNumber" 
                    value={formData.secondaryPhoneNumber} 
                    onChange={(e) => handleInputChange('secondaryPhoneNumber', e.target.value)} 
                    placeholder="Secondary phone (optional)" 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="address">{t('contactManagement.addDialog.address')}</Label>
                  <Input 
                    id="address" 
                    value={formData.address} 
                    onChange={(e) => handleInputChange('address', e.target.value)} 
                    placeholder="Address (optional)" 
                    className="mt-1" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('contactManagement.addDialog.source')} *</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('contactManagement.addDialog.selectSource')} />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(s => (
                        <SelectItem key={s} value={s}>
                          {t(`${s.replace(/[\s-]/g, '')}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('contactManagement.addDialog.branch')} *</Label>
                  <Select value={formData.branchId} onValueChange={(value) => handleInputChange('branchId', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('contactManagement.addDialog.selectBranch')} />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">{t('contactManagement.addDialog.birthday')}</Label>
                  <Input 
                    id="birthday" 
                    type="date" 
                    value={formData.birthday} 
                    onChange={(e) => handleInputChange('birthday', e.target.value)} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input 
                    id="instagramUrl" 
                    value={formData.instagramUrl} 
                    onChange={(e) => handleInputChange('instagramUrl', e.target.value)} 
                    placeholder="https://instagram.com/username" 
                    className="mt-1" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input 
                  id="notes" 
                  value={formData.notes} 
                  onChange={(e) => handleInputChange('notes', e.target.value)} 
                  placeholder="Additional notes (optional)" 
                  className="mt-1" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('actions.cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Contact
                </Button>
              </div>
            </motion.form>
          )}

          {!showCreateForm && !existingContact && phoneNumber && !isSearching && (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Enter a phone number and click search to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactByPhoneDialog;