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

export const createSettingsActions = ({ performDbAction }) => {
  const updateSettings = (settingsData) => {
    const actions = Object.entries(settingsData).map(([key, value]) =>
      supabase.from('app_settings').upsert({ key, value: keysToSnakeCase(value) }, { onConflict: 'key' })
    );
    return performDbAction(
      async () => {
        const results = await Promise.all(actions);
        const firstError = results.find(r => r.error);
        return { error: firstError ? firstError.error : null };
      },
      { titleKey: 'toasts.settingsUpdated.title' },
      'toasts.settingsUpdated.error'
    );
  };
  
  const addUser = (userData) => performDbAction(
    () => supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { 
        data: { 
          name: userData.name, 
          role: userData.role, 
          branch_ids: userData.branchIds 
        } 
      }
    }),
    { 
      titleKey: "toasts.userAdded.title", 
      descriptionKey: 'toasts.userAdded.description', 
      descriptionValues: { email: userData.email } 
    },
    "toasts.userAdded.error"
  );

  const updateUser = (userId, profileData) => performDbAction(
    () => supabase.from('profiles').update(keysToSnakeCase(profileData)).eq('id', userId),
    { titleKey: "toasts.userUpdated.title" },
    "toasts.userUpdated.error"
  );

  const addBranch = (branchData) => performDbAction(
    () => supabase.from('branches').insert(keysToSnakeCase(branchData)),
    { 
      titleKey: "toasts.branchAdded.title", 
      descriptionKey: "toasts.branchAdded.description", 
      descriptionValues: { name: branchData.name } 
    },
    "toasts.branchAdded.error"
  );

  const updateBranch = (branch) => performDbAction(
    () => supabase.from('branches').update(keysToSnakeCase(branch)).eq('id', branch.id),
    { 
      titleKey: "toasts.branchUpdated.title", 
      descriptionKey: "toasts.branchUpdated.description", 
      descriptionValues: { name: branch.name } 
    },
    "toasts.branchUpdated.error"
  );
  
  const deleteBranch = (branchId) => performDbAction(
    () => supabase.from('branches').delete().eq('id', branchId),
    { titleKey: "toasts.branchDeleted.title", variant: "destructive" },
    "toasts.branchDeleted.error"
  );

  return { updateSettings, addUser, updateUser, addBranch, updateBranch, deleteBranch };
};