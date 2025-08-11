import React from 'react';
import SettingsCard from '@/components/settings/SettingsCard';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/contexts/LocaleContext';

const AutomationTemplate = ({ t, automationSettings, type, title, placeholders, onSettingChange }) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white/50">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
        <Switch
          checked={automationSettings?.[type]?.enabled || false}
          onCheckedChange={(checked) => onSettingChange(type, 'enabled', checked)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('settings.reminders.messageTemplate')}</Label>
        <Textarea
          value={automationSettings?.[type]?.template || ''}
          onChange={(e) => onSettingChange(type, 'template', e.target.value)}
          disabled={!automationSettings?.[type]?.enabled}
          placeholder={placeholders.placeholder}
        />
        <p className="text-xs text-gray-500">{placeholders.description}</p>
      </div>
    </div>
  );
};

const WhatsappAutomationSettings = ({ settings, onUpdateSettings }) => {
  const { t } = useLocale();
  const automationSettings = settings.whatsappAutomation || {};

  const handleSettingChange = (group, key, value) => {
    onUpdateSettings({
      ...settings,
      whatsappAutomation: {
        ...automationSettings,
        [group]: {
          ...(automationSettings[group] || {}),
          [key]: value,
        },
      },
    });
  };

  const templates = [
    { type: 'confirmation', title: t('settings.whatsapp_automation.confirmation.title'), placeholders: { placeholder: 'e.g. Dear {{name}}, your appointment is confirmed...', description: `Use {{name}}, {{department}}, {{date}}, and {{time}}.` }},
    { type: 'reminder', title: t('settings.whatsapp_automation.reminder.title'), placeholders: { placeholder: 'e.g. Reminder: You have an appointment tomorrow...', description: `Use {{name}} and {{time}}.` }},
    { type: 'feedback', title: t('settings.whatsapp_automation.feedback.title'), placeholders: { placeholder: 'e.g. We hope you had a good experience...', description: `Use {{name}}.` }},
  ];

  return (
    <SettingsCard
      title={t('settings.whatsapp_automation.title')}
      description={t('settings.whatsapp_automation.description')}
    >
      <div className="p-4 space-y-6">
        {templates.map(template => (
          <AutomationTemplate
            key={template.type}
            t={t}
            automationSettings={automationSettings}
            type={template.type}
            title={template.title}
            placeholders={template.placeholders}
            onSettingChange={handleSettingChange}
          />
        ))}
      </div>
    </SettingsCard>
  );
};

export default WhatsappAutomationSettings;