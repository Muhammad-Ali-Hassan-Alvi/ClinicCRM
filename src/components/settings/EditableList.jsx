import React, { useState } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SettingsCard from '@/components/settings/SettingsCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData } from '@/contexts/DataContext';

const EditableList = ({ title, description, listKey }) => {
  const { settings, updateSettings } = useData();
  const items = settings[listKey] || [];
  const [newItem, setNewItem] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim() && !items.includes(newItem.trim())) {
      updateSettings({ [listKey]: [...items, newItem.trim()] });
      setNewItem('');
    }
  };

  const handleDeleteItem = () => {
    if (itemToDelete !== null) {
      updateSettings({ [listKey]: items.filter(item => item !== itemToDelete) });
      setItemToDelete(null);
    }
  };

  return (
    <SettingsCard title={title} description={description}>
      <div className="space-y-3">
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <span className="text-sm text-gray-800">{item}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500" onClick={() => setItemToDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the "{itemToDelete}" item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddItem} className="flex gap-2">
          <Input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add new item..."
          />
          <Button type="submit" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </SettingsCard>
  );
};

export default EditableList;