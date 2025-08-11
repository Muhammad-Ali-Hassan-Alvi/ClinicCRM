import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const CalendarRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, updateSettings } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const provider = params.get('provider');

    if (provider && ['google', 'outlook'].includes(provider)) {
      const newSyncSettings = {
        ...settings.calendarSync,
        [provider]: { connected: true },
      };
      updateSettings({ calendarSync: newSyncSettings });
      
      toast({
        titleKey: "toasts.calendarSync.connected.title",
        descriptionKey: "toasts.calendarSync.connected.description",
        descriptionValues: { provider: provider.charAt(0).toUpperCase() + provider.slice(1) },
      });
    }

    setTimeout(() => {
      navigate('/settings');
    }, 2500);
  }, [location, navigate, settings, updateSettings, toast, t]);

  return (
    <>
      <Helmet>
        <title>{t('settings.calendarSync.redirect.title')}</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-lg text-center"
        >
          <div className="glass-effect p-10 rounded-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            >
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('settings.calendarSync.redirect.successTitle')}</h1>
            <p className="text-gray-600 mb-8">{t('settings.calendarSync.redirect.successBody')}</p>
            <div className="flex justify-center items-center gap-2 text-purple-600">
              <Zap className="w-5 h-5 animate-pulse" />
              <span>{t('settings.calendarSync.redirect.redirecting')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CalendarRedirect;