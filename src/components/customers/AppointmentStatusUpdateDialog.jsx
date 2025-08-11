import React from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, User, Calendar } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const AppointmentStatusUpdateDialog = ({ isOpen, onOpenChange, customer, onUpdateStatus }) => {
  const { t } = useLocale();
  
  if (!customer) return null;

  const handleUpdate = (status) => {
    onUpdateStatus(customer.id, status);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
          >
            <div className="p-6 border-b border-gray-200 text-center">
              <h2 className="text-2xl font-bold gradient-text">{t('customerManagement.updateStatusDialog.title')}</h2>
              <p className="text-gray-600 mt-2">{t('customerManagement.updateStatusDialog.description')}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-lg">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-800">{customer.contactFullName}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{new Date(customer.appointmentDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
            <div className="p-6 flex gap-4 justify-center border-t border-gray-200">
              <Button
                onClick={() => handleUpdate('Showed')}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg py-6"
              >
                <Check className="w-6 h-6 mr-2" />
                {t('options.Showed')}
              </Button>
              <Button
                onClick={() => handleUpdate('No-Show')}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg py-6"
              >
                <X className="w-6 h-6 mr-2" />
                {t('options.NoShow')}
              </Button>
            </div>
            <div className="p-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                {t('actions.close')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default AppointmentStatusUpdateDialog;