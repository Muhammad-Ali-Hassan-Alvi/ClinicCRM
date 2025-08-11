import React from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import ExportControls from '@/components/shared/ExportControls';
import { getLeadStatusColor, getCustomerStatusColor, getTicketStatusColor, getTicketPriorityColor } from '@/lib/constants';

const InteractiveDataView = ({ view, onClose, exportColumns }) => {
  const { t } = useLocale();

  if (!view) return null;

  const { type, filter, data } = view;

  const filteredData = data.filter(item => {
    if (!filter || Object.keys(filter).length === 0) return true;
    return Object.entries(filter).every(([key, value]) => item[key] === value);
  });

  const getTitle = () => {
    if (filter && Object.keys(filter).length > 0) {
      const filterDesc = Object.entries(filter)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      return `${t(`sidebar.${type}`)} - ${filterDesc}`;
    }
    return `All ${t(`sidebar.${type}`)}`;
  };

  const renderLeadRow = (lead) => (
    <TableRow key={lead.id}>
      <TableCell className="font-medium">{lead.contactFullName}</TableCell>
      <TableCell>
        <Badge className={getLeadStatusColor(lead.status)}>
          {t(`${lead.status.replace(/[\s-]/g, '')}`)}
        </Badge>
      </TableCell>
      <TableCell>{t(`${lead.leadSource?.replace(/[\s-]/g, '') || 'Unknown'}`)}</TableCell>
      <TableCell>{lead.assignedAgent}</TableCell>
      <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
    </TableRow>
  );

  const renderCustomerRow = (customer) => (
    <TableRow key={customer.id}>
      <TableCell className="font-medium">{customer.contactFullName}</TableCell>
      <TableCell>
        <Badge className={getCustomerStatusColor(customer.status)}>
          {t(`${customer.status.replace(/[\s-]/g, '')}`)}
        </Badge>
      </TableCell>
      <TableCell>{t(`${customer.department?.replace(/[\s-]/g, '') || 'General'}`)}</TableCell>
      <TableCell>{new Date(customer.appointmentDate).toLocaleDateString()}</TableCell>
      <TableCell>{t(`${customer.leadSource?.replace(/[\s-]/g, '') || 'Unknown'}`)}</TableCell>
    </TableRow>
  );

  const renderTicketRow = (ticket) => (
    <TableRow key={ticket.id}>
      <TableCell className="font-mono text-xs">#{ticket.id.slice(-6)}</TableCell>
      <TableCell className="font-medium">{ticket.subject}</TableCell>
      <TableCell>{ticket.customerName}</TableCell>
      <TableCell>
        <Badge className={getTicketStatusColor(ticket.status)}>
          {t(`${ticket.status.replace(/[\s-]/g, '')}`)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getTicketPriorityColor(ticket.priority)}>
          {t(`${ticket.priority}`)}
        </Badge>
      </TableCell>
      <TableCell>{ticket.assignedTo}</TableCell>
    </TableRow>
  );

  const renderTableHeaders = () => {
    switch (type) {
      case 'leads':
        return (
          <TableRow>
            <TableHead>{t('tables.contactName')}</TableHead>
            <TableHead>{t('tables.status')}</TableHead>
            <TableHead>{t('tables.source')}</TableHead>
            <TableHead>{t('tables.assignedAgent')}</TableHead>
            <TableHead>{t('tables.createdAt')}</TableHead>
          </TableRow>
        );
      case 'customers':
        return (
          <TableRow>
            <TableHead>{t('tables.customerName')}</TableHead>
            <TableHead>{t('tables.status')}</TableHead>
            <TableHead>{t('tables.department')}</TableHead>
            <TableHead>{t('tables.appointmentDate')}</TableHead>
            <TableHead>{t('tables.source')}</TableHead>
          </TableRow>
        );
      case 'tickets':
        return (
          <TableRow>
            <TableHead>{t('tables.ticketId')}</TableHead>
            <TableHead>{t('tables.subject')}</TableHead>
            <TableHead>{t('tables.customerName')}</TableHead>
            <TableHead>{t('tables.status')}</TableHead>
            <TableHead>{t('tables.priority')}</TableHead>
            <TableHead>{t('tables.assignedAgent')}</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    switch (type) {
      case 'leads':
        return filteredData.map(renderLeadRow);
      case 'customers':
        return filteredData.map(renderCustomerRow);
      case 'tickets':
        return filteredData.map(renderTicketRow);
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold gradient-text">{getTitle()}</h2>
              <p className="text-gray-600 mt-1">
                Showing {filteredData.length} of {data.length} records
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportControls 
                data={filteredData} 
                columns={exportColumns[type]} 
                filenamePrefix={`${type}_filtered_report`}
                noteKey={type === 'leads' ? 'notesData' : 'notes'}
              />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {filteredData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      {renderTableHeaders()}
                    </TableHeader>
                    <TableBody>
                      {renderTableRows()}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No records found matching the selected criteria.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
};

export default InteractiveDataView;