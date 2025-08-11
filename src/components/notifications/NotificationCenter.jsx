import React, { useMemo } from 'react';
import { Bell, Calendar, Gift, MessageCircle, AlertTriangle, Ticket as TicketIcon } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationItem from '@/components/notifications/NotificationItem';

const NotificationCenter = () => {
  const { contacts, leads, customers, conversations, tickets, settings, currentUser } = useData();

  const notifications = useMemo(() => {
    const allNotifications = [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    customers.forEach(customer => {
      const apptDate = new Date(customer.appointmentDate);
      if (apptDate >= todayStart && apptDate <= todayEnd) {
        allNotifications.push({
          id: `appt-${customer.id}`,
          type: 'appointment',
          Icon: Calendar,
          title: `Appointment: ${customer.contactFullName}`,
          description: `${customer.department} at ${apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          link: '/customers',
          timestamp: apptDate,
          color: 'text-indigo-500',
        });
      }
    });

    const followUpDelay = settings.leadFollowUpDelay || 3;
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - followUpDelay);
    leads.forEach(lead => {
      const updatedAt = new Date(lead.updatedAt);
      if (updatedAt <= staleDate && !['Converted', 'Lost', 'Booked'].includes(lead.status)) {
        allNotifications.push({
          id: `lead-followup-${lead.id}`,
          type: 'lead',
          Icon: AlertTriangle,
          title: `Follow-up: ${lead.contactFullName}`,
          description: `Lead not updated for ${Math.floor((new Date() - updatedAt) / (1000 * 60 * 60 * 24))} days.`,
          link: '/leads',
          timestamp: updatedAt,
          color: 'text-amber-500',
        });
      }
    });

    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    contacts.forEach(contact => {
      if (!contact.birthday) return;
      const birthday = new Date(contact.birthday);
      const thisYearBirthday = new Date(todayStart.getFullYear(), birthday.getMonth(), birthday.getDate());
      if (thisYearBirthday >= todayStart && thisYearBirthday <= twoDaysFromNow) {
        allNotifications.push({
          id: `bday-${contact.id}`,
          type: 'birthday',
          Icon: Gift,
          title: `Birthday: ${contact.fullName}`,
          description: `Birthday on ${thisYearBirthday.toLocaleDateString([], { month: 'long', day: 'numeric' })}`,
          link: '/contacts',
          timestamp: thisYearBirthday,
          color: 'text-pink-500',
        });
      }
    });

    conversations.forEach(convo => {
      if (convo.unreadCount > 0) {
        allNotifications.push({
          id: `wa-${convo.contactId}`,
          type: 'whatsapp',
          Icon: MessageCircle,
          title: `Unread message from ${convo.contactName}`,
          description: `${convo.unreadCount} new message(s)`,
          link: `/whatsapp/${convo.contactId}`,
          timestamp: new Date(convo.lastMessageTimestamp),
          color: 'text-green-500',
        });
      }
    });
    
    tickets.forEach(ticket => {
        if(ticket.assignedTo === currentUser?.name || ticket.assignedTo === 'Unassigned') {
            const lastHistory = ticket.history?.[0];
            const historyDate = lastHistory ? new Date(lastHistory.date) : new Date(ticket.createdAt);
            const timeDiff = new Date() - historyDate;

            if (lastHistory && timeDiff < 24 * 60 * 60 * 1000) { 
                if (lastHistory.field === 'Assigned to' && lastHistory.to === currentUser?.name) {
                     allNotifications.push({
                        id: `ticket-assign-${ticket.id}`, type: 'ticket', Icon: TicketIcon,
                        title: `Assigned to you: #${ticket.id.slice(-6)}`,
                        description: ticket.subject, link: '/tickets', timestamp: historyDate, color: 'text-cyan-500',
                    });
                } else if(lastHistory.field === 'Comment' && lastHistory.user !== currentUser?.name) {
                     allNotifications.push({
                        id: `ticket-comment-${ticket.id}`, type: 'ticket', Icon: MessageCircle,
                        title: `New Comment on #${ticket.id.slice(-6)}`,
                        description: `by ${lastHistory.user}`, link: '/tickets', timestamp: historyDate, color: 'text-blue-500',
                    });
                }
            }
        }
    });

    return allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [contacts, leads, customers, conversations, tickets, settings.leadFollowUpDelay, currentUser]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-white text-xs items-center justify-center">
                {notifications.length}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 mr-4" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span className="font-bold">Notifications</span>
          <Badge variant="secondary">{notifications.length} New</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem key={notification.id} {...notification} />
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 py-10">
              <p>You're all caught up!</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Badge = ({ variant, children }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${variant === 'secondary' ? 'bg-gray-100 text-gray-800' : ''}`}>
        {children}
    </span>
)

export default NotificationCenter;