import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLocale();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full">
      <Globe className="h-5 w-5" />
      <span className="sr-only">{t('languageSwitcher.changeLanguage')}</span>
    </Button>
  );
};

export default LanguageSwitcher;