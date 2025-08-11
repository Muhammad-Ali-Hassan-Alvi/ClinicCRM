import { supabase } from '@/lib/supabaseClient';

const toSnakeCase = (str) => {
  if (!str) return str;
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const keysToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToSnakeCase(v));
  } else if (obj !== null && obj?.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => {
        const newKey = toSnakeCase(key);
        result[newKey] = keysToSnakeCase(obj[key]);
        return result;
      },
      {}
    );
  }
  return obj;
};

export const createReminderActions = ({ performDbAction, toast, t }) => {
  const addReminder = (reminderData) => performDbAction(
    () => supabase.from('contact_reminders').insert(keysToSnakeCase({ 
      ...reminderData, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    })),
    { 
      titleKey: 'toasts.reminderCreated.title', 
      descriptionKey: 'toasts.reminderCreated.description', 
      descriptionValues: { title: reminderData.title } 
    },
    'toasts.reminderCreated.error'
  );

  const updateReminder = (reminder) => performDbAction(
    () => supabase.from('contact_reminders').update(keysToSnakeCase({ 
      ...reminder, 
      updated_at: new Date().toISOString() 
    })).eq('id', reminder.id),
    { 
      titleKey: 'toasts.reminderUpdated.title', 
      descriptionKey: 'toasts.reminderUpdated.description', 
      descriptionValues: { title: reminder.title } 
    },
    'toasts.reminderUpdated.error'
  );

  const deleteReminder = (reminderId) => performDbAction(
    () => supabase.from('contact_reminders').delete().eq('id', reminderId),
    { 
      titleKey: 'toasts.reminderDeleted.title', 
      descriptionKey: 'toasts.reminderDeleted.description' 
    },
    'toasts.reminderDeleted.error'
  );

  const markReminderComplete = (reminderId) => performDbAction(
    () => supabase.from('contact_reminders').update({ 
      is_completed: true, 
      updated_at: new Date().toISOString() 
    }).eq('id', reminderId),
    { 
      titleKey: 'toasts.reminderCompleted.title', 
      descriptionKey: 'toasts.reminderCompleted.description' 
    },
    'toasts.reminderCompleted.error'
  );

  const addFollowup = (followupData) => performDbAction(
    () => supabase.from('lead_followups').insert(keysToSnakeCase({ 
      ...followupData, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    })),
    { 
      titleKey: 'toasts.followupCreated.title', 
      descriptionKey: 'toasts.followupCreated.description' 
    },
    'toasts.followupCreated.error'
  );

  const updateFollowup = (followup) => performDbAction(
    () => supabase.from('lead_followups').update(keysToSnakeCase({ 
      ...followup, 
      updated_at: new Date().toISOString() 
    })).eq('id', followup.id),
    { 
      titleKey: 'toasts.followupUpdated.title', 
      descriptionKey: 'toasts.followupUpdated.description' 
    },
    'toasts.followupUpdated.error'
  );

  const markFollowupComplete = (followupId) => performDbAction(
    () => supabase.from('lead_followups').update({ 
      is_completed: true, 
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    }).eq('id', followupId),
    { 
      titleKey: 'toasts.followupCompleted.title', 
      descriptionKey: 'toasts.followupCompleted.description' 
    },
    'toasts.followupCompleted.error'
  );

  return { 
    addReminder, 
    updateReminder, 
    deleteReminder, 
    markReminderComplete,
    addFollowup, 
    updateFollowup, 
    markFollowupComplete 
  };
};