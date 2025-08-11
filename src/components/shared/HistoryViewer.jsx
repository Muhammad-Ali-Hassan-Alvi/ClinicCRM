import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Filter, Download, Calendar, Search, Edit, Plus, FileText, BadgeCheck, ShieldAlert, ArrowRightCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/LocaleContext';
import { exportToExcel, exportToPdf } from '@/lib/export';
import { useToast } from '@/components/ui/use-toast';

const HistoryViewer = ({
  history = [],
  title = "History",
  type = "general",
  showUserFilter = true,
  showExport = true
}) => {
  console.log('HistoryViewer:', history);
  const { t } = useLocale();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');

  const uniqueUsers = useMemo(() => {
    const users = [...new Set(history.map(h => h.changed_by_name || h.user_name).filter(Boolean))];
    return users.sort();
  }, [history]);

  const uniqueFields = useMemo(() => {
    const fields = [...new Set(history.map(h => h.field_name).filter(Boolean))];
    return fields.sort();
  }, [history]);

  const getFieldDisplayName = (fieldName) => {
    if (!fieldName) return "Action";
    return t(`history.fields.${fieldName}`, { defaultValue: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });
  };

  const translateValue = (value) => {
    if (value === null || value === undefined || value === '') return t('history.values.empty', { defaultValue: 'empty' });
    return t(`${String(value).replace(/[\s-]/g, '')}`, { defaultValue: value });
  };

  const getActivityIcon = (item) => {
    if (type === 'login') return <User className="w-4 h-4 text-green-600" />;
    if (item.details?.toLowerCase().includes('created')) return <Plus className="w-4 h-4 text-blue-600" />;
    if (item.field_name === 'status' || item.activity_type === 'status_change') return <BadgeCheck className="w-4 h-4 text-purple-600" />;
    if (item.field_name === 'priority' || item.activity_type === 'priority_change') return <ShieldAlert className="w-4 h-4 text-red-600" />;
    if (item.field_name?.includes('agent') || item.activity_type === 'assignment') return <User className="w-4 h-4 text-indigo-600" />;
    if (item.details?.toLowerCase().includes('converted') || item.details?.toLowerCase().includes('moved')) return <ArrowRightCircle className="w-4 h-4 text-teal-600" />;
    if (item.old_value === null) return <Plus className="w-4 h-4 text-blue-600" />;
    return <Edit className="w-4 h-4 text-gray-500" />;
  };

  const formatHistoryItem = (item) => {
    const timestamp = item.changed_at || item.login_time || item.created_at;
    const user = item.changed_by_name || item.user_name || 'System';

    if (type === 'login') {
      return {
        title: `User Logged In`,
        description: `Method: ${item.login_method || 'Unknown'}, IP: ${item.ip_address || 'Not Recorded'}`,
        timestamp, user
      };
    }

    if (item.details) {
      return { title: item.details, description: `Performed by ${user}`, timestamp, user };
    }

    if (item.field_name) {
      const fieldName = getFieldDisplayName(item.field_name);
      const oldValue = translateValue(item.old_value);
      const newValue = translateValue(item.new_value);

      if (item.old_status || item.new_status) {
        const oldStatus = translateValue(item.old_status || 'N/A');
        const newStatus = translateValue(item.new_status);
        return { title: `Status changed from "${oldStatus}" to "${newStatus}"`, description: `By: ${user}`, timestamp, user };
      }

      if (item.old_value === null || item.old_value === '') {
        return { title: `${fieldName} set to "${newValue}"`, description: `By: ${user}`, timestamp, user };
      }
      return { title: `${fieldName} changed from "${oldValue}" to "${newValue}"`, description: `By: ${user}`, timestamp, user };
    }



    if (item.activity_type) {
      const oldValue = translateValue(item.old_value);
      const newValue = translateValue(item.new_value);
      let title = `Ticket updated`;
      if (item.activity_type === 'assignment') title = `Assigned to ${newValue}`;
      else if (item.activity_type === 'priority_change') title = `Priority changed to ${newValue}`;
      else if (item.activity_type === 'status_change') title = `Status changed to ${newValue}`;
      return { title, description: `From "${oldValue}" by ${user}`, timestamp, user };
    }

    return { title: 'Action Recorded', description: 'An update was made to this record.', timestamp, user };
  };

  const filteredHistory = useMemo(() => {
    return history
      .map(item => ({ ...item, formatted: formatHistoryItem(item) }))
      .filter(item => {
        const itemDate = new Date(item.formatted.timestamp);
        const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
        const toDate = dateToFilter ? new Date(dateToFilter) : null;

        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);

        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
          item.formatted.title.toLowerCase().includes(lowerSearchTerm) ||
          item.formatted.description.toLowerCase().includes(lowerSearchTerm);

        const matchesUser = userFilter === 'all' || item.formatted.user === userFilter;
        const matchesDate = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
        const matchesField = fieldFilter === 'all' || item.field_name === fieldFilter;

        return matchesSearch && matchesUser && matchesDate && matchesField;
      });
  }, [history, searchTerm, userFilter, dateFromFilter, dateToFilter, fieldFilter, t]);

  const handleExport = (format) => {
    if (filteredHistory.length === 0) {
      toast({ title: t('export.errorTitle'), description: t('export.noData'), variant: "destructive" });
      return;
    }

    const exportData = filteredHistory.map(({ formatted, ...item }) => ({
      'Timestamp': new Date(formatted.timestamp).toLocaleString(),
      'User': formatted.user,
      'Action': formatted.title,
      'Details': formatted.description,
      'Field': getFieldDisplayName(item.field_name),
      'Old Value': item.old_value || 'N/A',
      'New Value': item.new_value || 'N/A'
    }));

    const filename = `${title.replace(/\s+/g, '_')}_History_${new Date().toISOString().split('T')[0]}`;
    if (format === 'excel') exportToExcel(exportData, filename);
    else {
      const columns = Object.keys(exportData[0]);
      const rows = exportData.map(row => columns.map(col => row[col]));
      exportToPdf(columns, rows, filename);
    }
    toast({ title: t('export.successTitle'), description: t('export.successDescription', { format: format.toUpperCase() }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" /> {title}
        </h3>
        {showExport && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} disabled={filteredHistory.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={filteredHistory.length === 0}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50/50 rounded-lg border">
        <div className="relative col-span-full sm:col-span-1 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        {showUserFilter && uniqueUsers.length > 0 && (
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger><SelectValue placeholder="All Users" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Users</SelectItem>{uniqueUsers.map(user => (<SelectItem key={user} value={user}>{user}</SelectItem>))}</SelectContent>
          </Select>
        )}
        {uniqueFields.length > 0 && (
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger><SelectValue placeholder="All Fields" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Fields</SelectItem>{uniqueFields.map(field => (<SelectItem key={field} value={field}>{getFieldDisplayName(field)}</SelectItem>))}</SelectContent>
          </Select>
        )}
        <Input type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />
        <Input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="w-4 h-4" /> {filteredHistory.length} of {history.length} entries shown.
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id || index}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-start gap-4 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mt-1">
                {getActivityIcon(item)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 break-words">{item.formatted.title}</p>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                  <div className="flex items-center gap-1.5"><User className="w-3 h-3" /><span>{item.formatted.user}</span></div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /><span>{new Date(item.formatted.timestamp).toLocaleString()}</span></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {history.length > 0 && filteredHistory.length === 0 && (
        <div className="text-center py-12 text-gray-500"><Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" /><h3 className="text-lg font-medium mb-2">No Matching History</h3><p>No records match your current filters.</p></div>
      )}

      {history.length === 0 && (
        <div className="text-center py-12 text-gray-500"><Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" /><h3 className="text-lg font-medium mb-2">No History Available</h3><p>No changes have been recorded for this item yet.</p></div>
      )}
    </div>
  );
};

export default HistoryViewer;