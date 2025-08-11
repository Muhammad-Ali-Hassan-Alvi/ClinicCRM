// src/components/MessageMedia.jsx

import React from 'react';
import { File } from 'lucide-react';

export default function MessageMedia({ media }) {
  // If there's no media object, render nothing
  if (!media || !media.data) {
    return null;
  }

  // Construct the data URL from the base64 string
  const dataUrl = `data:${media.mimetype};base64,${media.data}`;

  // Case 1: Render an image
  if (media.mimetype.startsWith('image/')) {
    return (
      <img
        src={dataUrl}
        alt={media.filename || 'Image'}
        className="rounded-lg mb-1 max-w-xs lg:max-w-sm"
      />
    );
  }

  // Case 2: Render a video
  if (media.mimetype.startsWith('video/')) {
    return (
      <video
        controls
        src={dataUrl}
        className="rounded-lg mb-1 max-w-xs lg:max-w-sm"
      />
    );
  }

  // Case 3: Render an audio file
  if (media.mimetype.startsWith('audio/')) {
    return (
      <audio
        controls
        src={dataUrl}
        className="w-full my-2"
      />
    );
  }

  // Fallback: Render a generic download link for documents (PDF, etc.)
  return (
    <div className="bg-gray-200 p-3 rounded-lg flex items-center gap-3 mb-2">
      <File className="w-8 h-8 text-gray-600" />
      <div className="flex-1">
        <p className="text-sm font-medium truncate">{media.filename || 'File'}</p>
        <a
          href={dataUrl}
          download={media.filename || 'download'}
          className="text-xs text-blue-600 hover:underline"
        >
          Download
        </a>
      </div>
    </div>
  );
}