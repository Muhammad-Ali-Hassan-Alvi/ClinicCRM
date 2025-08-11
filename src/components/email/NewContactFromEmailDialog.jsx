import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { sourceOptions } from '@/lib/constants';

const NewContactFromEmailDialog = ({ isOpen, onOpenChange, onAddContact, emailData }) => {
  const { settings, currentUser } = useData();
  const { toast } = useToast();

  const getInitialFormData = () => ({
    fullName: emailData?.name || '',
    email: emailData?.email || '',
    phoneNumber: '',
    source: 'Email',
    branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, emailData, currentUser, settings.branches]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.branchId || !formData.email) {
      toast({ title: "Required Fields Missing", description: "Please fill in full name, email, and branch.", variant: "destructive" });
      return;
    }
    const newContact = { 
      id: Date.now().toString(), 
      ...formData, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      notes: [], attachments: [], comments: []
    };
    onAddContact(newContact);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold gradient-text">Create New Contact</h2>
              <p className="text-gray-600 mt-1">Create a contact from {emailData.email}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="mt-1" required />
                </div>
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <Label htmlFor="branchId">Branch *</Label>
                  <Select value={formData.branchId} onValueChange={(value) => handleInputChange('branchId', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">Create Contact</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default NewContactFromEmailDialog;