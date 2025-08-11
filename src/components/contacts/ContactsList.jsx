import React from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';

const ContactsList = ({ contacts, onRowClick }) => {
  const { t } = useLocale();
  const { settings } = useData();

  const getBranchName = (branchId) => {
    return settings.branches.find(b => b.id === branchId)?.name || 'N/A';
  };

  const columns = [
    { key: 'fullName', label: t('tables.fullName') },
    { key: 'phoneNumber', label: t('tables.phone') },
    { key: 'branch', label: t('tables.branch') },
    { key: 'source', label: t('tables.source') },
    { key: 'createdAt', label: t('tables.createdAt') },
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
          {contacts.map(contact => (
            <TableRow key={contact.id} onClick={() => onRowClick(contact)} className="cursor-pointer hover:bg-gray-50/80">
              <TableCell className="font-medium">{contact.fullName}</TableCell>
              <TableCell>{contact.phoneNumber}</TableCell>
              <TableCell>{getBranchName(contact.branchId)}</TableCell>
              <TableCell>{t(`${contact.source.replace(/[\s-]/g, '')}`)}</TableCell>
              <TableCell>{new Date(contact.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        {contacts.length === 0 && (
          <TableCaption>{t('contactManagement.noContactsFound')}</TableCaption>
        )}
      </Table>
    </motion.div>
  );
};

export default ContactsList;