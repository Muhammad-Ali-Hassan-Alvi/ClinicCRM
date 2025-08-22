import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const CreateChatDialog = ({ open, onOpenChange, onCreateChat }) => {
  const { allUsers } = useChat();
  const { user } = useAuth();
  
  const [chatName, setChatName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const availableUsers = allUsers.filter(u => u.id !== user?.id);

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateChat({
        name: chatName.trim(),
        description: description.trim(),
        memberIds: selectedUsers
      });
      
      // Reset form
      setChatName('');
      setDescription('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Reset form when closing
      setChatName('');
      setDescription('');
      setSelectedUsers([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="chat-name">Chat Name *</Label>
            <Input
              id="chat-name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Enter chat name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter chat description (optional)"
              rows={3}
            />
          </div>
          
          <div>
            <Label>Add Members</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No other users available
                </p>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <Label 
                        htmlFor={`user-${user.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!chatName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Chat'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
