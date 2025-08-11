import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Download, Trash2, Edit, FileText, FileImage as ImageIcon, FileSpreadsheet, FileArchive } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-blue-500" />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
  if (fileType.includes('pdf')) return <FileArchive className="w-6 h-6 text-red-500" />;
  return <FileText className="w-6 h-6 text-gray-500" />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileList = ({ files, onEdit, onDelete, onToggleAI }) => {
  const { t } = useLocale();
   return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto glass-effect rounded-2xl p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>{t('Title')}</TableHead>
            <TableHead>{t('Category')}</TableHead>
            <TableHead>{t('Uploaded By')}</TableHead>
            <TableHead>{t('Date')}</TableHead>
            <TableHead>{t('AI Enabled')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map(file => (
            <TableRow key={file.id}>
              <TableCell>{getFileIcon(file.type)}</TableCell>
              <TableCell>
                <div className="font-medium truncate max-w-xs">{file.title}</div>
                <div className="text-xs text-gray-500">{file.name} ({formatFileSize(file.size)})</div>
              </TableCell>
              <TableCell><Badge variant="secondary">{t(`fileCategories.${file.category.replace(/\s+/g, '')}`)}</Badge></TableCell>
              <TableCell>{file.uploaded_by}</TableCell>
              <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Switch
                  checked={file.aiEnabled}
                  onCheckedChange={(checked) => onToggleAI(file.id, checked)}
                  aria-label="Enable for AI"
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(file)} title={t('actions.edit')}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <a href={file.url} download={file.name}>
                    <Button variant="ghost" size="icon" title={t('fileCenter.download')}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(file.id)} className="text-red-500 hover:text-red-700" title={t('actions.delete')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default FileList;