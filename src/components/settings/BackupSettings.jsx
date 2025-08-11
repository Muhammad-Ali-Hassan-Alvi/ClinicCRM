import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import SettingsCard from '@/components/settings/SettingsCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const BackupSettings = () => {
  const { settings, updateSettings, performBackup } = useData();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { t } = useLocale();

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    await performBackup();
    setIsBackingUp(false);
  };

  const backupSettings = settings.backup || { schedule: 'manual', lastBackupTimestamp: null };

  const handleScheduleChange = (value) => {
    updateSettings({ backup: { ...backupSettings, schedule: value } });
  };

  const lastBackupDate = backupSettings.lastBackupTimestamp
    ? new Date(backupSettings.lastBackupTimestamp).toLocaleString()
    : t('settings.backup.never');

  return (
    <SettingsCard
      title={t('settings.backup.title')}
      description={t('settings.backup.description')}
    >
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="backupSchedule">{t('settings.backup.schedule')}</Label>
          <Select
            id="backupSchedule"
            value={backupSettings.schedule}
            onValueChange={handleScheduleChange}
            className="w-[180px]"
          >
            <option value="manual">{t('settings.backup.manual')}</option>
            <option value="weekly">{t('settings.backup.weekly')}</option>
            <option value="monthly">{t('settings.backup.monthly')}</option>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{t('settings.backup.lastBackup')}: </span>
            <span className="text-gray-600">{lastBackupDate}</span>
          </div>
          <Button onClick={handleBackupNow} disabled={isBackingUp}>
            {isBackingUp ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DownloadCloud className="mr-2 h-4 w-4" />
            )}
            {isBackingUp ? t('settings.backup.backingUp') : t('settings.backup.backupNow')}
          </Button>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
           <h4 className="text-md font-semibold mb-2">{t('settings.backup.cloudSync.title')}</h4>
           <p className="text-sm text-gray-500 mb-4">{t('settings.backup.cloudSync.description')}</p>
           <div className="flex gap-4">
                <Button variant="outline" disabled>{t('settings.backup.cloudSync.connectGoogle')}</Button>
                <Button variant="outline" disabled>{t('settings.backup.cloudSync.connectDropbox')}</Button>
           </div>
        </div>
      </div>
    </SettingsCard>
  );
};

export default BackupSettings;