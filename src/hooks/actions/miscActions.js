import { supabase } from '@/lib/supabaseClient';

export const createMiscActions = ({ toast, refreshData, dataState }) => {
  const requestAppointment = async (bookingData) => {
    try {
      const { data, error } = await supabase.functions.invoke('request-appointment', {
        body: { bookingData },
      });
      
      if (error) {
        toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
        return { success: false };
      }
      
      await refreshData();
      toast({ 
        title: "Appointment Requested!", 
        description: `Thank you ${bookingData.fullName}. We'll contact you shortly to confirm.` 
      });
      return { success: true };
    } catch (error) {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
      return { success: false };
    }
  };

  const updateItem = async (table, recordId, data) => {
    console.log("updateItem", table, recordId, data);
    try {
      const { error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', recordId);
      
      if (error) {
        console.error('Update item error:', error);
        return false;
      }
      
      await refreshData();
      return true;
    } catch (error) {
      console.error('Update item error:', error);
      return false;
    }
  };

  const updateAttachment = (recordType, recordId, fileId, updatedData) => {
    const table = `${recordType}`;
    const currentRecord = dataState[table]?.find(r => r.id === recordId);
    if (!currentRecord) return;
    
    const newAttachments = (currentRecord.attachments || []).map(att => 
      att.id === fileId ? { ...att, ...updatedData } : att
    );
    
    updateItem(table, recordId, { attachments: newAttachments });
  };

  const deleteAttachment = (recordType, recordId, fileId) => {
    const table = `${recordType}`;
    const currentRecord = dataState[table]?.find(r => r.id === recordId);
    if (!currentRecord) return;
    
    const newAttachments = (currentRecord.attachments || []).filter(att => att.id !== fileId);
    updateItem(table, recordId, { attachments: newAttachments });
  };

  const addComment = (recordType, recordId, comment) => {
    const table = `${recordType}`;
    const currentRecord = dataState[table]?.find(r => r.id === recordId);
    if (!currentRecord) return;
    
    const newComments = [comment, ...(currentRecord.comments || [])];
    updateItem(table, recordId, { comments: newComments });
  };

  const performBackup = () => {
    toast({ 
      title: "🚧 Feature Not Implemented", 
      description: "Backup functionality isn't available yet—but you can request it! 🚀" 
    });
  };

  return { requestAppointment, updateItem, updateAttachment, deleteAttachment, addComment, performBackup };
};