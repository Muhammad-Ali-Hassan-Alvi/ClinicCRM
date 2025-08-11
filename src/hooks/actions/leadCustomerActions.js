import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export const createLeadCustomerActions = ({ performDbAction, toast, t, refreshData }) => {
  

  const addLead = async (leadData) => {
    const { data: existingLeads, error: checkError } = await supabase
      .from('leads')
      .select('id')
      .eq('contact_id', leadData.contactId)
      .not('status', 'in', '("Converted", "Lost", "No-Show", "Re-follow")');

    if (checkError) {
      toast({ title: t('toasts.leadCreated.error'), description: checkError.message, variant: 'destructive' });
      return false;
    }

    if (existingLeads && existingLeads.length > 0) {
      toast({
        title: t('Duplicate Lead Error'),
        description: t('Duplicate Lead Error Description'),
        variant: 'destructive',
      });
      return false;
    }

    const notesData = (leadData.notes && typeof leadData.notes === 'string')
      ? [{ id: Date.now().toString(), text: leadData.notes, createdAt: new Date().toISOString() }]
      : [];

    const leadToInsert = {
      contact_id: leadData.contactId,
      contact_full_name: leadData.contactFullName,
      contact_phone_number: leadData.contactPhoneNumber,
      branch_id: leadData.branchId,
      lead_source: leadData.leadSource,
      service_of_interest: leadData.serviceOfInterest,
      date: leadData.date,
      assigned_agent: leadData.assignedAgent,
      status: leadData.status,
      notes_data: notesData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return performDbAction(
      () => supabase.from('leads').insert(leadToInsert),
      {
        titleKey: 'toasts.leadCreated.title',
        descriptionKey: 'toasts.leadCreated.description',
        descriptionValues: { name: leadData.contactFullName }
      },
      'toasts.leadCreated.error'
    );
  };

  const updateLead = async (lead) => {
    return performDbAction(
      () => supabase
        .from('leads')
        .update({
          status: lead.status,
          lead_source: lead.leadSource,
          service_of_interest: lead.serviceOfInterest,
          assigned_agent: lead.assignedAgent,
          date: lead.date,
          notes_data: lead.notesData || [],
          attachments: lead.attachments || [],
          comments: lead.comments || [],
          next_followup_date: lead.nextFollowupDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id),
      {
        titleKey: 'toasts.leadUpdated.title',
        descriptionKey: 'toasts.leadUpdated.description',
        descriptionValues: { name: lead.contactFullName }
      },
      'toasts.leadUpdated.error'
    );
  };


  const convertLeadToCustomer = async (lead, appointmentDetails) => {
    return performDbAction(
      async () => {
        const { data: customerData, error: customerError } = await supabase.from('customers').insert({
          contact_id: lead.contactId,
          contact_full_name: lead.contactFullName,
          contact_phone_number: lead.contactPhoneNumber,
          lead_source: lead.leadSource,
          department: appointmentDetails.department,
          status: 'Booked',
          appointment_date: appointmentDetails.visitDate,
          branch_id: lead.branchId,
          notes: lead.notesData || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lead_id: lead.id,
        }).select().single();

        if (customerError) throw customerError;

        await supabase.from('appointments').insert({
          customer_id: customerData.id,
          contact_id: lead.contactId,
          contact_full_name: lead.contactFullName,
          contact_phone_number: lead.contactPhoneNumber,
          department: appointmentDetails.department,
          appointment_date: appointmentDetails.visitDate,
          status: appointmentDetails.status || 'Scheduled',
          notes: appointmentDetails.notes || `Converted from lead. Original source: ${lead.leadSource}`,
          branch_id: lead.branchId,
        });

        await supabase.from('leads').update({ status: 'Converted' }).eq('id', lead.id);

        return { data: { customerId: customerData.id }, error: null };
      },
      null,
      'toasts.leadConverted.error'
    );
  };

  const updateCustomer = async (customer) => {
   console.log('customer:', customer);
    
    if (customer.status === "No-Show") {
      const { data, error } = await supabase.rpc('handle_customer_no_show', {
        p_customer_id: customer.id,
      });

      console.log('RPC response:', data, error);

      if (error || !data || data?.success === false) {
        toast({
          title: t('toasts.noShowAction.title'),
          description:
            (data && data.message) ||
            (error && error.message) ||
            'An unknown error occurred while processing the no-show.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: t('toasts.noShowAction.title'),
        description: t('toasts.noShowAction.description', {
          name: customer.contactFullName,
        }),
      });

      await refreshData();
      return true;
    }

    // Step 3: If not No-Show, update directly
    return performDbAction(
      () =>
        supabase
          .from('customers')
          .update({
            status: customer?.status,
            department: customer?.department,
            changed_by: customer?.changedBy,
            appointment_date: customer?.appointmentDate,
            notes: customer?.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer?.id),
      {
        titleKey: 'toasts.customerUpdated.title',
        descriptionKey: 'toasts.customerUpdated.description',
        descriptionValues: { name: customer?.contactFullName },
      },
      'toasts.customerUpdated.error'
    );
  };

  return { addLead, updateLead, convertLeadToCustomer, updateCustomer };
};