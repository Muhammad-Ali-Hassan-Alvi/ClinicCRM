import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Phone, MapPin, Globe, Calendar, StickyNote, Paperclip, MessageCircle, GitBranch, Instagram, Edit, X, Save, History, PhoneCall } from 'lucide-react';
import Notes from '@/components/shared/Notes';
import Attachments from '@/components/shared/Attachments';
import Comments from '@/components/shared/Comments';
import HistoryViewer from '@/components/shared/HistoryViewer';
import CallHistoryViewer from '@/components/telephony/CallHistoryViewer';
import useHistoryData from '@/hooks/useHistoryData';
import { useLocale } from '@/contexts/LocaleContext';
import { useTelephony } from '@/contexts/TelephonyContext';
import { supabase } from '../../lib/supabase';

const ContactDetailsDialog = ({ isOpen, onOpenChange, contact, updateContact }) => {
  const { updateItem, addComment, settings, instagramConversations } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const { fetchContactHistory } = useHistoryData();
  const { fetchCallLogsFor } = useTelephony();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(contact);
  const [contactHistory, setContactHistory] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setEditedContact(contact);
    setIsEditing(false);

    if (contact?.id) {
      setLoadingHistory(true);
      Promise.all([
        fetchContactHistory(contact.id).then(setContactHistory),
        fetchCallLogsFor('contact', contact.id).then(setCallLogs)
      ]).finally(() => setLoadingHistory(false));
    }
  }, [contact, fetchContactHistory, fetchCallLogsFor]);

  if (!contact) return null;

  const contactInstagramConversation = instagramConversations.find(c => c.contactId === contact.id);

  const handleNoteAction = (action, ...args) => {
    let newNotes = [...(contact.notes || [])];
    if (action === 'add') {
      newNotes.unshift({ id: Date.now().toString(), text: args[0], createdAt: new Date().toISOString() });
    } else if (action === 'update') {
      newNotes = newNotes.map(n => n.id === args[0] ? { ...n, text: args[1], updatedAt: new Date().toISOString() } : n);
    } else if (action === 'delete') {
      newNotes = newNotes.filter(n => n.id !== args[0]);
    }
    updateItem('contacts', contact.id, { notes: newNotes });
    toast({ title: t('toasts.noteUpdated.title'), description: t('toasts.noteUpdated.description') });
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
    let newAttachments = [...(contact.attachments || [])];

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
    await updateItem("contacts", contact.id, { attachments: newAttachments });

    toast({
      title: "Attachments updated",
      description: "File changes saved successfully.",
    });

    // Optional: Refresh local contact object state if needed
  };

  const handleCommentAction = (comment) => {
    // console.log("comment", contact.id, comment);
    addComment('contacts', contact.id, comment);
  };

  const handleInputChange = (field, value) => {
    setEditedContact(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDetails = async () => {
    if (editedContact.phoneNumber === editedContact.secondaryPhoneNumber && editedContact.phoneNumber !== '' && editedContact.secondaryPhoneNumber !== '') {
      toast({
        title: t('Duplicate Phone Numbers Error'),
        description: t('Primary and secondary phone numbers are same!'),
        variant: "destructive"
      });
      return;
    }
    if (!editedContact.fullName || !editedContact.phoneNumber || !editedContact.branchId || !editedContact.source) {
      toast({
        title: t('Validation Error'),
        description: t('Please fill in all required fields'),
        variant: "destructive"
      });
      return;
    }
    const success = await updateContact(editedContact);
    if (success) {
      setIsEditing(false);
    }
  };

  const branchName = settings.branches.find(b => b.id === contact.branchId)?.name || 'N/A';

  const DetailItem = ({ icon: Icon, value, label }) => (
    <div className="flex items-center gap-3 text-lg">
      <Icon className="w-5 h-5 text-gray-500" />
      <span className="text-gray-800">{value || 'N/A'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold gradient-text">{contact.fullName}</h2>
                <p className="text-gray-600">{t('details.contactDetails')}</p>
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
                  {contactInstagramConversation && <TabsTrigger value="instagram"><Instagram className="w-4 h-4 mr-2" />{t('record.instagram')}</TabsTrigger>}
                </TabsList>
                <TabsContent value="details" className="pt-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">{t('contactManagement.addDialog.fullName')}</Label>
                          <Input id="fullName" value={editedContact.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="phoneNumber">{t('contactManagement.addDialog.phoneNumber')}</Label>
                          <Input id="phoneNumber" value={editedContact.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="secondaryPhoneNumber">{t('contactManagement.addDialog.secondaryPhoneNumber')}</Label>
                          <Input id="secondaryPhoneNumber" value={editedContact.secondaryPhoneNumber} onChange={(e) => handleInputChange('secondaryPhoneNumber', e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="address">{t('contactManagement.addDialog.address')}</Label>
                          <Input id="address" value={editedContact.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="instagramUrl">{t('contactManagement.addDialog.instagramUrl')}</Label>
                          <Input id="instagramUrl" value={editedContact.instagramUrl} onChange={(e) => handleInputChange('instagramUrl', e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="birthday">{t('contactManagement.addDialog.birthday')}</Label>
                          <Input id="birthday" type="date" value={editedContact.birthday} onChange={(e) => handleInputChange('birthday', e.target.value)} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="ghost" onClick={() => { setIsEditing(false); setEditedContact(contact); }}>
                          <X className="w-4 h-4 mr-2" />
                          {t('actions.cancel')}
                        </Button>
                        <Button onClick={handleSaveDetails}>
                          <Save className="w-4 h-4 mr-2" />
                          {t('actions.saveChanges')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <DetailItem icon={Phone} value={contact.phoneNumber} />
                      <DetailItem icon={Phone} value={contact.secondaryPhoneNumber} />
                      <DetailItem icon={MapPin} value={contact.address} />
                      <DetailItem icon={Globe} value={t(`${contact.source.replace(/[\s-]/g, '')}`)} />
                      <DetailItem icon={Calendar} value={contact.birthday ? new Date(contact.birthday).toLocaleDateString() : 'N/A'} />
                      <DetailItem icon={Instagram} value={contact.instagramUrl} />
                      <DetailItem icon={GitBranch} value={branchName} />
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="notes">
                  <Notes notes={contact.notes || []} onAdd={(text) => handleNoteAction('add', text)} onUpdate={(id, text) => handleNoteAction('update', id, text)} onDelete={(id) => handleNoteAction('delete', id)} />
                </TabsContent>
                <TabsContent value="attachments">
                  <Attachments attachments={contact.attachments || []} onUpload={(files) => handleAttachmentAction('add', files)} onDelete={(id) => handleAttachmentAction('delete', id)} />
                </TabsContent>
                <TabsContent value="calls">
                  <CallHistoryViewer callLogs={callLogs} loading={loadingHistory} />
                </TabsContent>
                <TabsContent value="comments">
                  <Comments comments={contact.comments || []} onAddComment={handleCommentAction} />
                </TabsContent>
                <TabsContent value="history">
                  <HistoryViewer
                    history={contactHistory}
                    title={t('Contact History')}
                    type="contact"
                  />
                </TabsContent>
                {contactInstagramConversation && (
                  <TabsContent value="instagram">
                    <div className="space-y-2 max-h-96 overflow-y-auto p-2 rounded-lg bg-gray-50">
                      {contactInstagramConversation.messages.map(msg => (
                        <div key={msg.id} className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-purple-100 text-right' : 'bg-gray-200'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
};

export default ContactDetailsDialog;