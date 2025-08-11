import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { AnimatePresence, motion } from 'framer-motion';
import { List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTicketStatusColor, getTicketPriorityColor } from '@/lib/constants';
import TicketDetailsDialog from '@/components/tickets/TicketDetailsDialog';

const TicketHistoryItem = ({ ticket, onTicketClick }) => {
  const { t } = useLocale();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onTicketClick(ticket)}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800">{ticket.subject}</p>
          <p className="text-sm text-gray-500">
            ID: #{ticket.id.slice(-6)} &bull; Created: {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge className={getTicketStatusColor(ticket.status)}>
          {t(`${ticket.status.replace(/[\s-]/g, '')}`)}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className={getTicketPriorityColor(ticket.priority)}>
          {t(`${ticket.priority}`)}
        </Badge>
        <Badge variant="outline">
          {t('tables.assignedTo')}: {ticket.assignedTo || 'Unassigned'}
        </Badge>
      </div>
    </motion.div>
  );
};

const CustomerTicketHistory = ({ customerId }) => {
  const { tickets } = useData();
  const { t } = useLocale();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketDetailsOpen, setIsTicketDetailsOpen] = useState(false);

  const customerTickets = tickets.filter(ticket => ticket.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDetailsOpen(true);
  };
  
  if (customerTickets.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <List className="mx-auto w-12 h-12 text-gray-300 mb-4" />
        <p>{t('details.noTickets')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence>
          {customerTickets.map(ticket => (
            <TicketHistoryItem key={ticket.id} ticket={ticket} onTicketClick={handleTicketClick} />
          ))}
        </AnimatePresence>
      </div>

      <TicketDetailsDialog 
        ticket={selectedTicket}
        isOpen={isTicketDetailsOpen}
        onOpenChange={setIsTicketDetailsOpen}
      />
    </>
  );
};

export default CustomerTicketHistory;