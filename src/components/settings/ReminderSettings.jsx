import React from 'react';
import SettingsCard from '@/components/settings/SettingsCard';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/LocaleContext';

const ReminderSettings = ({ settings, onUpdateSettings }) => {
  const { t } = useLocale();
  const reminderSettings = settings.reminders || {};

  const handleSettingChange = (group, key, value) => {
    onUpdateSettings({
      ...settings,
      reminders: {
        ...reminderSettings,
        [group]: {
          ...reminderSettings[group],
          [key]: value,
        },
      },
    });
  };

  return (
    <SettingsCard
      title={t('settings.reminders.title')}
      description={t('settings.reminders.description')}
    >
      <div className="p-4 space-y-6">
        <div className="space-y-4 p-4 border rounded-lg bg-white/50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg text-gray-800">{t('settings.reminders.appointmentTitle')}</h4>
            <Switch
              checked={reminderSettings.appointment?.enabled || false}
              onCheckedChange={(checked) => handleSettingChange('appointment', 'enabled', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.reminders.deliveryMethod')}</Label>
            <Select
              value={reminderSettings.appointment?.method || 'both'}
              onValueChange={(value) => handleSettingChange('appointment', 'method', value)}
              disabled={!reminderSettings.appointment?.enabled}
            >
              <option value="sms">{t('settings.reminders.methodSms')}</option>
              <option value="email">{t('settings.reminders.methodEmail')}</option>
              <option value="both">{t('settings.reminders.methodBoth')}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('settings.reminders.messageTemplate')}</Label>
            <Textarea
              value={reminderSettings.appointment?.template || ''}
              onChange={(e) => handleSettingChange('appointment', 'template', e.target.value)}
              disabled={!reminderSettings.appointment?.enabled}
              placeholder="e.g. Hi {{name}}, this is a reminder for your appointment tomorrow..."
            />
            <p className="text-xs text-gray-500">Use {"{{name}}"}, {"{{time}}"}, and {"{{department}}"} as placeholders.</p>
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg bg-white/50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg text-gray-800">{t('settings.reminders.birthdayTitle')}</h4>
            <Switch
              checked={reminderSettings.birthday?.enabled || false}
              onCheckedChange={(checked) => handleSettingChange('birthday', 'enabled', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.reminders.deliveryMethod')}</Label>
            <Select
              value={reminderSettings.birthday?.method || 'email'}
              onValueChange={(value) => handleSettingChange('birthday', 'method', value)}
              disabled={!reminderSettings.birthday?.enabled}
            >
              <option value="sms">{t('settings.reminders.methodSms')}</option>
              <option value="email">{t('settings.reminders.methodEmail')}</option>
              <option value="both">{t('settings.reminders.methodBoth')}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('settings.reminders.messageTemplate')}</Label>
            <Textarea
              value={reminderSettings.birthday?.template || ''}
              onChange={(e) => handleSettingChange('birthday', 'template', e.target.value)}
              disabled={!reminderSettings.birthday?.enabled}
              placeholder="e.g. Hi {{name}}, wishing you a happy birthday!..."
            />
             <p className="text-xs text-gray-500">Use {"{{name}}"} as a placeholder.</p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
};

export default ReminderSettings;