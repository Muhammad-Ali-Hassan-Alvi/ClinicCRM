import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { generateWhatsAppPDF, generateTicketPDF, getPDFBlob } from '@/lib/pdfExport';

const jsonToCsv = (data) => {
  if (!data || data.length === 0) return '';
  const worksheet = XLSX.utils.json_to_sheet(data);
  return XLSX.utils.sheet_to_csv(worksheet);
};

export const generateBackupZip = async (crmData) => {
  const { contacts, leads, customers, tickets, conversations } = crmData;
  const zip = new JSZip();
  const backupFolder = zip.folder(`clinic-crm-backup-${new Date().toISOString().split('T')[0]}`);

  if (contacts?.length) backupFolder.file('contacts.csv', jsonToCsv(contacts));
  if (leads?.length) backupFolder.file('leads.csv', jsonToCsv(leads));

  if (customers?.length) {
    const customerData = customers.map(c => ({
        ...c, 
        notes: JSON.stringify(c.notes), 
        attachments: JSON.stringify(c.attachments.map(a => ({ id: a.id, name: a.name, size: a.size, type: a.type, tags: a.tags, uploadedAt: a.uploadedAt })))
    }));
    backupFolder.file('customers.csv', jsonToCsv(customerData));
    
    const appointmentData = customers.filter(c => c.appointmentDate).map(c => ({
      customerId: c.id,
      customerName: c.contactFullName,
      appointmentDate: c.appointmentDate,
      department: c.department,
      status: c.status
    }));
    if (appointmentData.length > 0) backupFolder.file('appointments.csv', jsonToCsv(appointmentData));
  }

  if (tickets?.length) {
     const ticketData = tickets.map(t => ({
         ...t, 
         notes: JSON.stringify(t.notes), 
         attachments: JSON.stringify(t.attachments.map(a => ({ id: a.id, name: a.name, size: a.size, type: a.type, tags: a.tags, uploadedAt: a.uploadedAt })))
    }));
    backupFolder.file('tickets_summary.csv', jsonToCsv(ticketData));
  }
  
  const whatsappLogsFolder = backupFolder.folder('whatsapp_logs');
  if (conversations?.length) {
    for (const convo of conversations) {
      const customer = customers.find(c => c.contactId === convo.contactId) || contacts.find(c => c.id === convo.contactId);
      if (customer && convo.messages?.length) {
        const pdfDoc = generateWhatsAppPDF(customer, convo);
        const pdfBlob = getPDFBlob(pdfDoc);
        whatsappLogsFolder.file(`${convo.contactName.replace(/\s/g, '_')}_${convo.contactId}.pdf`, pdfBlob);
      }
    }
  }

  const ticketsHistoryFolder = backupFolder.folder('tickets_history');
  if (tickets?.length) {
    for (const ticket of tickets) {
      const customer = customers.find(c => c.id === ticket.customerId || c.contactId === ticket.customerId);
      if (customer) {
        const pdfDoc = generateTicketPDF(customer, ticket);
        const pdfBlob = getPDFBlob(pdfDoc);
        ticketsHistoryFolder.file(`ticket_${ticket.id.slice(-6)}.pdf`, pdfBlob);
      }
    }
  }

  return zip.generateAsync({ type: 'blob' });
};