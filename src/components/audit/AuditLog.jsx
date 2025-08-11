import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { History, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AuditLog = () => {
  const { auditLog } = useData();
  const { t } = useLocale();
  
  const [moduleFilter, setModuleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const modules = useMemo(() => [...new Set(auditLog.map(log => log.module))], [auditLog]);

  const filteredLog = useMemo(() => {
    return auditLog.filter(log => {
      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        t(`auditLog.actions.${log.action}`, {
          defaultValue: log.action
        }).toLowerCase().includes(lowerSearchTerm) ||
        log.details.toLowerCase().includes(lowerSearchTerm) ||
        log.user.toLowerCase().includes(lowerSearchTerm);
      return matchesModule && matchesSearch;
    });
  }, [auditLog, moduleFilter, searchTerm, t]);

  const getActionBadge = (module) => {
    switch (module) {
      case 'Contacts': return 'bg-blue-100 text-blue-800';
      case 'Leads': return 'bg-yellow-100 text-yellow-800';
      case 'Customers': return 'bg-green-100 text-green-800';
      case 'Tickets': return 'bg-red-100 text-red-800';
      case 'Files': return 'bg-indigo-100 text-indigo-800';
      case 'WhatsApp': return 'bg-teal-100 text-teal-800';
      case 'Settings': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">{t('auditLog.title')}</h1>
          <p className="text-gray-600 text-lg">{t('auditLog.description')}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder={t('auditLog.filter.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ps-10 bg-white/50 border-white/30" />
            </div>
            <div className="relative">
              <Filter className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="ps-10 bg-white/50 border-white/30">
                  <SelectValue placeholder={t('auditLog.filter.allModules')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('auditLog.filter.allModules')}</SelectItem>
                  {modules.map(mod => <SelectItem key={mod} value={mod}>{t(`modules.${mod}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto glass-effect rounded-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('auditLog.table.timestamp')}</TableHead>
              <TableHead>{t('auditLog.table.user')}</TableHead>
              <TableHead>{t('auditLog.table.module')}</TableHead>
              <TableHead>{t('auditLog.table.action')}</TableHead>
              <TableHead>{t('auditLog.table.details')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLog.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell><Badge variant="outline" className={getActionBadge(log.module)}>{t(`modules.${log.module}`)}</Badge></TableCell>
                <TableCell>{t(`auditLog.actions.${log.action}`, { defaultValue: log.action })}</TableCell>
                <TableCell className="text-xs text-gray-600 max-w-sm truncate">{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          {filteredLog.length === 0 && (
            <TableCaption>
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('auditLog.noLogs')}</h3>
              </div>
            </TableCaption>
          )}
        </Table>
      </motion.div>
    </div>
  );
};

export default AuditLog;