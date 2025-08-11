import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import SettingsCard from '@/components/settings/SettingsCard';
import EditableList from '@/components/settings/EditableList';
import WhatsappSettings from '@/components/settings/WhatsappSettings';
import InstagramSettings from '@/components/settings/InstagramSettings';
import EmailSettings from '@/components/settings/EmailSettings';
import WhatsappAutomationSettings from '@/components/settings/WhatsappAutomationSettings';
import RoleManagement from '@/components/settings/RoleManagement';
import ReminderSettings from '@/components/settings/ReminderSettings';
import CalendarSyncSettings from '@/components/settings/CalendarSyncSettings';
import BackupSettings from '@/components/settings/BackupSettings';
import BranchManagement from '@/components/settings/BranchManagement';
import UserManagement from '@/components/settings/UserManagement';
import AuditLog from '@/components/audit/AuditLog';
import HistoryManagement from '@/components/audit/HistoryManagement';
import { useLocale } from '@/contexts/LocaleContext';
import TelephonySettings from './TelephonySettings';

const Settings = () => {
  const { settings, updateSettings } = useData();
  const { currentUser } = useData();
  const { t } = useLocale();

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="glass-effect rounded-2xl p-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">{t('settings.title')}</h1>
          <p className="text-gray-600 text-lg">{t('settings.description')}</p>
        </div>
      </motion.div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="organization">{t('settings.organization.title')}</TabsTrigger>
          <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
          <TabsTrigger value="automation">{t('settings.automation')}</TabsTrigger>
          <TabsTrigger value="data">{t('settings.data_integrations.title')}</TabsTrigger>
          <TabsTrigger value="roles">{t('settings.roles')}</TabsTrigger>
          <TabsTrigger value="audit">{t('sidebar.auditLog')}</TabsTrigger>
          <TabsTrigger value="history">{t('Audit Log History')}</TabsTrigger>
        </TabsList>
        <TabsContent value="organization">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <BranchManagement />
            <UserManagement />
          </div>
        </TabsContent>
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <EditableList
              title={t('settings.leadStatuses')}
              description={t('settings.leadStatusesDesc')}
              listKey="leadStatuses"
            />
            <EditableList
              title={t('settings.departments')}
              description={t('settings.departmentsDesc')}
              listKey="departments"
            />
            <SettingsCard
              title={t('settings.exportSettings.title')}
              description={t('settings.exportSettings.description')}
            >
              <div className="flex items-center justify-between p-4">
                <Label htmlFor="includeNotesDefault" className="flex-grow">{t('settings.includeNotesDefault')}</Label>
                <Switch
                  id="includeNotesDefault"
                  checked={settings.exportIncludeNotes || false}
                  onCheckedChange={(checked) => updateSettings({ exportIncludeNotes: checked })}
                />
              </div>
            </SettingsCard>
            <EditableList
              title={t('settings.fileTags.title')}
              description={t('settings.fileTags.description')}
              listKey="fileTags"
            />
          </div>
        </TabsContent>
        <TabsContent value="automation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <WhatsappAutomationSettings settings={settings} onUpdateSettings={(data) => updateSettings({ whatsappAutomation: data })} />
            <ReminderSettings settings={settings} onUpdateSettings={(data) => updateSettings({ reminders: data })} />
          </div>
        </TabsContent>
        <TabsContent value="data">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <BackupSettings />
            <CalendarSyncSettings />
            <WhatsappSettings />
            <InstagramSettings />
            <EmailSettings />
            <TelephonySettings />
          </div>
        </TabsContent>
        <TabsContent value="roles">
            <RoleManagement />
        </TabsContent>
        <TabsContent value="audit">
            <AuditLog />
        </TabsContent>
        <TabsContent value="history">
            <HistoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;