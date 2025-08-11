import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocale } from '@/contexts/LocaleContext';
import useReminders from '@/hooks/useReminders';

const RemindersManagement = () => {
  const { currentUser } = useData();
  const { t } = useLocale();
  const { 
    upcomingReminders, 
    overdueFollowups, 
    loading, 
    markReminderComplete, 
    markFollowupComplete 
  } = useReminders();

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allItems = [
    ...upcomingReminders.map(r => ({ ...r, type: 'reminder' })),
    ...overdueFollowups.map(f => ({ ...f, type: 'followup' }))
  ];

  const filteredItems = allItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && !item.isCompleted) ||
      (filterStatus === 'completed' && item.isCompleted);
    const matchesSearch = item.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleMarkComplete = async (item) => {
    if (item.type === 'reminder') {
      await markReminderComplete(item.id);
    } else {
      await markFollowupComplete(item.id);
    }
  };

  const getStatusBadge = (item) => {
    if (item.type === 'reminder') {
      const days = item.daysUntil;
      if (days < 0) return <Badge variant="destructive">Overdue</Badge>;
      if (days === 0) return <Badge variant="default">Today</Badge>;
      if (days === 1) return <Badge variant="secondary">Tomorrow</Badge>;
      return <Badge variant="outline">Upcoming</Badge>;
    } else {
      const priority = item.priority;
      const colors = {
        'low': 'bg-blue-100 text-blue-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
      };
      return <Badge className={colors[priority] || 'bg-gray-100'}>Overdue</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Reminders & Follow-ups</h1>
              <p className="text-gray-600 text-lg">Manage your reminders and follow-up tasks</p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Plus className="w-5 h-5 me-2" />
                New Reminder
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input 
                placeholder="Search reminders..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="bg-white/50 border-white/30" 
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="followup">Follow-ups</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-effect rounded-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Title/Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, index) => (
              <TableRow key={`${item.type}-${item.id}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.type === 'reminder' ? (
                      <Bell className="w-4 h-4 text-blue-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="capitalize">{item.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.contactName}</TableCell>
                <TableCell>
                  {item.type === 'reminder' ? item.title : `${item.followupType} follow-up`}
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {item.type === 'reminder' 
                      ? new Date(item.reminderDate).toLocaleDateString()
                      : new Date(item.followupDate).toLocaleDateString()
                    }
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(item)}
                </TableCell>
                <TableCell>
                  {!item.isCompleted && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkComplete(item)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reminders found</h3>
            <p className="text-gray-500">
              {allItems.length === 0 
                ? "You're all caught up! No pending reminders or follow-ups."
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RemindersManagement;