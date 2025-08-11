import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';
import useReminders from '@/hooks/useReminders';

const RemindersWidget = ({ branchFilter }) => {
  const { currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const { 
    upcomingReminders, 
    overdueFollowups, 
    loading, 
    markReminderComplete, 
    markFollowupComplete 
  } = useReminders();

  const handleMarkReminderComplete = async (reminderId) => {
    const success = await markReminderComplete(reminderId);
    if (success) {
      toast({
        title: "Reminder Completed",
        description: "The reminder has been marked as completed.",
      });
    }
  };

  const handleMarkFollowupComplete = async (followupId) => {
    const success = await markFollowupComplete(followupId);
    if (success) {
      toast({
        title: "Follow-up Completed",
        description: "The follow-up has been marked as completed.",
      });
    }
  };

  const getDaysMessage = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `In ${days} days`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  const allReminders = [...upcomingReminders, ...overdueFollowups];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Bell className="w-6 h-6 text-blue-600" />
        Reminders & Follow-ups
        {allReminders.length > 0 && (
          <Badge variant="destructive" className="ml-2">
            {allReminders.length}
          </Badge>
        )}
      </h3>
      
      {allReminders.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {/* Upcoming Reminders */}
          {upcomingReminders.map(reminder => (
            <div key={`reminder-${reminder.id}`} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-gray-800">{reminder.title}</h4>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMarkReminderComplete(reminder.id)}
                  className="text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-1">{reminder.contactName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{getDaysMessage(reminder.daysUntil)}</span>
                <Badge variant="outline" className="text-xs">
                  {reminder.reminderType}
                </Badge>
              </div>
            </div>
          ))}

          {/* Overdue Follow-ups */}
          {overdueFollowups.map(followup => (
            <div key={`followup-${followup.id}`} className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-medium text-gray-800">Follow-up: {followup.contactName}</h4>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMarkFollowupComplete(followup.id)}
                  className="text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{followup.daysOverdue} days overdue</span>
                <Badge className={getPriorityColor(followup.priority)}>
                  {followup.priority}
                </Badge>
                <Badge variant="outline">
                  {followup.followupType}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No pending reminders or follow-ups</p>
          <p className="text-sm">Great job staying on top of everything!</p>
        </div>
      )}
    </motion.div>
  );
};

export default RemindersWidget;