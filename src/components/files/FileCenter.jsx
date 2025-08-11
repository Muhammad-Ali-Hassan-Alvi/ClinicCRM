import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DatabaseZap, Search, Upload, Calendar, FolderArchive, Brain, Settings } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import FileList from '@/components/files/FileList';
import UploadFileDialog from '@/components/files/UploadFileDialog';
import EditFileDialog from '@/components/files/EditFileDialog';
import { useLocale } from '@/contexts/LocaleContext';

const FileCenter = () => {
  const { settings, updateSettings, currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const knowledgeBase = useMemo(() => settings.aiKnowledgeBase || [], [settings.aiKnowledgeBase]);
  const fileCategories = useMemo(() => settings.fileCategories || ['Price List', 'Procedures', 'Promotions', 'FAQs', 'General Documents'], [settings.fileCategories]);

  const filteredFiles = useMemo(() => {
    return knowledgeBase.filter(file => {
      const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
      
      const fileDate = new Date(file.created_at);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      const matchesDate = (!fromDate || fileDate >= fromDate) && (!toDate || fileDate <= toDate);
        
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [knowledgeBase, searchTerm, categoryFilter, dateFromFilter, dateToFilter]);

  const handleUpload = (fileData) => {
    const newFile = {
      ...fileData,
      id: `${Date.now()}-${fileData.name}`,
      createdAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
    };
    const updatedKB = [newFile, ...knowledgeBase];
    updateSettings({ aiKnowledgeBase: updatedKB });
    toast({ 
      title: "File Uploaded Successfully", 
      description: `${newFile.name} has been uploaded and is now available for AI assistance.` 
    });
    setUploadOpen(false);
  };

  const handleEdit = (file) => {
    setSelectedFile(file);
    setEditOpen(true);
  };
  
  const handleSaveEdit = (updatedData) => {
    const updatedKB = knowledgeBase.map(file => 
      file.id === selectedFile.id ? { ...file, ...updatedData, updatedAt: new Date().toISOString() } : file
    );
    updateSettings({ aiKnowledgeBase: updatedKB });
    toast({ title: "File Updated Successfully" });
    setEditOpen(false);
    setSelectedFile(null);
  };

  const handleDelete = (fileId) => {
    const fileToDelete = knowledgeBase.find(f => f.id === fileId);
    if(fileToDelete.url.startsWith('blob:')){
        URL.revokeObjectURL(fileToDelete.url);
    }
    const updatedKB = knowledgeBase.filter(file => file.id !== fileId);
    updateSettings({ aiKnowledgeBase: updatedKB });
    toast({ title: "File Deleted", variant: 'destructive' });
  };
  
  const handleToggleAI = (fileId, aiEnabled) => {
    const updatedKB = knowledgeBase.map(file => 
      file.id === fileId ? { ...file, aiEnabled, updatedAt: new Date().toISOString() } : file
    );
    updateSettings({ aiKnowledgeBase: updatedKB });
    toast({ 
      title: "AI Status Updated", 
      description: `File ${aiEnabled ? 'enabled' : 'disabled'} for AI assistance.` 
    });
  };

  const aiEnabledFiles = knowledgeBase.filter(f => f.aiEnabled).length;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="glass-effect rounded-2xl p-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center">
  
                  File Center & AI Support
                </h1>
                <p className="text-gray-600 text-lg">Manage your documents and enable AI-powered assistance</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">{aiEnabledFiles} files enabled for AI</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <DatabaseZap className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">{knowledgeBase.length} total files</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => toast({ 
                    title: "🚧 AI Settings", 
                    description: "AI configuration panel coming soon! You can request it in your next prompt! 🚀" 
                  })}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  AI Settings
                </Button>
                <Button onClick={() => setUploadOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="glass-effect rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {fileCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />
              <Input type="date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
            </div>
          </div>
        </motion.div>

        <FileList files={filteredFiles} onEdit={handleEdit} onDelete={handleDelete} onToggleAI={handleToggleAI} />
        
        {filteredFiles.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <FolderArchive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Files Found</h3>
            <p className="text-gray-500">
              {knowledgeBase.length === 0 ? 'Upload your first file to enable AI-powered assistance.' : 'No files match your current filters.'}
            </p>
          </motion.div>
        )}
      </div>
      
      <UploadFileDialog isOpen={isUploadOpen} onOpenChange={setUploadOpen} onUpload={handleUpload} categories={fileCategories} />
      <EditFileDialog isOpen={isEditOpen} onOpenChange={setEditOpen} file={selectedFile} onSave={handleSaveEdit} categories={fileCategories} />
    </>
  );
};

export default FileCenter;