import { generateBackupZip } from '@/lib/backup';

export const createUtilityActions = (dataState, setters, logAction, toast) => {
  const { contacts, leads, customers, tickets, settings, conversations, instagramConversations, emails } = dataState;
  const { setSettings, setContacts, setLeads, setCustomers, setTickets } = setters;

  const updateSettings = (newSettings) => {
    setSettings(prev => ({...prev, ...newSettings}));
    toast({ titleKey: "toasts.settingsUpdated.title", descriptionKey: "toasts.settingsUpdated.description" });
    logAction('SETTINGS_UPDATED', 'Settings', { updatedKeys: Object.keys(newSettings) });
  };

  const performBackup = async () => {
    logAction('DATA_BACKUP_STARTED', 'Backup');
    toast({ titleKey: "toasts.backup.started.title", descriptionKey: "toasts.backup.started.description" });
    try {
      const backupBlob = await generateBackupZip({ contacts, leads, customers, tickets, conversations, instagramConversations, emails });
      const url = window.URL.createObjectURL(backupBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `clinic-crm-backup-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      updateSettings({ backup: { ...settings.backup, lastBackupTimestamp: new Date().toISOString() } });
      toast({ titleKey: "toasts.backup.success.title", descriptionKey: "toasts.backup.success.description" });
      logAction('DATA_BACKUP_COMPLETED', 'Backup');
    } catch (error) {
      toast({ titleKey: "toasts.backup.error.title", descriptionKey: "toasts.backup.error.description", variant: "destructive" });
      logAction('DATA_BACKUP_FAILED', 'Backup', { error: error.message });
    }
  };

  const updateAttachment = (recordType, recordId, fileId, updatedData) => {
    const recordSetters = { contacts: setContacts, leads: setLeads, customers: setCustomers, tickets: setTickets };
    const setter = recordSetters[recordType];
    if (setter) {
      setter(prev => prev.map(record => {
        if (record.id === recordId) {
          let fileName = '';
          const newAttachments = (record.attachments || []).map(att => {
            if (att.id === fileId) { fileName = att.name; return { ...att, ...updatedData }; }
            return att;
          });
          if (updatedData.tags) logAction('FILE_TAGS_UPDATED', 'Files', { fileName, recordType, recordId, tags: updatedData.tags });
          return { ...record, attachments: newAttachments };
        }
        return record;
      }));
    }
  };

  const deleteAttachment = (recordType, recordId, fileId) => {
    const recordSetters = { contacts: setContacts, leads: setLeads, customers: setCustomers, tickets: setTickets };
    const setter = recordSetters[recordType];
    if (setter) {
      setter(prev => prev.map(record => {
        if (record.id === recordId) {
          const fileToDelete = (record.attachments || []).find(f => f.id === fileId);
          if (fileToDelete) {
            URL.revokeObjectURL(fileToDelete.url);
            logAction('FILE_DELETED', 'Files', { fileName: fileToDelete.name, recordType, recordId });
          }
          const newAttachments = (record.attachments || []).filter(att => att.id !== fileId);
          return { ...record, attachments: newAttachments };
        }
        return record;
      }));
      toast({ title: "File Deleted", description: "The file has been successfully removed.", variant: "destructive" });
    }
  };

  const addComment = (recordType, recordId, comment) => {
    const recordSetters = { contacts: setContacts, leads: setLeads, customers: setCustomers, tickets: setTickets };
    const setter = recordSetters[recordType];
    if (setter) {
      setter(prev => prev.map(item => {
        if (item.id === recordId) {
          const newComments = [comment, ...(item.comments || [])];
          return { ...item, comments: newComments };
        }
        return item;
      }));
      logAction('COMMENT_ADDED', recordType, { recordId, author: comment.authorName });
      toast({ titleKey: "toasts.commentAdded.title", descriptionKey: "toasts.commentAdded.description" });
    }
  };

  const syncAppointmentToCalendar = (customer) => {
    const { google, outlook } = settings.calendarSync;
    const connectedCalendars = [];
    if (google.connected) connectedCalendars.push('Google');
    if (outlook.connected) connectedCalendars.push('Outlook');

    if (connectedCalendars.length > 0) {
      toast({
        titleKey: 'toasts.calendarSync.synced.title',
        descriptionKey: 'toasts.calendarSync.synced.description',
        descriptionValues: { name: customer.contactFullName, calendars: connectedCalendars.join(' & ') }
      });
      logAction('APPOINTMENT_SYNCED', 'Calendar', { name: customer.contactFullName, calendars: connectedCalendars, branchId: customer.branchId });
    }
  };

  const updateItem = (type, itemId, data) => {
    const recordSetters = { contacts: setContacts, leads: setLeads, customers: setCustomers, tickets: setTickets };
    const setter = recordSetters[type];
    if (setter) {
      setter(prev => prev.map(item => {
        if (item.id === itemId) {
          if (data.attachments && item.attachments && data.attachments.length > item.attachments.length) {
            const oldFileIds = new Set(item.attachments.map(f => f.id));
            const newFiles = data.attachments.filter(f => !oldFileIds.has(f.id));
            newFiles.forEach(file => logAction('FILE_UPLOADED', 'Files', { fileName: file.name, recordType: type, recordId: itemId }));
          }
          return { ...item, ...data, updatedAt: new Date().toISOString() };
        }
        return item;
      }));
    }
  };

  return { updateSettings, performBackup, updateAttachment, deleteAttachment, addComment, syncAppointmentToCalendar, updateItem };
};