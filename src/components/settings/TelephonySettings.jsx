import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import SettingsCard from '@/components/settings/SettingsCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, TestTube2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTelephony } from '@/contexts/TelephonyContext';

const TelephonySettings = () => {
  const { settings, updateSettings } = useData();
  const { t } = useLocale();
  const { toast } = useToast();
  const { connect, disconnect, isConnected } = useTelephony();
  const [config, setConfig] = useState({ host: '', port: '', username: '', password: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (settings.telephony_ami_config) {
      setConfig(settings.telephony_ami_config);
    }
  }, [settings.telephony_ami_config]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings({ telephony_ami_config: config });
    setIsSaving(false);
    toast({
      title: t('Save Success Title'),
      description: t('Save Success Description'),
    });
    // If connected, disconnect and reconnect with new settings
    if (isConnected) {
      disconnect();
      setTimeout(() => connect(config), 500);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('test-ami-connection', {
        body: { amiConfig: config },
      });

      if (error) throw error;
      
      if (data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.message });
      }

    } catch (error) {
      setTestResult({ success: false, message: error.message || t('settings.telephony.testError') });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SettingsCard
      title={t('Settings Telephony Title')}
      description={t('Settings Telephony Description')}
    >
      <div className="space-y-4 p-4">
        <div>
          <Label htmlFor="host">{t('Host')}</Label>
          <Input id="host" name="host" value={config.host} onChange={handleInputChange} placeholder="asterisk.example.com" />
        </div>
        <div>
          <Label htmlFor="port">{t('Port')}</Label>
          <Input id="port" name="port" type="number" value={config.port} onChange={handleInputChange} placeholder="5038" />
        </div>
        <div>
          <Label htmlFor="username">{t('Username')}</Label>
          <Input id="username" name="username" value={config.username} onChange={handleInputChange} placeholder="ami_user" />
        </div>
        <div>
          <Label htmlFor="password">{t('Password')}</Label>
          <Input id="password" name="password" type="password" value={config.password} onChange={handleInputChange} />
        </div>
      </div>
      <div className="flex justify-between items-center p-4 border-t">
        <div className="flex items-center gap-2">
            <Button onClick={handleTestConnection} variant="outline" disabled={isTesting}>
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
              {t('Test Connection')}
            </Button>
            
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t('actions.saveChanges')}
        </Button>
        
      </div>
      <div>
        {testResult && (
                <div className={`flex items-center gap-1 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <span>{testResult.message}</span>
                </div>
            )}
      </div>
    </SettingsCard>
  );
};

export default TelephonySettings;