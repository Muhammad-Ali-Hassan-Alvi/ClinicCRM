import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/reports/StatCard';
import { Users, Target, HeartHandshake, Ticket } from 'lucide-react';

const StatCardGrid = () => {
  const { leads, customers, tickets } = useData();

  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const newLeadsThisMonth = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === thisMonth && leadDate.getFullYear() === thisYear;
    }).length;

    const newCustomersThisMonth = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate.getMonth() === thisMonth && customerDate.getFullYear() === thisYear;
    }).length;

    const totalLeadsEver = leads.length + customers.length;
    const conversionRate = totalLeadsEver > 0 ? ((customers.length / totalLeadsEver) * 100).toFixed(1) : 0;

    const openTickets = tickets.filter(ticket => ticket.status === 'Open' || ticket.status === 'Pending').length;

    return { newLeadsThisMonth, newCustomersThisMonth, conversionRate, openTickets };
  }, [leads, customers, tickets]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard icon={Target} title="New Leads (This Month)" value={stats.newLeadsThisMonth} color="purple" />
      <StatCard icon={HeartHandshake} title="New Customers (This Month)" value={stats.newCustomersThisMonth} color="green" />
      <StatCard icon={Users} title="Conversion Rate" value={`${stats.conversionRate}%`} color="blue" />
      <StatCard icon={Ticket} title="Open Tickets" value={stats.openTickets} color="orange" />
    </div>
  );
};

export default StatCardGrid;