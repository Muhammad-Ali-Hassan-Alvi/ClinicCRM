import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Send } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';

const BirthdayRemindersWidget = ({ branchFilter }) => {
  const { contacts, currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();

  const upcomingBirthdays = contacts.filter(contact => {
    if (!contact.birthday) return false;
    
    const userBranches = currentUser?.branchIds || [];
    const isAdmin = currentUser?.role === 'Admin';
    const userHasAccess = isAdmin || userBranches.includes(contact.branchId);
    const matchesBranchFilter = isAdmin ? (branchFilter === 'all' || contact.branchId === branchFilter) : true;

    if (!userHasAccess || !matchesBranchFilter) return false;

    const today = new Date();
    today.setHours(0,0,0,0);
    const birthday = new Date(contact.birthday);
    birthday.setHours(0,0,0,0);
    birthday.setFullYear(today.getFullYear());
    
    if (birthday < today) {
      birthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = birthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 2;
  }).sort((a, b) => {
    const today = new Date();
    const birthdayA = new Date(a.birthday);
    const birthdayB = new Date(b.birthday);
    birthdayA.setFullYear(today.getFullYear());
    birthdayB.setFullYear(today.getFullYear());
    
    if (birthdayA < today) birthdayA.setFullYear(today.getFullYear() + 1);
    if (birthdayB < today) birthdayB.setFullYear(today.getFullYear() + 1);
    
    return birthdayA - birthdayB;
  });

  const getDaysUntilBirthday = (birthdayStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const birthdayThisYear = new Date(birthdayStr);
    birthdayThisYear.setHours(0,0,0,0);
    birthdayThisYear.setFullYear(today.getFullYear());
    
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = birthdayThisYear.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBirthdayMessage = (days) => {
    if (days === 0) return t('dashboard.birthdayToday');
    if (days === 1) return t('dashboard.birthdayTomorrow');
    return t('dashboard.birthdayInDays', { days });
  };

  const handleSendReminder = (contact) => {
    toast({
      title: t("toasts.reminderSent.title"),
      description: t("toasts.reminderSent.birthdayDesc", { name: contact.fullName }),
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Gift className="w-6 h-6 text-pink-600" />
        {t('dashboard.birthdayReminders')}
      </h3>
      
      {upcomingBirthdays.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {upcomingBirthdays.map(contact => {
            const days = getDaysUntilBirthday(contact.birthday);
            return (
              <div key={contact.id} className="p-3 bg-white/50 rounded-lg border border-white/30">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{contact.fullName}</h4>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSendReminder(contact)}
                    className="text-xs"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {t('actions.send')}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{getBirthdayMessage(days)}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t('dashboard.noBirthdays')}</p>
        </div>
      )}
    </motion.div>
  );
};

export default BirthdayRemindersWidget;