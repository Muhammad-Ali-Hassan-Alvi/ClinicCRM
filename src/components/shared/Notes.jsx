import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const Notes = ({ notes = [], onAdd, onUpdate, onDelete }) => {
  const { t } = useLocale();
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddNote = () => {
    if (newNote.trim() && onAdd) {
      onAdd(newNote.trim());
      setNewNote('');
    }
  };

  const handleEditStart = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const handleEditSave = () => {
    if (editText.trim() && onUpdate) {
      onUpdate(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteNote = (noteId) => {
    if (onDelete) {
      onDelete(noteId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold">{t('record.notes')}</h3>
      </div>

      {onAdd && (
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={t('Write a Note') || 'Add a note...'}
            rows={3}
          />
          <Button onClick={handleAddNote} disabled={!newNote.trim()} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('Add Note') || 'Add Note'}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleEditSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      {t('Save')}
                    </Button>
                    <Button onClick={handleEditCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      {t('actions.cancel') || 'Cancel'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 mb-2">{note.text}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                    <div className="flex gap-1">
                      {onUpdate && (
                        <Button
                          onClick={() => handleEditStart(note)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          onClick={() => handleDeleteNote(note.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <StickyNote className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>{t('No Notes') || 'No notes yet'}</p>
        </div>
      )}
    </div>
  );
};

export default Notes;