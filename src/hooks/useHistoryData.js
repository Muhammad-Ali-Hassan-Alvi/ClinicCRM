import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const useHistoryData = () => {
  const [contactHistory, setContactHistory] = useState([]);
  const [leadHistory, setLeadHistory] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [userLoginHistory, setUserLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContactHistory = useCallback(async (contactId) => {
    if (!contactId) return [];
    
    try {
      setLoading(true);
      
      // First check if the contact exists
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .eq('id', parseInt(contactId))
        .single();

      if (contactError || !contact) {
        console.warn('Contact not found or error:', contactError);
        return [];
      }

      // Try to fetch contact history
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .eq('contact_id', parseInt(contactId))
        .order('changed_at', { ascending: false });

      if (error) {
        console.warn('Error fetching contact history:', error);
        return [];
      }

      const history = data || [];
      setContactHistory(history);
      return history;
    } catch (error) {
      console.warn('Error fetching contact history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeadHistory = useCallback(async (leadId) => {
    console.log('Fetching lead history for ID:', leadId);
    if (!leadId) return [];
    
    try {
      setLoading(true);
      
      // First check if the lead exists
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', parseInt(leadId))
        .single();

      if (leadError || !lead) {
        console.warn('Lead not found or error:', leadError);
        return [];
      }

      // Try to fetch lead status history with fallback
      let data, error;
      
      try {
        const result = await supabase
          .from('lead_status_history')
          .select('*')
          .eq('lead_id', parseInt(leadId))
          .order('changed_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      } catch (fetchError) {
        // If changed_at doesn't exist, try with created_at
        console.warn('Fallback to created_at for lead history:', fetchError);
        const fallbackResult = await supabase
          .from('lead_status_history')
          .select('*')
          .eq('lead_id', parseInt(leadId))
          .order('created_at', { ascending: false });
        
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        console.warn('Error fetching lead history:', error);
        return [];
      }

      const history = data || [];
      setLeadHistory(history);
      return history;
    } catch (error) {
      console.warn('Error fetching lead history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomerHistory = useCallback(async (customerId) => {
    if (!customerId) return [];
    
    try {
      setLoading(true);
      
      // First check if the customer exists
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', parseInt(customerId))
        .single();

      if (customerError || !customer) {
        console.warn('Customer not found or error:', customerError);
        return [];
      }

      // Try to fetch customer status history
      const { data, error } = await supabase
        .from('customer_status_history')
        .select('*')
        .eq('customer_id', parseInt(customerId))
        .order('changed_at', { ascending: false });

      if (error) {
        console.warn('Error fetching customer history:', error);
        return [];
      }

      const history = data || [];
      setCustomerHistory(history);
      return history;
    } catch (error) {
      console.warn('Error fetching customer history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketHistory = useCallback(async (ticketId) => {
    if (!ticketId) return [];
    
    try {
      setLoading(true);
      
      // First check if the ticket exists
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('id', parseInt(ticketId))
        .single();

      if (ticketError || !ticket) {
        console.warn('Ticket not found or error:', ticketError);
        return [];
      }

      // Try to fetch ticket activity log
      const { data, error } = await supabase
        .from('ticket_activity_log')
        .select('*')
        .eq('ticket_id', parseInt(ticketId))
        .order('changed_at', { ascending: false });

      if (error) {
        console.warn('Error fetching ticket history:', error);
        return [];
      }

      const history = data || [];
      setTicketHistory(history);
      return history;
    } catch (error) {
      console.warn('Error fetching ticket history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserLoginHistory = useCallback(async (userId) => {
    if (!userId) return [];
    
    try {
      setLoading(true);
      
      // Try to fetch user login history
      const { data, error } = await supabase
        .from('user_login_log')
        .select('*')
        .eq('user_id', userId)
        .order('login_time', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error fetching user login history:', error);
        return [];
      }

      const history = data || [];
      setUserLoginHistory(history);
      return history;
    } catch (error) {
      console.warn('Error fetching user login history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllHistory = useCallback(async () => {
    try {
      setLoading(true);
      
      const [contactData, leadData, customerData, ticketData, userLoginData] = await Promise.allSettled([
        supabase.from('contact_history').select('*').order('changed_at', { ascending: false }),
        supabase.from('lead_status_history').select('*').order('changed_at', { ascending: false }),
        supabase.from('customer_status_history').select('*').order('changed_at', { ascending: false }),
        supabase.from('ticket_activity_log').select('*').order('changed_at', { ascending: false }),
        supabase.from('user_login_log').select('*').order('login_time', { ascending: false }).limit(100)
      ]);

      // Handle results with graceful error handling
      setContactHistory(contactData.status === 'fulfilled' && contactData.value.data ? contactData.value.data : []);
      setLeadHistory(leadData.status === 'fulfilled' && leadData.value.data ? leadData.value.data : []);
      setCustomerHistory(customerData.status === 'fulfilled' && customerData.value.data ? customerData.value.data : []);
      setTicketHistory(ticketData.status === 'fulfilled' && ticketData.value.data ? ticketData.value.data : []);
      setUserLoginHistory(userLoginData.status === 'fulfilled' && userLoginData.value.data ? userLoginData.value.data : []);

    } catch (error) {
      console.warn('Error fetching all history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscriptions for history tables
  useEffect(() => {
    const channel = supabase
      .channel('history-realtime-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contact_history' }, 
        (payload) => {
          console.log('Contact history change:', payload);
          // Refresh contact history if needed
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lead_status_history' }, 
        (payload) => {
          console.log('Lead history change:', payload);
          // Refresh lead history if needed
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customer_status_history' }, 
        (payload) => {
          console.log('Customer history change:', payload);
          // Refresh customer history if needed
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ticket_activity_log' }, 
        (payload) => {
          console.log('Ticket history change:', payload);
          // Refresh ticket history if needed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    contactHistory,
    leadHistory,
    customerHistory,
    ticketHistory,
    userLoginHistory,
    loading,
    fetchContactHistory,
    fetchLeadHistory,
    fetchCustomerHistory,
    fetchTicketHistory,
    fetchUserLoginHistory,
    fetchAllHistory
  };
};

export default useHistoryData;