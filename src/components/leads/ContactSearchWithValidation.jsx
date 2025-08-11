import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, PlusCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocale } from '@/contexts/LocaleContext';

const ContactSearchWithValidation = ({ contacts, selectedContactId, onSelectContact, onAddNewContact, error }) => {
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
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-red-500 focus:ring-red-500"
            )}
          >
            {selectedContact
              ? `${selectedContact.fullName} - ${selectedContact.phoneNumber}`
              : t('leadsManagement.addDialog.selectContact')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput 
              placeholder={t('leadsManagement.addDialog.searchContactPlaceholder')}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="mb-2">{t('leadsManagement.addDialog.noContactFound')}</p>
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      setOpen(false);
                      onAddNewContact();
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('leadsManagement.addDialog.createNewContact')}
                  </Button>
                </div>
              </CommandEmpty>
              {search.length > 0 && filteredContacts.length > 0 && (
                <CommandGroup heading={t('leadsManagement.addDialog.searchResults')}>
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
                <CommandGroup heading={t('leadsManagement.addDialog.recentContacts')}>
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
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {!selectedContactId && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Contact Required</span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            A lead must always be linked to a contact. Please select a contact or create a new one.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactSearchWithValidation;