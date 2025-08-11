import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import SettingsCard from '@/components/settings/SettingsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const CalendarSyncSettings = () => {
  const { settings } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();

  const handleConnect = (provider) => {
    toast({
      title: t('toasts.calendarSync.connecting.title'),
      description: t('toasts.calendarSync.connecting.description'),
    });
    setTimeout(() => {
      navigate(`/settings/calendar-redirect?provider=${provider}`);
    }, 1500);
  };

  const googleConnected = settings.calendarSync?.google?.connected || false;
  const outlookConnected = settings.calendarSync?.outlook?.connected || false;

  return (
    <SettingsCard
      title={t('settings.calendarSync.title')}
      description={t('settings.calendarSync.description')}
    >
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <img  alt="Google Calendar logo" className="w-6 h-6" src="https://images.unsplash.com/photo-1662057219054-ac91f1c562b5" />
            <span className="font-medium">Google Calendar</span>
            {googleConnected && <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />{t('settings.calendarSync.connected')}</Badge>}
          </div>
          <Button 
            onClick={() => handleConnect('google')} 
            disabled={googleConnected}
            variant={googleConnected ? "secondary" : "default"}
          >
            {googleConnected ? t('settings.calendarSync.connected') : t('settings.calendarSync.connect')} <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <img  alt="Outlook Calendar logo" className="w-6 h-6" src="https://images.unsplash.com/photo-1701276226890-630fa48b504c" />
            <span className="font-medium">Outlook Calendar</span>
            {outlookConnected && <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />{t('settings.calendarSync.connected')}</Badge>}
          </div>
           <Button 
            onClick={() => handleConnect('outlook')} 
            disabled={outlookConnected}
            variant={outlookConnected ? "secondary" : "default"}
          >
            {outlookConnected ? t('settings.calendarSync.connected') : t('settings.calendarSync.connect')} <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
};

export default CalendarSyncSettings;