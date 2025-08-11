import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import SettingsCard from './SettingsCard';
import EditableList from './EditableList';

const BranchSettings = () => {
  const { settings, updateSettings } = useData();
  const { t } = useLocale();

  const handleUpdate = (newBranches) => {
    updateSettings({ branches: newBranches });
  };

  return (
    <SettingsCard
      title={t('settings.branches.title')}
      description={t('settings.branches.description')}
    >
      <EditableList
        items={settings.branches || []}
        onUpdate={handleUpdate}
        itemSchema={{ name: 'Branch Name', address: 'Address', phone: 'Phone Number' }}
        newItem={{ id: '', name: '', address: '', phone: '' }}
      />
    </SettingsCard>
  );
};

export default BranchSettings;