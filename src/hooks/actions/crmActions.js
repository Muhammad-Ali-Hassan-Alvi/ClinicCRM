export const createCrmActions = (dataState, setters, logAction, toast, syncAppointmentToCalendar, sendAutoWhatsAppMessage, linkInstagramConversationToContact, currentUser) => {
  const { contacts, customers, settings } = dataState;
  const { setContacts, setLeads, setCustomers, setTickets, setConversations } = setters;

  const addContact = (formData, originalWhatsAppNumber = null) => {
    const phoneExists = (phone) => {
        if (!phone) return false;
        return contacts.some(c => c.phoneNumber === phone || c.secondaryPhoneNumber === phone);
    };

    if (phoneExists(formData.phoneNumber) || (formData.secondaryPhoneNumber && phoneExists(formData.secondaryPhoneNumber))) {
        toast({ title: "Duplicate Phone Number", description: "This phone number is already saved in the system under another contact.", variant: "destructive" });
        return false;
    }

    const noteText = formData.notes;
    const initialNotes = noteText ? [{ id: Date.now().toString(), text: noteText, createdAt: new Date().toISOString() }] : [];
    const contactWithMeta = { 
      ...formData, 
      id: Date.now().toString(), 
      notes: initialNotes, 
      attachments: [], 
      comments: [], 
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setContacts(prev => [contactWithMeta, ...prev]);
    toast({ title: toast.t('toasts.contactAdded.title'), description: toast.t('toasts.contactAdded.description', { name: formData.fullName }) });
    logAction('CONTACT_CREATED', 'Contacts', { name: formData.fullName, id: contactWithMeta.id, branchId: formData.branchId });
    
    if (formData.instagramUrl) {
      const username = formData.instagramUrl.split('/').filter(Boolean).pop();
      linkInstagramConversationToContact(username, contactWithMeta);
    }

    if (originalWhatsAppNumber) {
      setConversations(prevConvos => 
        prevConvos.map(convo => {
          if (convo.contactId === originalWhatsAppNumber) {
            return {
              ...convo,
              contactId: contactWithMeta.id,
              contactName: contactWithMeta.fullName,
              contactAvatar: contactWithMeta.fullName.substring(0, 2).toUpperCase(),
            };
          }
          return convo;
        })
      );
    }
    return true;
  };

  const updateContact = (updatedContact) => {
    const otherContacts = contacts.filter(c => c.id !== updatedContact.id);
    const phoneExists = (phone) => {
        if (!phone) return false;
        return otherContacts.some(c => c.phoneNumber === phone || c.secondaryPhoneNumber === phone);
    };

    if (phoneExists(updatedContact.phoneNumber) || (updatedContact.secondaryPhoneNumber && phoneExists(updatedContact.secondaryPhoneNumber))) {
        toast({ title: "Duplicate Phone Number", description: "This phone number is already saved in the system under another contact.", variant: "destructive" });
        return false;
    }

    const oldContact = contacts.find(c => c.id === updatedContact.id);
    let newHistory = oldContact?.history || [];

    const fieldsToTrack = {
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        secondaryPhoneNumber: 'Secondary Phone',
        address: 'Address',
        source: 'Source',
        instagramUrl: 'Instagram URL',
        birthday: 'Birthday'
    };

    Object.keys(fieldsToTrack).forEach(field => {
        const oldValue = oldContact?.[field] || '';
        const newValue = updatedContact[field] || '';
        if (oldValue !== newValue) {
            newHistory.unshift({
                field: fieldsToTrack[field],
                from: oldValue,
                to: newValue,
                user: currentUser?.name || 'System',
                date: new Date().toISOString(),
            });
        }
    });

    const contactWithHistory = { ...updatedContact, history: newHistory, updatedAt: new Date().toISOString() };
    setContacts(prev => prev.map(c => c.id === contactWithHistory.id ? contactWithHistory : c));
    toast({ 
      title: toast.t('toasts.contactUpdated.title'), 
      description: toast.t('toasts.contactUpdated.description', { name: contactWithHistory.fullName })
    });
    logAction('CONTACT_UPDATED', 'Contacts', { name: contactWithHistory.fullName, id: contactWithHistory.id, branchId: contactWithHistory.branchId });
    return true;
  };

  const addLead = (newLead) => {
    const leadWithMeta = { ...newLead, id: Date.now().toString(), notesData: [], attachments: [], comments: [], statusHistory: [] };
    setLeads(prev => [leadWithMeta, ...prev]);
    toast({ title: toast.t('toasts.leadCreated.title'), description: toast.t('toasts.leadCreated.description', { name: newLead.contactFullName })});
    logAction('LEAD_CREATED', 'Leads', { name: newLead.contactFullName, id: leadWithMeta.id, branchId: newLead.branchId });
  };

  const updateLead = (updatedLead) => {
    const oldLead = dataState.leads.find(l => l.id === updatedLead.id);
    let newStatusHistory = oldLead?.statusHistory || [];

    if (oldLead && oldLead.status !== updatedLead.status) {
      newStatusHistory.unshift({
        from: oldLead.status,
        to: updatedLead.status,
        date: new Date().toISOString(),
        user: currentUser?.name || 'System',
      });
    }
    
    const leadWithHistory = { ...updatedLead, statusHistory: newStatusHistory, updatedAt: new Date().toISOString() };

    setLeads(prev => prev.map(l => l.id === leadWithHistory.id ? leadWithHistory : l));
    toast({ title: toast.t('toasts.leadStatusUpdated.title'), description: toast.t('toasts.leadStatusUpdated.description', { status: updatedLead.status })});
    logAction('LEAD_UPDATED', 'Leads', { name: updatedLead.contactFullName, id: updatedLead.id, status: updatedLead.status, branchId: updatedLead.branchId });
  };

  const convertLeadToCustomer = (lead, appointmentDetails) => {
    const newCustomer = {
      id: lead.id, contactId: lead.contactId, contactFullName: lead.contactFullName,
      contactPhoneNumber: contacts.find(c => c.id === lead.contactId)?.phoneNumber,
      leadSource: lead.leadSource, department: appointmentDetails.department, status: 'Booked',
      appointmentDate: appointmentDetails.appointmentDate, createdAt: new Date().toISOString(),
      leadCreatedAt: lead.createdAt, notes: lead.notesData || [], attachments: lead.attachments || [],
      comments: lead.comments || [], branchId: lead.branchId, statusHistory: [],
    };
    setCustomers(prev => [newCustomer, ...prev]);
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    toast({ title: toast.t('toasts.leadConverted.title'), description: toast.t('toasts.leadConverted.description', { name: lead.contactFullName })});
    logAction('LEAD_CONVERTED', 'Customers', { name: lead.contactFullName, id: lead.id, branchId: lead.branchId });
    syncAppointmentToCalendar(newCustomer);
    sendAutoWhatsAppMessage('confirmation', newCustomer, appointmentDetails);
    
    const appointmentDate = new Date(appointmentDetails.appointmentDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if(appointmentDate.toDateString() === tomorrow.toDateString()){
       sendAutoWhatsAppMessage('reminder', newCustomer);
    }
  };

  const moveCustomerToLeads = (customer) => {
    const newLead = {
      id: customer.id, contactId: customer.contactId, contactFullName: customer.contactFullName,
      leadSource: customer.leadSource, date: new Date().toISOString().split('T')[0],
      assignedAgent: 'Unassigned', status: 'Re-follow', branchId: customer.branchId,
      notes: `No-show on ${new Date(customer.appointmentDate).toLocaleDateString()}. Needs follow-up.`,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      notesData: customer.notes || [], attachments: customer.attachments || [],
      comments: customer.comments || [], statusHistory: [],
    };
    setLeads(prev => [newLead, ...prev]);
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    toast({ title: toast.t('toasts.noShowAction.title'), description: toast.t('toasts.noShowAction.description', { name: customer.contactFullName })});
    logAction('CUSTOMER_NO_SHOW', 'Leads', { name: customer.contactFullName, id: customer.id, branchId: customer.branchId });
  };

  const updateCustomer = (updatedCustomer) => {
    const oldCustomer = customers.find(c => c.id === updatedCustomer.id);
    let newStatusHistory = oldCustomer?.statusHistory || [];

    if (oldCustomer && oldCustomer.status !== updatedCustomer.status) {
      newStatusHistory.unshift({
        from: oldCustomer.status,
        to: updatedCustomer.status,
        date: new Date().toISOString(),
        user: currentUser?.name || 'System',
      });
    }

    const customerWithHistory = { ...updatedCustomer, statusHistory: newStatusHistory, updatedAt: new Date().toISOString() };

    if (customerWithHistory.status === 'No-Show' && oldCustomer?.status !== 'No-Show') {
      moveCustomerToLeads(customerWithHistory);
    } else {
      setCustomers(prev => prev.map(c => c.id === customerWithHistory.id ? customerWithHistory : c));
      logAction('CUSTOMER_UPDATED', 'Customers', { name: customerWithHistory.contactFullName, id: customerWithHistory.id, status: customerWithHistory.status, branchId: customerWithHistory.branchId });
      
      if (['Booked', 'Rescheduled'].includes(customerWithHistory.status) && oldCustomer?.status !== customerWithHistory.status) {
        syncAppointmentToCalendar(customerWithHistory);
        sendAutoWhatsAppMessage('confirmation', customerWithHistory);
        const appointmentDate = new Date(customerWithHistory.appointmentDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if(appointmentDate.toDateString() === tomorrow.toDateString()){
           sendAutoWhatsAppMessage('reminder', customerWithHistory);
        }
      }
      if (customerWithHistory.status === 'Showed' && oldCustomer?.status !== 'Showed') {
        sendAutoWhatsAppMessage('feedback', customerWithHistory);
      }
    }
  };

  const addTicket = (newTicket) => {
    const ticketWithMeta = { 
        ...newTicket, 
        id: Date.now().toString(), 
        notes: [], 
        attachments: [], 
        comments: [],
        history: [{
            field: 'Created',
            from: '',
            to: '',
            user: currentUser?.name || 'System',
            date: new Date().toISOString(),
        }]
    };
    setTickets(prev => [ticketWithMeta, ...prev]);
    toast({ title: toast.t('toasts.ticketCreated.title'), description: toast.t('toasts.ticketCreated.description', { name: newTicket.customerName })});
    logAction('TICKET_CREATED', 'Tickets', { subject: newTicket.subject, id: ticketWithMeta.id, branchId: newTicket.branchId });
  };

  const updateTicket = (updatedTicket) => {
    const oldTicket = dataState.tickets.find(t => t.id === updatedTicket.id);
    let newHistory = oldTicket?.history || [];

    const fieldsToTrack = {
        status: 'Status',
        priority: 'Priority',
        assignedTo: 'Assigned to',
        department: 'Department'
    };

    Object.keys(fieldsToTrack).forEach(field => {
        if (oldTicket && oldTicket[field] !== updatedTicket[field]) {
            newHistory.unshift({
                field: fieldsToTrack[field],
                from: oldTicket[field],
                to: updatedTicket[field],
                user: currentUser?.name || 'System',
                date: new Date().toISOString(),
            });
        }
    });
    
    const ticketWithHistory = { ...updatedTicket, history: newHistory, updatedAt: new Date().toISOString() };

    setTickets(prev => prev.map(t => t.id === ticketWithHistory.id ? ticketWithHistory : t));
    toast({ title: toast.t('toasts.ticketUpdated.title'), description: toast.t('toasts.ticketUpdated.description', { status: ticketWithHistory.status })});
    logAction('TICKET_UPDATED', 'Tickets', { subject: ticketWithHistory.subject, id: ticketWithHistory.id, status: ticketWithHistory.status, branchId: ticketWithHistory.branchId });
  };

  const requestAppointment = (bookingData) => {
    const branchId = settings.branches?.[0]?.id || null;
    let contact = contacts.find(c => c.phoneNumber === bookingData.phoneNumber);
    let contactId;

    if (contact) {
      contactId = contact.id;
    } else {
      const newContact = {
        id: Date.now().toString(), fullName: bookingData.fullName, phoneNumber: bookingData.phoneNumber,
        email: bookingData.email || '', birthday: bookingData.birthday, source: 'Online Booking',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), notes: [], attachments: [], comments: [],
        branchId
      };
      contactId = newContact.id;
      setContacts(prev => [newContact, ...prev]);
      logAction('CONTACT_CREATED', 'Booking Page', { name: newContact.fullName, id: contactId, branchId });
    }

    const newCustomer = {
      id: Date.now().toString() + '_cust', contactId: contactId, contactFullName: bookingData.fullName,
      contactPhoneNumber: bookingData.phoneNumber, leadSource: 'Online Booking', department: bookingData.department,
      status: 'Booked', appointmentDate: bookingData.appointmentDateTime, createdAt: new Date().toISOString(),
      notes: [{ id: Date.now().toString() + '_note', text: `Online Booking Request Notes: ${bookingData.notes || 'N/A'}`, createdAt: new Date().toISOString() }],
      attachments: [], comments: [], branchId, statusHistory: [],
    };

    setCustomers(prev => [newCustomer, ...prev]);
    logAction('APPOINTMENT_REQUESTED', 'Booking Page', { name: newCustomer.contactFullName, id: newCustomer.id, branchId });
    toast({ title: toast.t('toasts.appointmentRequested.title'), description: toast.t('toasts.appointmentRequested.description', { name: newCustomer.contactFullName })});
    syncAppointmentToCalendar(newCustomer);
    sendAutoWhatsAppMessage('confirmation', newCustomer, { appointmentDate: bookingData.appointmentDateTime, department: bookingData.department });

    const appointmentDate = new Date(bookingData.appointmentDateTime);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if(appointmentDate.toDateString() === tomorrow.toDateString()){
       sendAutoWhatsAppMessage('reminder', newCustomer);
    }
    return { success: true };
  };

  return { addContact, updateContact, addLead, updateLead, convertLeadToCustomer, updateCustomer, addTicket, updateTicket, moveCustomerToLeads, requestAppointment };
};