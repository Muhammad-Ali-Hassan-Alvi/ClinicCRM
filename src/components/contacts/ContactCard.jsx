import { motion } from 'framer-motion';
import { Phone, MapPin, Globe, Calendar, MessageSquare, ChevronRight, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';

const ContactCard = ({ contact, index, onCardClick }) => {
  const { t } = useLocale();
  
  return (
    <motion.div
      key={contact.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="contact-card cursor-pointer"
      onClick={() => onCardClick(contact)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{contact.fullName}</h3>
          <p className="text-sm text-gray-500">{t('details.createdPrefix')} {new Date(contact.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-blue-500" /><span>{contact.phoneNumber}</span></div>
        {contact.address && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-green-500" /><span className="truncate">{contact.address}</span></div>}
        {contact.source && <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-purple-500" /><span>{t(`${contact.source.replace(/[\s-]/g, '')}`)}</span></div>}
        {contact.birthday && <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-pink-500" /><span>{new Date(contact.birthday).toLocaleDateString()}</span></div>}
        {contact.instagramUrl && <div className="flex items-center gap-2 text-sm"><Instagram className="w-4 h-4 text-pink-500" /><span className="truncate">{contact.instagramUrl}</span></div>}
        {contact.notes && contact.notes.length > 0 && <div className="flex items-start gap-2 text-sm"><MessageSquare className="w-4 h-4 text-orange-500 mt-0.5" /><span className="text-gray-600 line-clamp-2">{contact.notes[0].text}</span></div>}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end items-center">
        <Button variant="ghost" size="sm">
            {t('record.details')} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ContactCard;