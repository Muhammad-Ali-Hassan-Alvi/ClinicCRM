import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { User, Edit, MessageSquare, CalendarDays, History, StickyNote, Paperclip, PhoneCall } from 'lucide-react';

import Notes from '@/components/shared/Notes';
import Attachments from '@/components/shared/Attachments';
import Comments from '@/components/shared/Comments';
import AppointmentManagementPanel from '@/components/customers/AppointmentManagementPanel';
import HistoryViewer from '@/components/shared/HistoryViewer';
import CallHistoryViewer from '@/components/telephony/CallHistoryViewer';
import CustomerDetailsView from '@/components/customers/CustomerDetailsView';
import CustomerEditForm from '@/components/customers/CustomerEditForm';
import useHistoryData from '@/hooks/useHistoryData';
import { useTelephony } from '@/contexts/TelephonyContext';
import { supabase } from '../../lib/supabase';

const CustomerDetailsDialog = ({ customer, isOpen, onOpenChange, defaultTab = 'details' }) => {
  const { t } = useLocale();
  const { toast } = useToast();
  const { settings, updateCustomer, addComment , updateItem} = useData();
  const { fetchCustomerHistory } = useHistoryData();
  const { fetchCallLogsFor } = useTelephony();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setEditedCustomer({ ...customer });
      setLoadingHistory(true);
      Promise.all([
        fetchCustomerHistory(customer.id).then(setCustomerHistory),
        fetchCallLogsFor('customer', customer.contactId).then(setCallLogs)
      ]).finally(() => setLoadingHistory(false));
    } else {
      setEditedCustomer(null);
    }
  }, [customer, fetchCustomerHistory, fetchCallLogsFor]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!customer || !editedCustomer) return null;

  const branchName = settings?.branches?.find(b => b.id === customer.branchId)?.name || customer.branchId || t('common.unknown');

  const handleSaveCustomer = async (updatedCustomerData) => {
    setLoading(true);
    const success = await updateCustomer(updatedCustomerData);
    console.log('Customer updated:', success);
    if (success) {
      if (updatedCustomerData.status === 'No-Show') {
        onOpenChange(false);
      } else {
        setIsEditing(false);
        setEditedCustomer(updatedCustomerData);
        fetchCustomerHistory(updatedCustomerData.id).then(setCustomerHistory);
      }
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    if (customer) {
      setEditedCustomer({ ...customer });
    }
    setIsEditing(false);
  };

  const handleNoteAction = async (action, ...args) => {
    let newNotes = [...(editedCustomer.notes || [])];
    if (action === 'add') newNotes.unshift({ id: Date.now().toString(), text: args[0], createdAt: new Date().toISOString() });
    else if (action === 'update') newNotes = newNotes.map(n => n.id === args[0] ? { ...n, text: args[1], updatedAt: new Date().toISOString() } : n);
    else if (action === 'delete') newNotes = newNotes.filter(n => n.id !== args[0]);

    const success = await updateCustomer({ ...editedCustomer, notes: newNotes });
    if (success) {
      setEditedCustomer(prev => ({ ...prev, notes: newNotes }));
      toast({ title: t('toasts.noteUpdated.title'), description: t('toasts.noteUpdated.description') });
    }
  };

  const uploadFilesToSupabase = async (files) => {
      const uploadedFiles = [];
  
      for (const file of files) {
        const filePath = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);
  
        if (error) {
          console.error("Upload error:", error);
          toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
          });
          continue;
        }
  
        const { data: publicUrlData } = await supabase.storage
          .from("attachments")
          .getPublicUrl(filePath);
  
        uploadedFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrlData.publicUrl,
          createdAt: new Date().toISOString(),
          tags: [],
        });
      }
  
      return uploadedFiles;
    };
  
    const deleteFileFromSupabaseStorage = async (fileUrl) => {
      // "fileUrl" is public URL, we need the file path (relative to bucket)
      const fileName = fileUrl.split("/").pop();
  
      const { error } = await supabase
        .storage
        .from("attachments") // 👈 bucket name
        .remove([fileName]);
  
      if (error) {
        console.error("Storage delete error:", error);
        throw new Error("File could not be deleted.");
      }
    };
  
    const handleAttachmentAction = async (action, payload) => {
      let newAttachments = [...(customer.attachments || [])];
  
      if (action === "add") {
        const files = await uploadFilesToSupabase(payload);
        newAttachments = [...files, ...newAttachments];
      } else if (action === "delete") {
        const fileToDelete = newAttachments.find(f => f.id === payload);
        if (!fileToDelete) return;
  
        try {
          await deleteFileFromSupabaseStorage(fileToDelete.url);
        } catch (error) {
          toast({
            title: "Error deleting file",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
  
        newAttachments = newAttachments.filter(f => f.id !== payload);
      }
  
      // 👇 Save updated attachments array to contacts table
      await updateItem("customers", customer.id, { attachments: newAttachments });
  
      toast({
        title: "Attachments updated",
        description: "File changes saved successfully.",
      });
  
      // Optional: Refresh local contact object state if needed
    };
  const handleCommentAction = async (comment) => {
    const success = await addComment('customers', editedCustomer.id, comment);
    if (success) {
      setEditedCustomer(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
    }
  };

  const tabs = [
    { value: 'details', label: t('details.customerDetails'), icon: User },
    { value: 'appointments', label: t('Appointments Title'), icon: CalendarDays },
    { value: 'notes', label: t('details.internalNotes'), icon: StickyNote },
    { value: 'attachments', label: t('record.attachments'), icon: Paperclip },
    { value: 'calls', label: t('call'), icon: PhoneCall },
    { value: 'comments', label: t('record.comments'), icon: MessageSquare },
    { value: 'history', label: t('details.history'), icon: History }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold gradient-text">{customer.contactFullName}</DialogTitle>
                <p className="text-gray-600 mt-1">{t('details.customerDetails')}</p>
              </div>
              {!isEditing && activeTab === 'details' && (
                <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" />{t('actions.edit')}</Button>
              )}
            </div>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
              <TabsList className="grid w-full grid-cols-7 mb-4">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="details">
                {isEditing ? 
                  <CustomerEditForm customer={editedCustomer} onSave={handleSaveCustomer} onCancel={handleCancelEdit} settings={settings} t={t} loading={loading} /> : 
                  <CustomerDetailsView customer={editedCustomer} branchName={branchName} t={t} settings={settings} />
                }
              </TabsContent>
              <TabsContent value="appointments"><AppointmentManagementPanel customer={editedCustomer} /></TabsContent>
              <TabsContent value="notes"><Notes notes={editedCustomer.notes || []} onAdd={text => handleNoteAction('add', text)} onUpdate={(id, text) => handleNoteAction('update', id, text)} onDelete={id => handleNoteAction('delete', id)} /></TabsContent>
              <TabsContent value="attachments"><Attachments attachments={editedCustomer.attachments || []} onUpload={files => handleAttachmentAction('add', files)} onDelete={id => handleAttachmentAction('delete', id)} /></TabsContent>
              <TabsContent value="calls"><CallHistoryViewer callLogs={callLogs} loading={loadingHistory} /></TabsContent>
              <TabsContent value="comments"><Comments comments={editedCustomer.comments || []} onAddComment={handleCommentAction} /></TabsContent>
              <TabsContent value="history"><HistoryViewer history={customerHistory} title={t('details.customerHistory')} type="customer" /></TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;