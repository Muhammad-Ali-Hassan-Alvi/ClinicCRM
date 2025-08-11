import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { StickyNote, Paperclip, MessageCircle, Edit, X, History, PhoneCall } from 'lucide-react';
import Notes from '@/components/shared/Notes';
import Attachments from '@/components/shared/Attachments';
import Comments from '@/components/shared/Comments';
import HistoryViewer from '@/components/shared/HistoryViewer';
import CallHistoryViewer from '@/components/telephony/CallHistoryViewer';
import useHistoryData from '@/hooks/useHistoryData';
import { useLocale } from '@/contexts/LocaleContext';
import LeadDetailsView from './LeadDetailsView';
import LeadEditForm from './LeadEditForm';
import { useTelephony } from '@/contexts/TelephonyContext';
import { supabase } from '../../lib/supabase';

const LeadDetailsDialog = ({ isOpen, onOpenChange, lead, onUpdateLead }) => {
  const { addComment, settings, updateLead, updateItem } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const { fetchLeadHistory } = useHistoryData();
  const { fetchCallLogsFor } = useTelephony();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState(null);
  const [leadHistory, setLeadHistory] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setEditedLead({
        ...lead,
        status: lead.status || 'Fresh',
        leadSource: lead.leadSource || '',
        serviceOfInterest: lead.serviceOfInterest || '',
        assignedAgent: lead.assignedAgent || 'Unassigned',
        date: lead.date || new Date().toISOString().split('T')[0],
        notesData: lead.notesData || [],
        attachments: lead.attachments || [],
        comments: lead.comments || [],
        branchId: lead.branchId || null
      });
      setIsEditing(false);

      if (lead.id) {
        setLoadingHistory(true);
        Promise.all([
          fetchLeadHistory(lead.id).then(setLeadHistory),
          fetchCallLogsFor('lead', lead.id).then(setCallLogs)
        ]).finally(() => setLoadingHistory(false));
      }
    } else {
      setEditedLead(null);
    }
  }, [lead, fetchLeadHistory, fetchCallLogsFor]);

  if (!lead || !editedLead) return null;

  const handleNoteAction = async (action, ...args) => {
    try {
      let newNotes = [...(editedLead.notesData || [])];
      if (action === 'add') {
        newNotes.unshift({ id: Date.now().toString(), text: args[0], createdAt: new Date().toISOString() });
      } else if (action === 'update') {
        newNotes = newNotes.map(n => n.id === args[0] ? { ...n, text: args[1], updatedAt: new Date().toISOString() } : n);
      } else if (action === 'delete') {
        newNotes = newNotes.filter(n => n.id !== args[0]);
      }

      const updatedLeadData = { ...editedLead, notesData: newNotes };
      const success = await updateLead(updatedLeadData);

      if (success) {
        setEditedLead(updatedLeadData);
        toast({ title: t('toasts.noteUpdated.title'), description: t('toasts.noteUpdated.description') });
      }
    } catch (error) {
      toast({ title: "Note Update Failed", description: "Failed to update note. Please try again.", variant: 'destructive' });
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
    let newAttachments = [...(lead.attachments || [])];

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
    await updateItem("leads", lead.id, { attachments: newAttachments });

    toast({
      title: "Attachments updated",
      description: "File changes saved successfully.",
    });

    // Optional: Refresh local contact object state if needed
  };

  const handleCommentAction = async (comment) => {
    try {
      const success = await addComment('leads', editedLead.id, comment);
      if (success) {
        const updatedLeadData = { ...editedLead, comments: [...(editedLead.comments || []), comment] };
        setEditedLead(updatedLeadData);
      }
    } catch (error) {
      toast({ title: "Comment Failed", description: "Failed to add comment. Please try again.", variant: 'destructive' });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDetails = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (!editedLead.status || !editedLead.assignedAgent || !editedLead.date) {
        toast({ title: "Validation Error", description: "Please fill in all required fields (Status, Agent, Date).", variant: 'destructive' });
        setIsSaving(false);
        return;
      }

      onUpdateLead(editedLead);
      onOpenChange(false);

    } catch (error) {
      toast({ title: "Save Failed", description: "Failed to save changes. Please try again.", variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLead({
      ...lead,
      status: lead.status || 'Fresh',
      leadSource: lead.leadSource || '',
      serviceOfInterest: lead.serviceOfInterest || '',
      assignedAgent: lead.assignedAgent || 'Unassigned',
      date: lead.date || new Date().toISOString().split('T')[0],
      notesData: lead.notesData || [],
      attachments: lead.attachments || [],
      comments: lead.comments || [],
      branchId: lead.branchId || null
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold gradient-text">{editedLead.contactFullName || 'Unknown Contact'}</h2>
                <p className="text-gray-600">{t('details.leadDetails')}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('actions.edit')}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              <Tabs defaultValue="details" className="p-6">
                <TabsList>
                  <TabsTrigger value="details">{t('record.details')}</TabsTrigger>
                  <TabsTrigger value="notes"><StickyNote className="w-4 h-4 mr-2" />{t('record.notes')}</TabsTrigger>
                  <TabsTrigger value="attachments"><Paperclip className="w-4 h-4 mr-2" />{t('record.attachments')}</TabsTrigger>
                  <TabsTrigger value="calls"><PhoneCall className="w-4 h-4 mr-2" />{t('calls')}</TabsTrigger>
                  <TabsTrigger value="comments"><MessageCircle className="w-4 h-4 mr-2" />{t('record.comments')}</TabsTrigger>
                  <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />{t('details.history')}</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-6">
                  {isEditing ? (
                    <LeadEditForm
                      editedLead={editedLead}
                      onInputChange={handleInputChange}
                      onSave={handleSaveDetails}
                      onCancel={handleCancelEdit}
                      isSaving={isSaving}
                      settings={settings}
                      t={t}
                    />
                  ) : (
                    <LeadDetailsView
                      editedLead={editedLead}
                      settings={settings}
                      t={t}
                    />
                  )}
                </TabsContent>
                <TabsContent value="notes">
                  <Notes
                    notes={editedLead.notesData || []}
                    onAdd={(text) => handleNoteAction('add', text)}
                    onUpdate={(id, text) => handleNoteAction('update', id, text)}
                    onDelete={(id) => handleNoteAction('delete', id)}
                  />
                </TabsContent>
                <TabsContent value="attachments">
                  <Attachments
                    attachments={editedLead.attachments || []}
                    onUpload={(files) => handleAttachmentAction('add', files)}
                    onDelete={(id) => handleAttachmentAction('delete', id)}
                  />
                </TabsContent>
                <TabsContent value="calls">
                  <CallHistoryViewer callLogs={callLogs} loading={loadingHistory} />
                </TabsContent>
                <TabsContent value="comments">
                  <Comments
                    comments={editedLead.comments || []}
                    onAddComment={handleCommentAction}
                  />
                </TabsContent>
                <TabsContent value="history">
                  <HistoryViewer
                    history={leadHistory}
                    title={t('details.leadHistory')}
                    type="lead"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default LeadDetailsDialog;