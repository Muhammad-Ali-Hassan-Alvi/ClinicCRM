import { supabase } from '@/lib/supabaseClient';

const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[newKey] = toSnakeCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

export const createContactActions = ({ performDbAction, toast, t }) => {
  const addContact = async (formData) => {
    if (!formData.source) {
      toast({ title: t('toasts.validationError.title'), description: t('toasts.sourceRequired'), variant: 'destructive' });
      return false;
    }

    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('id, full_name')
      .eq('phone_number', formData.phoneNumber)
      .maybeSingle();
      
    if (checkError) {
      toast({ title: t('toasts.contactAdded.error'), description: checkError.message, variant: 'destructive' });
      return false;
    }

    if (existingContact) {
      toast({
        title: t('Duplicate Contact Error'),
        description: t('This contact is already created', { name: existingContact.full_name }),
        variant: 'destructive',
      });
      return false;
    }

    const dataToInsert = { ...formData };
    if (dataToInsert.birthday === '') dataToInsert.birthday = null;
    
    if (dataToInsert.notes && typeof dataToInsert.notes === 'string') {
      dataToInsert.notes = [{
        id: Date.now().toString(),
        text: dataToInsert.notes,
        createdAt: new Date().toISOString()
      }];
    }

    return performDbAction(
      () => supabase.from('contacts').insert(toSnakeCase({ 
        ...dataToInsert, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      })),
      { 
        titleKey: 'toasts.contactAdded.title', 
        descriptionKey: 'toasts.contactAdded.description', 
        descriptionValues: { name: formData.fullName } 
      },
      'toasts.contactAdded.error'
    );
  };

  const updateContact = async (contact) => {
    const dataToUpdate = { ...contact };
    if (dataToUpdate.birthday === '') dataToUpdate.birthday = null;

    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('id, full_name')
      .eq('phone_number', dataToUpdate.phoneNumber)
      .not('id', 'eq', dataToUpdate.id)
      .maybeSingle();

    if (checkError) {
      toast({ title: t('toasts.contactUpdated.error'), description: checkError.message, variant: 'destructive' });
      return false;
    }

    if (existingContact) {
      toast({
        title: t('Duplicate Contact Error'),
        description: t('This contact is already created', { name: existingContact.full_name }),
        variant: 'destructive',
      });
      return false;
    }

    return performDbAction(
      () => supabase.from('contacts').update(toSnakeCase({ 
        ...dataToUpdate, 
        updated_at: new Date().toISOString() 
      })).eq('id', contact.id),
      { 
        titleKey: 'toasts.contactUpdated.title', 
        descriptionKey: 'toasts.contactUpdated.description', 
        descriptionValues: { name: contact.fullName } 
      },
      'toasts.contactUpdated.error'
    );
  };

  return { addContact, updateContact };
};