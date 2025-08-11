import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const useSupabaseRealtime = (refreshData) => {
  const handleRealtimeChange = useCallback((payload) => {
    console.log('Real-time change detected:', payload);
    // Refresh data when any change occurs
    if (refreshData) {
      refreshData();
    }
  }, [refreshData]);

  useEffect(() => {
    // Subscribe to all table changes
    const channel = supabase
      .channel('crm-realtime-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contacts' }, 
        handleRealtimeChange
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        handleRealtimeChange
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' }, 
        handleRealtimeChange
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' }, 
        handleRealtimeChange
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contact_reminders' }, 
        handleRealtimeChange
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lead_followups' }, 
        handleRealtimeChange
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointment_reminders' }, 
        handleRealtimeChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeChange]);

  return null;
};

export default useSupabaseRealtime;