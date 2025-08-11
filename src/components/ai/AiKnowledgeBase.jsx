import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AiKnowledgeBase = () => {
  const { settings, updateSettings } = useData();
  const { t } = useLocale();
  const { toast } = useToast();
  const knowledgeBase = settings.aiKnowledgeBase || [];

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    
    const updatedKB = [...knowledgeBase];
    newFiles.forEach(nf => {
        if (!updatedKB.some(f => f.id === nf.id)) {
            updatedKB.push(nf);
        }
    });

    updateSettings({ aiKnowledgeBase: updatedKB });
    toast({ title: t('ai.filesUploadedTitle'), description: t('ai.filesUploadedDesc', { count: newFiles.length }) });
  }, [knowledgeBase, updateSettings, t, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.png', '.jpg'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const handleDeleteFile = (fileId) => {
    const updatedKB = knowledgeBase.filter(file => file.id !== fileId);
    updateSettings({ aiKnowledgeBase: updatedKB });
    toast({ title: t('ai.fileDeleted'), variant: 'destructive' });
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        {isDragActive ? (
          <p className="text-blue-600 font-semibold">{t('ai.dropFiles')}</p>
        ) : (
          <p className="text-gray-500">{t('ai.dragDrop')}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">{t('ai.supportedFiles')}</p>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">{t('ai.uploadedFiles')}</h4>
        {knowledgeBase.length > 0 ? (
          <ul className="space-y-2">
            {knowledgeBase.map(file => (
              <li key={file.id} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteFile(file.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">{t('ai.noFiles')}</p>
        )}
      </div>
    </div>
  );
};

export default AiKnowledgeBase;