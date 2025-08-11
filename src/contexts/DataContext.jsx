import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import useDataState from '@/hooks/useDataState';
import useDataActions from '@/hooks/useDataActions';
import useHistoryData from '@/hooks/useHistoryData';
import { Loader2 } from 'lucide-react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user, activeBranch, loading: authLoading } = useAuth();
  const dataState = useDataState();
  const dataActions = useDataActions({ ...dataState, currentUser: user });
  const historyData = useHistoryData();

  const filteredData = useMemo(() => {
    if (!user || dataState.loading) {
      return {
        contacts: [], 
        leads: [], 
        customers: [], 
        tickets: [],
        reminders: [],
        followups: [],
      };
    }

    if (user.role === 'Admin' && activeBranch === 'all') {
      return {
        contacts: dataState.contacts,
        leads: dataState.leads,
        customers: dataState.customers,
        tickets: dataState.tickets,
        reminders: dataState.reminders,
        followups: dataState.followups,
      };
    }

    const filterByBranch = (item) => item.branchId === activeBranch;

    return {
      contacts: dataState.contacts.filter(filterByBranch),
      leads: dataState.leads.filter(filterByBranch),
      customers: dataState.customers.filter(filterByBranch),
      tickets: dataState.tickets.filter(filterByBranch),
      reminders: dataState.reminders.filter(filterByBranch),
      followups: dataState.followups.filter(filterByBranch),
    };
  }, [dataState.contacts, dataState.leads, dataState.customers, dataState.tickets, dataState.reminders, dataState.followups, user, activeBranch, dataState.loading]);

  const value = {
    ...dataState,
    ...dataActions,
    ...historyData,
    ...filteredData,
    currentUser: user,
    activeBranch,
  };

  if (dataState.loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};