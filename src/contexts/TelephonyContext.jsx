import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Phone, PhoneMissed } from 'lucide-react';

const TelephonyContext = createContext();

export const useTelephony = () => useContext(TelephonyContext);

let socket = null;

export const TelephonyProvider = ({ children }) => {
  const { session, loading: authLoading } = useAuth();
  if (authLoading) return null; // Prevent rendering until auth is ready
  const { contacts, leads, settings } = useData();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [callLogs, setCallLogs] = useState([]);

  const findMatch = useCallback((phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanNumber) return null;

    const leadMatch = leads.find(l => l.contactPhoneNumber?.replace(/\D/g, '').endsWith(cleanNumber));
    if (leadMatch) return { type: 'lead', entity: leadMatch };

    const contactMatch = contacts.find(c => c.phoneNumber?.replace(/\D/g, '').endsWith(cleanNumber));
    if (contactMatch) return { type: 'contact', entity: contactMatch };

    return null;
  }, [contacts, leads]);

  const handleCallEvent = useCallback(async (event) => {
    console.log('Call event received:', event);

    if (event.event === 'Newchannel') {
      const callerId = event.calleridnum;
      const match = findMatch(callerId);
      const callData = {
        id: event.uniqueid,
        callerId,
        status: 'Ringing',
        match,
        startTime: new Date(),
      };
      setCurrentCall(callData);
      
      toast({
        id: `call_${event.uniqueid}`,
        duration: Infinity,
        title: (
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-500 animate-pulse" />
            <span>Incoming Call</span>
          </div>
        ),
        description: `From: ${callerId}${match ? ` (${match.entity.contactFullName || match.entity.fullName})` : ''}`,
        action: (
          <button
            onClick={() => {
              // Can add logic here to open lead/contact
              console.log('Opening details for', match);
            }}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {match ? 'Open Details' : 'Create Contact'}
          </button>
        ),
      });

      await supabase.from('call_logs').insert({
        caller_id: callerId,
        call_type: 'incoming',
        from_number: callerId,
        to_number: event.exten,
        start_time: new Date().toISOString(),
        status: 'ringing',
        raw_events: [event]
      });
    }

    if (event.event === 'Hangup') {
      toast.dismiss(`call_${event.uniqueid}`);
      toast({
        id: `hangup_${event.uniqueid}`,
        title: (
          <div className="flex items-center gap-2">
            <PhoneMissed className="w-5 h-5 text-red-500" />
            <span>Call Ended</span>
          </div>
        ),
        description: `Call from ${event.calleridnum} ended.`,
      });
      setCurrentCall(null);
      await supabase.from('call_logs').update({
        end_time: new Date().toISOString(),
        status: 'ended', // A more specific status could be determined from other events
      }).eq('caller_id', event.calleridnum).is('end_time', null);
    }
  }, [findMatch, toast]);

  const connect = useCallback((amiConfig) => {
    if (socket || !session || !amiConfig?.host) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://auvpuouphxdkrajmnruo.supabase.co";
    const functionUrl = `${supabaseUrl}/functions/v1/ami-bridge`;
    
    // Use websocket transport, pass token in query
    socket = io(functionUrl, {
        transports: ['websocket'],
        query: {
            token: session.access_token,
        }
    });

    socket.on('connect', () => {
      console.log('Connected to AMI bridge');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from AMI bridge');
      setIsConnected(false);
    });

    socket.on('ami_event', handleCallEvent);
    
    socket.on('connect_error', (err) => {
        console.error('Connection error with AMI bridge:', err.message);
        setIsConnected(false);
    });

  }, [session, handleCallEvent]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (session && settings?.telephony_ami_config?.host) {
      connect(settings.telephony_ami_config);
    }

    return () => {
      disconnect();
    };
  }, [session, settings.telephony_ami_config, connect, disconnect]);

  const fetchCallLogsFor = async (type, recordId) => {
    const mapping = {
      contact: 'related_contact_id',
      lead: 'related_lead_id',
      customer: 'related_contact_id' // Assuming customers share contact_id
    };
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq(mapping[type], recordId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching call logs for ${type} ${recordId}:`, error);
      return [];
    }
    return data;
  };

  const value = { isConnected, currentCall, callLogs, fetchCallLogsFor, connect, disconnect };

  return (
    <TelephonyContext.Provider value={value}>
      {children}
    </TelephonyContext.Provider>
  );
};