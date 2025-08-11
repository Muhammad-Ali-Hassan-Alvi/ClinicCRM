import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, RefreshCw } from 'lucide-react';

const ConnectionSetupForm = ({ 
  formData, 
  setFormData, 
  settings, 
  availableUsers, 
  onStartConnection, 
  onClose, 
  isConnecting 
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <h4 className="font-medium text-blue-800 mb-1">Real WhatsApp Integration</h4>
        <p className="text-blue-700">This will connect your actual WhatsApp number using WhatsApp Web protocol. Make sure your phone has WhatsApp installed and internet connection.</p>
      </div>

      <div>
        <Label htmlFor="label">Display Name *</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
          placeholder="e.g., Main Reception, Dr. Smith"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>Branch</Label>
        <Select 
          value={formData.branchId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {settings.branches?.map(branch => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Assigned Users (Optional)</Label>
        <Select 
          value={formData.assignedUsers[0] || 'all'} 
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            assignedUsers: value === 'all' ? [] : [value] 
          }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All users can access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users can access</SelectItem>
            {availableUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} ({user.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={onStartConnection} 
          disabled={isConnecting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4 mr-2" />
              Start Connection
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConnectionSetupForm;

