import React from 'react';
import { motion } from 'framer-motion';
import { StickyNote } from 'lucide-react';

const InternalNote = ({ note }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-center my-2"
    >
      <div className="w-full max-w-md bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <StickyNote className="w-5 h-5 mt-1 text-yellow-600" />
          <div>
            <p className="font-semibold text-sm">Internal Note</p>
            <p className="text-sm">{note.text}</p>
            <p className="text-xs text-yellow-600 mt-1 text-right">
              {new Date(note.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InternalNote;