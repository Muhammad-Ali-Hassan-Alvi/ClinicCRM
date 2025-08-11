import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { getTicketStatusColor, getTicketPriorityColor } from '@/lib/constants';
import { useLocale } from '@/contexts/LocaleContext';

const TicketsList = ({ tickets, onUpdateTicket, onRowClick, readOnly = false }) => {
  const { t } = useLocale();

  const columns = [
    { key: 'id', label: t('Ticket Id') },
    { key: 'subject', label: t('Subject') },
    { key: 'customerName', label: t('Customer Name') },
    { key: 'department', label: t('Department') },
    { key: 'priority', label: t('Priority') },
    { key: 'assignedTo', label: t('Assigned To') },
    { key: 'createdAt', label: t('Created At') },
    { key: 'status', label: t('Status') },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto glass-effect rounded-2xl p-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map(ticket => (
            <TableRow 
              key={ticket.id}
              onClick={() => onRowClick && onRowClick(ticket)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50/80" : ""}
            >
              <TableCell className="font-mono text-xs text-gray-500">#{ticket.id.slice(-6)}</TableCell>
              <TableCell className="font-medium">{ticket.subject}</TableCell>
              <TableCell>{ticket.customerName}</TableCell>
              <TableCell>{t(`${ticket.department.replace(/[\s-]/g, '')}`)}</TableCell>
              <TableCell>
                <Badge className={`${getTicketPriorityColor(ticket.priority)}`}>{t(`${ticket.priority}`)}</Badge>
              </TableCell>
              <TableCell>{ticket.assignedTo || 'Unassigned'}</TableCell>
              <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                  <Badge className={`${getTicketStatusColor(ticket.status)}`}>{t(`${ticket.status.replace(/[\s-]/g, '')}`)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {tickets.length === 0 && (
          <TableCaption>{t('No Tickets Found')}</TableCaption>
        )}
      </Table>
    </motion.div>
  );
};

export default TicketsList;