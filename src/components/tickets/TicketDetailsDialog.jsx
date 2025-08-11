import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Ticket, User, GitBranch, Calendar, Shield, Hash, Edit, Check, X, MessageSquare, Activity } from 'lucide-react';
import { getTicketStatusColor, getTicketPriorityColor } from '@/lib/constants';

import Notes from '@/components/shared/Notes';
import Attachments from '@/components/shared/Attachments';
import Comments from '@/components/shared/Comments';
import HistoryViewer from '@/components/shared/HistoryViewer';
import useHistoryData from '@/hooks/useHistoryData';
import { supabase } from '../../lib/supabase';

const DetailItem = ({ icon, label, value, children }) => (
  <div className="flex items-start text-sm mb-4">
    <div className="text-gray-500 w-6 h-6 mr-3 mt-1">{icon}</div>
    <div className="flex-1">
      <p className="font-medium text-gray-800">{label}</p>
      {value ? <p className="text-gray-600">{value}</p> : <div className="mt-1">{children}</div>}
    </div>
  </div>
);

const TicketDetailsDialog = ({ ticket, isOpen, onOpenChange }) => {
  console.log(ticket)
  const { t } = useLocale();
  const { updateTicket, settings, updateItem,addComment } = useData();
  const { fetchTicketHistory } = useHistoryData();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);
  const [ticketHistory, setTicketHistory] = useState([]);

  useEffect(() => {
    if (ticket?.id) {
      setEditedTicket(ticket);
      fetchTicketHistory(ticket.id).then(setTicketHistory);
    }
  }, [ticket, fetchTicketHistory]);

  if (!ticket) return null;

  const branchName = settings.branches.find(b => b.id === ticket.branchId)?.name || ticket.branchId;

  const handleEditToggle = () => {
    if (isEditing) {
      updateTicket(editedTicket);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setEditedTicket(ticket);
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setEditedTicket(prev => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
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
    let newAttachments = [...(ticket.attachments || [])];

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
    await updateItem("tickets", ticket.id, { attachments: newAttachments });

    toast({
      title: "Attachments updated",
      description: "File changes saved successfully.",
    });

    // Optional: Refresh local contact object state if needed
  };
  const handleCommentAction = async (comment) => {
    try {
      const success = await addComment('tickets', editedTicket.id, comment);
      if (success) {
        const updatedTicketData = { ...editedTicket, comments: [...(editedTicket.comments || []), comment] };
        setEditedTicket(updatedTicketData);
      }
    } catch (error) {
      toast({ title: "Comment Failed", description: "Failed to add comment. Please try again.", variant: 'destructive' });
    }
  };

  const renderStatusSelector = () => (
    <Select value={editedTicket.status} onValueChange={(v) => handleFieldChange('status', v)}>
      <SelectTrigger>
        <SelectValue>
          <Badge className={getTicketStatusColor(editedTicket.status)}>
            {t(`${editedTicket.status.replace(/[\s-]/g, '')}`)}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.ticketStatuses.map(status => (
          <SelectItem key={status} value={status}>
            {t(`${status.replace(/[\s-]/g, '')}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderPrioritySelector = () => (
    <Select value={editedTicket.priority} onValueChange={(v) => handleFieldChange('priority', v)}>
      <SelectTrigger>
        <SelectValue>
          <Badge className={getTicketPriorityColor(editedTicket.priority)}>
            {t(`${editedTicket.priority}`)}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.ticketPriorities.map(priority => (
          <SelectItem key={priority} value={priority}>
            {t(`${priority}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderAgentSelector = () => (
    <Select value={editedTicket.assignedTo} onValueChange={(v) => handleFieldChange('assignedTo', v)}>
      <SelectTrigger>
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        {settings.agents.map(agent => (
          <SelectItem key={agent} value={agent}>{agent}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-2xl font-bold gradient-text">{ticket.subject}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <Tabs defaultValue="details" className="p-6">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="details">{t('details.ticketDetails')}</TabsTrigger>
                <TabsTrigger value="comments">{t('record.comments')}</TabsTrigger>
                <TabsTrigger value="attachments">{t('record.attachments')}</TabsTrigger>
                <TabsTrigger value="history">{t('details.history')}</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-2">
                  <div>
                    <DetailItem icon={<Hash />} label={t('tables.ticketId')} value={`#${ticket.id.slice(-6)}`} />
                    <DetailItem icon={<User />} label={t('tables.customerName')} value={ticket.customerName} />
                    <DetailItem icon={<GitBranch />} label={t('details.branchPrefix')} value={branchName} />
                    <DetailItem icon={<Calendar />} label={t('details.createdPrefix')} value={new Date(ticket.createdAt).toLocaleString()} />
                  </div>
                  <div>
                    <DetailItem icon={<Activity />} label={t('tables.status')}>{isEditing ? renderStatusSelector() : <Badge className={getTicketStatusColor(ticket.status)}>{t(`${ticket.status.replace(/[\s-]/g, '')}`)}</Badge>}</DetailItem>
                    <DetailItem icon={<Shield />} label={t('tables.priority')}>{isEditing ? renderPrioritySelector() : <Badge className={getTicketPriorityColor(ticket.priority)}>{t(`${ticket.priority}`)}</Badge>}</DetailItem>
                    <DetailItem icon={<User />} label={t('tables.assignedTo')}>{isEditing ? renderAgentSelector() : ticket.assignedTo}</DetailItem>
                  </div>
                  <div className="md:col-span-2">
                    <DetailItem icon={<MessageSquare />} label={t('Description Body')} value={ticket.description} />
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleEditToggle} size="sm"><Check className="w-4 h-4 mr-2" />{t('actions.saveChanges')}</Button>
                      <Button onClick={handleCancelEdit} size="sm" variant="outline"><X className="w-4 h-4 mr-2" />{t('actions.cancel')}</Button>
                    </>
                  ) : (
                    <Button onClick={handleEditToggle} size="sm" variant="outline"><Edit className="w-4 h-4 mr-2" />{t('actions.edit')}</Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments">
                <Comments
                  comments={editedTicket?.comments || []}
                  onAddComment={handleCommentAction}
                />
              </TabsContent>
              <TabsContent value="attachments">
                <Attachments
                  attachments={ticket?.attachments || []}
                  onUpload={files => handleAttachmentAction('add', files)}
                  onDelete={id => handleAttachmentAction('delete', id)}
                />
              </TabsContent>
              <TabsContent value="history">
                <HistoryViewer
                  history={ticketHistory}
                  title={t('details.ticketHistory')}
                  type="ticket"
                />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;