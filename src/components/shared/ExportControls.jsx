import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, FileText, Sheet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { exportToExcel, exportToPdf } from '@/lib/export';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

const ExportControls = ({ data, columns, filenamePrefix, noteKey = 'notes' }) => {
  const { settings } = useData();
  const { t } = useLocale();
  const { toast } = useToast();
  const [includeNotes, setIncludeNotes] = useState(false);

  useEffect(() => {
    setIncludeNotes(settings.exportIncludeNotes || false);
  }, [settings.exportIncludeNotes]);

  const processData = () => {
    return data.map(item => {
      const processedItem = {};
      columns.forEach(col => {
        processedItem[col.label] = item[col.key] || '';
      });
      if (includeNotes) {
        const notes = item[noteKey] || [];
        processedItem[t('tables.notes')] = notes.map(n => `[${new Date(n.createdAt).toLocaleString()}] ${n.text}`).join('; ');
      }
      return processedItem;
    });
  };

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast({ titleKey: 'toasts.exportError.title', descriptionKey: 'toasts.exportError.description', variant: 'destructive' });
      return;
    }
    const exportData = processData();
    exportToExcel(exportData, filenamePrefix);
    toast({ titleKey: 'toasts.exportSuccess.title', descriptionKey: 'toasts.exportSuccess.description' });
  };

  const handleExportPdf = () => {
    if (data.length === 0) {
      toast({ titleKey: 'toasts.exportError.title', descriptionKey: 'toasts.exportError.description', variant: 'destructive' });
      return;
    }
    const excelData = processData();
    const pdfColumns = Object.keys(excelData[0] || {});
    const pdfData = excelData.map(row => pdfColumns.map(col => row[col]));
    exportToPdf(pdfColumns, pdfData, filenamePrefix);
    toast({ titleKey: 'toasts.exportSuccess.title', descriptionKey: 'toasts.exportSuccess.description' });
  };

  return (
    <div className="flex items-center gap-2">
       <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Switch id="include-notes" checked={includeNotes} onCheckedChange={setIncludeNotes} />
        <Label htmlFor="include-notes" className="text-sm font-medium">{t('export.includeNotes')}</Label>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <FileDown className="w-4 h-4 me-2" />
            {t('export.export')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExportExcel}>
            <Sheet className="w-4 h-4 me-2" />
            {t('export.exportToExcel')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPdf}>
            <FileText className="w-4 h-4 me-2" />
            {t('export.exportToPdf')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportControls;