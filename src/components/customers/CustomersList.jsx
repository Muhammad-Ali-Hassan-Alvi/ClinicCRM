import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { getCustomerStatusColor } from '@/lib/constants';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';

const CustomersList = ({ customers, onRowClick }) => {
  const { t } = useLocale();
  const { settings } = useData();

  const getBranchName = (branchId) => {
    return settings.branches.find(b => b.id === branchId)?.name || t('common.notApplicable');
  };

  const columns = [
    { key: 'contactFullName', label: t('tables.customerName') },
    { key: 'branch', label: t('tables.branch') },
    { key: 'department', label: t('tables.department') },
    { key: 'appointmentDate', label: t('tables.appointmentDate') },
    { key: 'status', label: t('tables.status') },
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
          {customers.map(customer => (
            <TableRow key={customer.id} onClick={() => onRowClick(customer)} className="cursor-pointer hover:bg-gray-50/80">
              <TableCell className="font-medium">{customer.contactFullName}</TableCell>
              <TableCell>{getBranchName(customer.branchId)}</TableCell>
              <TableCell>{t(`${customer.department.replace(/[\s-]/g, '')}`)}</TableCell>
              <TableCell>{new Date(customer.appointmentDate).toLocaleString()}</TableCell>
              <TableCell>
                <Badge className={`${getCustomerStatusColor(customer.status)}`}>
                  {t(`${customer.status.replace(/[\s-]/g, '')}`)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {customers.length === 0 && (
          <TableCaption>{t('customerManagement.noCustomersFound')}</TableCaption>
        )}
      </Table>
    </motion.div>
  );
};

export default CustomersList;