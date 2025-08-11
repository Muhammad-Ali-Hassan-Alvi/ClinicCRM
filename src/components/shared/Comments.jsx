import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';

const Comments = ({ comments = [], onAddComment }) => {
  const { currentUser } = useData();
  const { t } = useLocale();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: currentUser?.name || 'Unknown User',
        createdAt: new Date().toISOString(),
      };
      onAddComment(comment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">{t('record.comments')}</h3>
      </div>

      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('Add a comment...')}
          rows={3}
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
          <Send className="w-4 h-4 mr-2" />
          {t('Add Comment')}
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>{t('No Comments')}</p>
        </div>
      )}
    </div>
  );
};

export default Comments;