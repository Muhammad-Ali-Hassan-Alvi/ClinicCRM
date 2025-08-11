import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';

const keysToCamel = (o) => {
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    const n = {};
    Object.keys(o).forEach((k) => {
      const newKey = k.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
      n[newKey] = keysToCamel(o[k]);
    });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => keysToCamel(i));
  }
  return o;
};

export const useCrmTests = () => {
    const { 
        settings,
        addContact,
        updateContact,
        addLead,
        updateLead,
        convertLeadToCustomer,
        updateCustomer,
        refreshData
    } = useData();

    const testCRMLifecycle = async (logCallback) => {
        let createdIds = { contactId: null, leadId: null, customerId: null, noShowLeadId: null, rebookedCustomerId: null };
        let contactResult;

        const step = async (name, fn) => {
            logCallback('running', `[${name}] Started...`);
            try {
                const result = await fn();
                logCallback('passed', `[${name}] Passed.`, result || { status: 'ok' });
                return result;
            } catch (error) {
                logCallback('failed', `[${name}] Failed: ${error.message}`, { error: error.toString() });
                throw error;
            }
        };

        try {
            await step('Initial Data Sync', async () => {
                await refreshData();
            });

            await step('Pre-flight Checks', async () => {
                if (!settings.branches?.length) throw new Error('No branches configured in settings.');
                if (!settings.departments?.length) throw new Error('No departments configured in settings.');
                return { branches: settings.branches.length, departments: settings.departments.length };
            });

            contactResult = await step('Contact Creation', async () => {
                const testPhoneNumber = `+999${Math.floor(Math.random() * 900000000) + 100000000}`;
                const testContact = {
                    fullName: `TEST - Lifecycle ${Date.now()}`,
                    phoneNumber: testPhoneNumber,
                    source: 'Test',
                    branchId: settings.branches[0].id
                };
                const addSuccess = await addContact(testContact);
                if (!addSuccess) throw new Error('addContact action returned false.');
                
                await new Promise(r => setTimeout(r, 2000));

                const { data, error } = await supabase.from('contacts').select('id, full_name, phone_number').eq('phone_number', testPhoneNumber).single();
                if (error || !data) throw new Error(`Contact not found in DB after creation. Error: ${error?.message}`);
                createdIds.contactId = data.id;
                return { contactId: data.id, details: data };
            });
            
            await step('Contact Update', async () => {
                const updatedName = `${contactResult.details.full_name} (Updated)`;
                const success = await updateContact({ id: createdIds.contactId, fullName: updatedName, phoneNumber: contactResult.details.phone_number });
                if (!success) throw new Error('updateContact action returned false.');
                
                await new Promise(r => setTimeout(r, 2000));

                const { data, error } = await supabase.from('contacts').select('full_name').eq('id', createdIds.contactId).single();
                if (error || !data || data.full_name !== updatedName) throw new Error(`Contact name not updated in DB. Expected: ${updatedName}, Got: ${data?.full_name}`);
                
                contactResult.details.full_name = updatedName;
                return { updatedName: data.full_name };
            });

            await step('Lead Creation', async () => {
                const testLead = {
                    contactId: createdIds.contactId,
                    contactFullName: contactResult.details.full_name,
                    contactPhoneNumber: contactResult.details.phone_number,
                    leadSource: 'Test',
                    serviceOfInterest: settings.departments[0],
                    status: 'Fresh',
                    assignedAgent: 'Unassigned',
                    date: new Date().toISOString().split('T')[0],
                    branchId: settings.branches[0].id
                };
                const success = await addLead(testLead);
                if (!success) throw new Error('addLead action returned false.');

                await new Promise(r => setTimeout(r, 2000));
                
                const { data, error } = await supabase.from('leads').select('id, status').eq('contact_id', createdIds.contactId).single();
                if (error || !data) throw new Error(`Lead not found in DB after creation. Error: ${error?.message}`);
                createdIds.leadId = data.id;
                return { leadId: data.id, details: data };
            });

            await step('Lead Update', async () => {
                const { data: leadToUpdate, error: findLeadError } = await supabase.from('leads').select('*').eq('id', createdIds.leadId).single();
                if (findLeadError || !leadToUpdate) throw new Error('Cannot find lead to update.');

                const success = await updateLead({ ...keysToCamel(leadToUpdate), status: 'Hot' });
                if (!success) throw new Error('updateLead action returned false.');
                
                await new Promise(r => setTimeout(r, 2000));
                
                const { data, error } = await supabase.from('leads').select('status').eq('id', createdIds.leadId).single();
                if (error || !data || data.status !== 'Hot') throw new Error(`Lead status not updated in DB. Expected: Hot, Got: ${data?.status}`);
                return { newStatus: data.status };
            });

            await step('Lead to Customer Conversion', async () => {
                 const { data: leadToConvert, error: findLeadError } = await supabase.from('leads').select('*').eq('id', createdIds.leadId).single();
                 if (findLeadError || !leadToConvert) throw new Error('Cannot find lead to convert.');

                const appointmentDetails = {
                    department: settings.departments[0],
                    visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                };
                const conversionResult = await convertLeadToCustomer(keysToCamel(leadToConvert), appointmentDetails);
                if (!conversionResult) throw new Error('convertLeadToCustomer action returned false');

                await new Promise(r => setTimeout(r, 2000));

                const { data: customerData, error } = await supabase.from('customers').select('id').eq('lead_id', createdIds.leadId).single();
                if (error || !customerData) throw new Error(`Customer not found in DB after conversion. Error: ${error?.message}`);
                createdIds.customerId = customerData.id;

                const { data: convertedLead, error: leadStatusError } = await supabase.from('leads').select('status').eq('id', createdIds.leadId).single();
                if(leadStatusError || convertedLead?.status !== 'Converted') throw new Error(`Lead status not updated to Converted. Is: ${convertedLead?.status || 'not found'}`);
                return { customerId: customerData.id };
            });

            await step('Customer No-Show', async () => {
                const { data: customerToUpdateData, error: findCustomerError } = await supabase.from('customers').select('*').eq('id', createdIds.customerId).single();
                if (findCustomerError || !customerToUpdateData) throw new Error('Cannot find customer to mark as No-Show.');

                const success = await updateCustomer({ ...keysToCamel(customerToUpdateData), status: 'No-Show' });
                if (!success) throw new Error('updateCustomer (No-Show) action returned false');

                await new Promise(r => setTimeout(r, 2000));
                
                const { data: customerData, error: checkDeletedCustomerError } = await supabase.from('customers').select('id').eq('id', createdIds.customerId).maybeSingle();
                if (checkDeletedCustomerError) throw new Error(`Error checking for deleted customer: ${checkDeletedCustomerError.message}`);
                if (customerData) throw new Error('Customer was not deleted from customers table after No-Show.');

                const { data: noShowLead, error: findNoShowLeadError } = await supabase.from('leads').select('id').eq('status', 'No-Show').eq('contact_id', createdIds.contactId).single();
                if (findNoShowLeadError || !noShowLead) throw new Error(`No-Show lead not found in DB. Error: ${findNoShowLeadError?.message}`);
                createdIds.noShowLeadId = noShowLead.id;
                
                return { noShowLeadId: noShowLead.id };
            });

            await step('Re-engage No-Show Lead', async () => {
                const { data: noShowLead, error: findLeadError } = await supabase.from('leads').select('*').eq('id', createdIds.noShowLeadId).single();
                if (findLeadError || !noShowLead) throw new Error('Cannot find No-Show lead to re-engage.');

                const appointmentDetails = {
                    department: settings.departments[0],
                    visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                };
                const conversionResult = await convertLeadToCustomer(keysToCamel(noShowLead), appointmentDetails);
                if (!conversionResult) throw new Error('convertLeadToCustomer action for re-engagement returned false');

                await new Promise(r => setTimeout(r, 2000));

                const { data: customerData, error } = await supabase.from('customers').select('id').eq('lead_id', createdIds.noShowLeadId).single();
                if (error || !customerData) throw new Error(`Re-booked customer not found in DB. Error: ${error?.message}`);
                createdIds.rebookedCustomerId = customerData.id;
                return { rebookedCustomerId: customerData.id };
            });

        } finally {
            await step('Cleanup', async () => {
                const deleted = [];
                if (createdIds.rebookedCustomerId) {
                    await supabase.from('appointments').delete().eq('customer_id', createdIds.rebookedCustomerId);
                    deleted.push(`Appointments for Rebooked Customer: ${createdIds.rebookedCustomerId}`);
                    await supabase.from('customers').delete().eq('id', createdIds.rebookedCustomerId);
                    deleted.push(`Rebooked Customer: ${createdIds.rebookedCustomerId}`);
                }
                if (createdIds.customerId) {
                    await supabase.from('appointments').delete().eq('customer_id', createdIds.customerId);
                    deleted.push(`Appointments for Customer: ${createdIds.customerId}`);
                    await supabase.from('customers').delete().eq('id', createdIds.customerId);
                    deleted.push(`Customer: ${createdIds.customerId}`);
                }
                if (createdIds.contactId) {
                    const { data: leadsToDelete } = await supabase.from('leads').select('id').eq('contact_id', createdIds.contactId);
                    if (leadsToDelete && leadsToDelete.length > 0) {
                        const leadIds = leadsToDelete.map(l => l.id);
                        await supabase.from('leads').delete().in('id', leadIds);
                        deleted.push(`Leads: ${leadIds.join(', ')}`);
                    }
                    await supabase.from('contacts').delete().eq('id', createdIds.contactId);
                    deleted.push(`Contact: ${createdIds.contactId}`);
                }
                return { cleanedIds: createdIds, deleted };
            });
        }

        return { message: 'Full CRM lifecycle test passed successfully!' };
    };

    return { testCRMLifecycle };
};