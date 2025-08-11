import { supabase } from '@/lib/supabaseClient';

const toSnakeCase = (str) => {
  if (!str) return str;
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const keysToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToSnakeCase(v));
  } else if (obj !== null && obj?.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => {
        const newKey = toSnakeCase(key);
        result[newKey] = keysToSnakeCase(obj[key]);
        return result;
      },
      {}
    );
  }
  return obj;
};

export const createTicketActions = ({ performDbAction }) => {
  const addTicket = (ticketData) => performDbAction(
    () => supabase.from('tickets').insert(keysToSnakeCase({ 
      ...ticketData, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    })),
    { 
      titleKey: 'toasts.ticketCreated.title', 
      descriptionKey: 'toasts.ticketCreated.description', 
      descriptionValues: { name: ticketData.customerName } 
    },
    'toasts.ticketCreated.error'
  );

  const updateTicket = (ticket) => performDbAction(
    () => supabase.from('tickets').update(keysToSnakeCase({ 
      ...ticket, 
      updated_at: new Date().toISOString() 
    })).eq('id', ticket.id),
    { 
      titleKey: 'toasts.ticketUpdated.title', 
      descriptionKey: 'toasts.ticketUpdated.description', 
      descriptionValues: { status: ticket.status } 
    },
    'toasts.ticketUpdated.error'
  );

  return { addTicket, updateTicket };
};