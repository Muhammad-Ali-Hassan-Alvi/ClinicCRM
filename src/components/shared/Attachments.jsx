import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, Download, Trash2, FileText, FileImage, FileSpreadsheet, FileArchive } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return <FileImage className="w-6 h-6 text-blue-500" />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
  if (fileType.includes('pdf')) return <FileArchive className="w-6 h-6 text-red-500" />;
  return <FileText className="w-6 h-6 text-gray-500" />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Attachments = ({ attachments = [], onUpload, onDelete }) => {
  const { t } = useLocale();
  const [selectedFiles, setSelectedFiles] = useState([]);

  // File selection handler
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, []);


  // Cleanup image previews
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    };
  }, [selectedFiles]);

  const handleManualUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles.map(f => f.file));
      setSelectedFiles([]); // clear after upload
    }
  };

  const removeSelectedFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFileOpenAndDownload = (file, e) => {
    // Prevent default behavior (in case used in anchor or form)
    if (e) e.preventDefault();

    // ✅ Open in new tab
    window.open(file.url, "_blank");

    // ✅ Also trigger download
    const link = document.createElement("a");
    link.setAttribute("href", file.url);
    link.setAttribute("download", file.name);
    link.style.display = "none"; // ensure it doesn't affect layout
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'text/plain': ['.txt'],
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">{t('record.attachments')}</h3>
      </div>

      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">
          {isDragActive ? t('Drop Files') : t('Drag and Drop Files Here')}
        </p>
        <p className="text-xs text-gray-400 mt-1">{t('Supported Files')}</p>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {attachments.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">

                <a href={file.url} target="_blank" download={file.name}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>

                <Button
                  onClick={() => onDelete(file.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {attachments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Paperclip className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>{t('No Attachments')}</p>
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-700">Selected Files</h4>
            <Button onClick={handleManualUpload} size="sm">
              Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
            </Button>
          </div>

          {selectedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              {file.preview ? (
                <img src={file.preview} alt={file.name} className="w-12 h-12 rounded object-cover" />
              ) : (
                getFileIcon(file.type)
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <Button
                onClick={() => removeSelectedFile(file.id)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attachments;