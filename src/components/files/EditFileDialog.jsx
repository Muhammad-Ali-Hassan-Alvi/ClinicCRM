import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/LocaleContext';

const EditFileDialog = ({ isOpen, onOpenChange, file, onSave, categories }) => {
  const { t } = useLocale();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (file) {
      setTitle(file.title);
      setDescription(file.description || '');
      setCategory(file.category);
    }
  }, [file]);

  const handleSave = () => {
    onSave({ title, description, category });
  };
  
  const handleClose = () => {
      onOpenChange(false);
  }

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{t('Edit File')}</h2>
              <p className="text-sm text-gray-500 truncate">{file.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="edit-title">{t('Title')}</Label>
                <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-description">{t('Description')}</Label>
                <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-category">{t('Category')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="edit-category" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{t(`fileCategories.${cat.replace(/\s+/g, '')}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose}>{t('actions.cancel')}</Button>
              <Button onClick={handleSave}>{t('actions.saveChanges')}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default EditFileDialog;