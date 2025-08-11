import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { initialState } from '@/contexts/initialState';

const toCamel = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

const keysToCamel = (o) => {
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    const n = {};
    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = keysToCamel(o[k]);
    });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => keysToCamel(i));
  }
  return o;
};

const useDataState = () => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [settings, setSettings] = useState(initialState.settings);
  const [conversations, setConversations] = useState(initialState.conversations);
  const [instagramConversations, setInstagramConversations] = useState(initialState.instagramConversations);
  const [emails, setEmails] = useState(initialState.emails);
  const [auditLog, setAuditLog] = useState(initialState.auditLog);
  const [teamChats, setTeamChats] = useState(initialState.teamChats);
  const [reminders, setReminders] = useState([]);
  const [followups, setFollowups] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: contactsData, error: contactsError },
        { data: leadsData, error: leadsError },
        { data: customersData, error: customersError },
        { data: ticketsData, error: ticketsError },
        { data: appSettingsData, error: appSettingsError },
        { data: branchesData, error: branchesError },
        { data: usersData, error: usersError },
        { data: remindersData, error: remindersError },
        { data: followupsData, error: followupsError }
      ] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('app_settings').select('*'),
        supabase.from('branches').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('contact_reminders').select('*').eq('is_completed', false).order('reminder_date', { ascending: true }),
        supabase.from('lead_followups').select('*').eq('is_completed', false).order('followup_date', { ascending: true })
      ]);

      if (contactsError) console.error('Contacts error:', contactsError);
      if (leadsError) console.error('Leads error:', leadsError);
      if (customersError) console.error('Customers error:', customersError);
      if (ticketsError) console.error('Tickets error:', ticketsError);

      const mapAndCamelCase = (item) => keysToCamel({ 
        ...item, 
        id: item.id.toString() 
      });

      setContacts((contactsData || []).map(mapAndCamelCase));
      setLeads((leadsData || []).map(mapAndCamelCase));
      setCustomers((customersData || []).map(mapAndCamelCase));
      setTickets((ticketsData || []).map(mapAndCamelCase));
      setReminders((remindersData || []).map(mapAndCamelCase));
      setFollowups((followupsData || []).map(mapAndCamelCase));
      
      const dbSettings = (appSettingsData || []).reduce((acc, setting) => {
        try {
          acc[setting.key] = Array.isArray(setting.value) ? setting.value : keysToCamel(setting.value);
        } catch (e) {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {});

      const combinedSettings = {
        ...initialState.settings,
        ...dbSettings,
        branches: (branchesData || []).map(b => keysToCamel(b)),
        users: (usersData || []).map(u => keysToCamel(u)),
        leadStatuses: dbSettings.leadStatuses || initialState.settings.leadStatuses,
        departments: dbSettings.departments || initialState.settings.departments,
        ticketStatuses: dbSettings.ticketStatuses || ['Open', 'In Progress', 'Resolved', 'Closed'],
        ticketPriorities: dbSettings.ticketPriorities || ['Low', 'Medium', 'High'],
        agents: dbSettings.agents || ['Dr. Smith', 'Nurse Betty', 'Admin Staff', 'Unassigned'],
      };
      setSettings(combinedSettings);

    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('crm-realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          console.log('Realtime change received:', payload);
          fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [fetchData]);
  
  return {
    loading,
    contacts, setContacts,
    leads, setLeads,
    customers, setCustomers,
    tickets, setTickets,
    conversations, setConversations,
    instagramConversations, setInstagramConversations,
    emails, setEmails,
    settings, setSettings,
    auditLog, setAuditLog,
    teamChats, setTeamChats,
    reminders, setReminders,
    followups, setFollowups,
    users: settings.users || [],
    refreshData: fetchData,
  };
};

export default useDataState;