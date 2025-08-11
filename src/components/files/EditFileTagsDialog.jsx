import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/contexts/LocaleContext';

const EditFileTagsDialog = ({ isOpen, onOpenChange, file, availableTags, onSave }) => {
  const { t } = useLocale();
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (file && file.tags) {
      setSelectedTags(file.tags);
    } else {
      setSelectedTags([]);
    }
  }, [file]);

  const handleTagChange = (tag, checked) => {
    setSelectedTags(prev => 
      checked ? [...prev, tag] : prev.filter(t => t !== tag)
    );
  };

  const handleSave = () => {
    onSave(selectedTags);
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{t('fileCenter.editTags')}</h2>
              <p className="text-sm text-gray-500 truncate">{file.name}</p>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <h3 className="font-semibold">{t('fileCenter.availableTags')}</h3>
              <div className="grid grid-cols-2 gap-4">
                {(availableTags || []).map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => handleTagChange(tag, checked)}
                    />
                    <Label htmlFor={`tag-${tag}`} className="font-normal cursor-pointer">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>{t('fileCenter.cancel')}</Button>
              <Button onClick={handleSave}>{t('fileCenter.save')}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default EditFileTagsDialog;