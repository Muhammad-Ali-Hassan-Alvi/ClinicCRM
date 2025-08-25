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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageSquare, Loader2 } from 'lucide-react';

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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Create New Chat
          </DialogTitle>
          <DialogDescription>
            Create a new conversation and invite team members to join. You can add members later as well.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="chat-name" className="text-sm font-medium text-gray-700">
                Chat Name *
              </Label>
              <Input
                id="chat-name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter a name for your chat"
                className="mt-1 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this chat about? (optional)"
                rows={3}
                className="mt-1 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Add Members ({selectedUsers.length} selected)
              </Label>
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                <ScrollArea className="h-40">
                  {availableUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No other users available</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {availableUsers.map(user => (
                        <div 
                          key={user.id} 
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserToggle(user.id)}
                          />
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {getInitials(user.name)}
                          </div>
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
            </div>
          </div>
          
          <DialogFooter>
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
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Chat'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
