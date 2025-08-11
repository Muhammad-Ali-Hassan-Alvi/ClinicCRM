import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocale } from '@/contexts/LocaleContext';

const ContactSearch = ({ contacts, selectedContactId, onSelectContact, onAddNewContact }) => {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!search) return [];
    const lowercasedSearch = search.toLowerCase();
    return contacts.filter(contact =>
      contact.fullName.toLowerCase().includes(lowercasedSearch) ||
      contact.phoneNumber.includes(lowercasedSearch)
    );
  }, [search, contacts]);

  const handleSelect = (contactId) => {
    onSelectContact(contactId);
    setOpen(false);
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedContact
            ? `${selectedContact.fullName} - ${selectedContact.phoneNumber}`
            : t('Select Contact')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={t('Search Contact Placeholder')}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              <div className="text-center py-4">
                <p className="mb-2">{t('No Contact Found')}</p>
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={() => {
                    setOpen(false);
                    onAddNewContact();
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('Create New Contact')}
                </Button>
              </div>
            </CommandEmpty>
            {search.length > 0 && filteredContacts.length > 0 && (
              <CommandGroup heading={t('Search Results')}>
                {filteredContacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={`${contact.fullName} ${contact.phoneNumber}`}
                    onSelect={() => handleSelect(contact.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedContactId === contact.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <p>{contact.fullName}</p>
                      <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {recentContacts.length > 0 && (
              <CommandGroup heading={t('Recent Contacts')}>
                {recentContacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={`${contact.fullName} ${contact.phoneNumber}`}
                    onSelect={() => handleSelect(contact.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedContactId === contact.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <p>{contact.fullName}</p>
                      <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ContactSearch;