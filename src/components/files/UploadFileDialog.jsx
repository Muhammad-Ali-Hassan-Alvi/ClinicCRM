import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';

const UploadFileDialog = ({ isOpen, onOpenChange, onUpload, categories }) => {
  const { t } = useLocale();
  const { toast } = useToast();

  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFiles([acceptedFiles[0]]);
      setTitle(acceptedFiles[0].name.split('.').slice(0, -1).join('.'));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'text/plain': ['.txt'],
    },
  });
  
  const resetState = () => {
    setFiles([]);
    setTitle('');
    setDescription('');
    setCategory('');
  };
  
  const handleClose = () => {
      resetState();
      onOpenChange(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0 || !title || !category) {
      toast({ title: t('toasts.requiredFields.title'), description: t('fileCenter.uploadValidation'), variant: "destructive" });
      return;
    }
    const file = files[0];
    onUpload({
      name: file.name,
      title,
      description,
      category,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      aiEnabled: true,
    });
    resetState();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{t('Upload File')}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {files.length === 0 ? (
                  <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">{isDragActive ? t('ai.dropFiles') : t('ai.dragDrop')}</p>
                    <p className="text-xs text-gray-400 mt-2">{t('Supported Files')}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">{files[0].name}</p>
                        <p className="text-xs text-gray-500">{(files[0].size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setFiles([])}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="title">{t('Title')}</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="description">{t('Description')}</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
                </div>
                 <div>
                  <Label htmlFor="category">{t('Category')}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('Select Category')} /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{t(`${cat}`)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={handleClose}>{t('actions.cancel')}</Button>
                <Button type="submit">{t('Upload File')}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default UploadFileDialog;