import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/reports/StatCard';
import { Target, TrendingUp, Ticket } from 'lucide-react';

const DashboardStatCards = ({ branchFilter }) => {
  const { leads, customers, tickets } = useData();

  const stats = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday as start of week
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const branchFiltered = (item) => branchFilter === 'all' || item.branchId === branchFilter;

    const newLeadsThisWeek = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= startOfWeek && leadDate <= endOfWeek && branchFiltered(lead);
    });

    const convertedLeadsThisWeek = customers.filter(customer => {
        if (!customer.leadCreatedAt) return false;
        const leadDate = new Date(customer.leadCreatedAt);
        return leadDate >= startOfWeek && leadDate <= endOfWeek && branchFiltered(customer);
    });

    const conversionRate = newLeadsThisWeek.length > 0 ? ((convertedLeadsThisWeek.length / newLeadsThisWeek.length) * 100).toFixed(1) : 0;

    const ticketsOpenedThisWeek = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      return ticketDate >= startOfWeek && ticketDate <= endOfWeek && branchFiltered(ticket);
    }).length;

    return { newLeadsThisWeek: newLeadsThisWeek.length, conversionRate, ticketsOpenedThisWeek };
  }, [leads, customers, tickets, branchFilter]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={Target} title="New Leads This Week" value={stats.newLeadsThisWeek} color="purple" />
      <StatCard icon={TrendingUp} title="Conversion Rate (Weekly)" value={`${stats.conversionRate}%`} color="green" />
      <StatCard icon={Ticket} title="Tickets Opened This Week" value={stats.ticketsOpenedThisWeek} color="cyan" />
    </div>
  );
};

export default DashboardStatCards;