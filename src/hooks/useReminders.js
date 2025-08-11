import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const useReminders = () => {
  const { user, activeBranch } = useAuth();
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [overdueFollowups, setOverdueFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get upcoming reminders
      const { data: reminders, error: remindersError } = await supabase
        .rpc('get_upcoming_reminders', { 
          branch_filter: user.role === 'Admin' ? activeBranch : activeBranch,
          days_ahead: 7 
        });

      if (remindersError) {
        console.error('Error fetching reminders:', remindersError);
      } else {
        setUpcomingReminders(reminders || []);
      }

      // Get overdue follow-ups
      const { data: followups, error: followupsError } = await supabase
        .rpc('get_overdue_followups', { 
          branch_filter: user.role === 'Admin' ? activeBranch : activeBranch 
        });

      if (followupsError) {
        console.error('Error fetching overdue followups:', followupsError);
      } else {
        setOverdueFollowups(followups || []);
      }

    } catch (error) {
      console.error('Error in fetchReminders:', error);
    } finally {
      setLoading(false);
    }
  }, [user, activeBranch]);

  const markReminderComplete = async (reminderId) => {
    try {
      const { error } = await supabase
        .from('contact_reminders')
        .update({ is_completed: true, updated_at: new Date().toISOString() })
        .eq('id', reminderId);

      if (error) {
        console.error('Error marking reminder complete:', error);
        return false;
      }

      // Refresh reminders
      await fetchReminders();
      return true;
    } catch (error) {
      console.error('Error in markReminderComplete:', error);
      return false;
    }
  };

  const markFollowupComplete = async (followupId) => {
    try {
      const { error } = await supabase
        .from('lead_followups')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', followupId);

      if (error) {
        console.error('Error marking followup complete:', error);
        return false;
      }

      // Refresh followups
      await fetchReminders();
      return true;
    } catch (error) {
      console.error('Error in markFollowupComplete:', error);
      return false;
    }
  };

  const createReminder = async (reminderData) => {
    try {
      const { error } = await supabase
        .from('contact_reminders')
        .insert({
          ...reminderData,
          branch_id: activeBranch === 'all' ? reminderData.branch_id : activeBranch,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating reminder:', error);
        return false;
      }

      await fetchReminders();
      return true;
    } catch (error) {
      console.error('Error in createReminder:', error);
      return false;
    }
  };

  const createFollowup = async (followupData) => {
    try {
      const { error } = await supabase
        .from('lead_followups')
        .insert({
          ...followupData,
          branch_id: activeBranch === 'all' ? followupData.branch_id : activeBranch,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating followup:', error);
        return false;
      }

      await fetchReminders();
      return true;
    } catch (error) {
      console.error('Error in createFollowup:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    upcomingReminders,
    overdueFollowups,
    loading,
    refreshReminders: fetchReminders,
    markReminderComplete,
    markFollowupComplete,
    createReminder,
    createFollowup
  };
};

export default useReminders;