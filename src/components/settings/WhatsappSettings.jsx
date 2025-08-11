import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Smartphone, QrCode, Users, Trash2, Edit2, CheckCircle, XCircle, Battery, Plug, Wifi, WifiOff } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import SettingsCard from '@/components/settings/SettingsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';
import WhatsAppConnectionDialog from '@/components/whatsapp/WhatsAppConnectionDialog';

const WhatsappSettings = () => {
  const { settings, updateSettings, users } = useData();
  const { t } = useLocale();
  const { toast } = useToast();
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);

  const whatsappNumbers = settings.whatsappNumbers || [];

  const handleAddNumber = () => {
    setIsConnectionDialogOpen(true);
  };

  const handleDisconnect = (numberId) => {
    const updatedNumbers = whatsappNumbers.map(n => 
      n.id === numberId ? { ...n, status: 'disconnected' } : n
    );
    updateSettings({ whatsappNumbers: updatedNumbers });
    
    toast({
      title: "WhatsApp Disconnected",
      description: "The WhatsApp number has been disconnected.",
      variant: "destructive"
    });
  };

  const handleRemoveNumber = (numberId) => {
    const updatedNumbers = whatsappNumbers.filter(n => n.id !== numberId);
    updateSettings({ whatsappNumbers: updatedNumbers });
    
    toast({
      title: "WhatsApp Number Removed",
      description: "The WhatsApp number has been permanently removed.",
      variant: "destructive"
    });
  };

  const getUserNames = (userIds) => {
    if (!userIds || userIds.length === 0) return 'All Users';
    return userIds.map(id => users.find(u => u.id === id)?.name || 'Unknown').join(', ');
  };

  const getBranchName = (branchId) => {
    return settings.branches.find(b => b.id === branchId)?.name || 'All Branches';
  };

  const getStatusBadge = (number) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', text: 'Pending', icon: null },
      connecting: { color: 'bg-yellow-100 text-yellow-800', text: 'Connecting...', icon: QrCode },
      connected: { color: 'bg-green-100 text-green-800', text: 'Connected', icon: CheckCircle },
      disconnected: { color: 'bg-red-100 text-red-800', text: 'Disconnected', icon: XCircle },
    };
    
    const config = statusConfig[number.status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
        {config.text}
      </Badge>
    );
  };

  return (
    <SettingsCard
      title="WhatsApp Integration"
      description="Connect multiple WhatsApp numbers with QR code authentication and manage user access."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Connected Numbers</h3>
          <Button onClick={handleAddNumber} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add WhatsApp Number
          </Button>
        </div>

        <div className="space-y-4">
          {whatsappNumbers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No WhatsApp numbers connected yet.</p>
              <p className="text-sm">Add your first number to get started.</p>
            </div>
          ) : (
            whatsappNumbers.map(number => (
              <motion.div
                key={number.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      number.status === 'connected' ? 'bg-green-100' : 
                      number.status === 'connecting' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Smartphone className={`w-5 h-5 ${
                        number.status === 'connected' ? 'text-green-600' : 
                        number.status === 'connecting' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{number.label}</h4>
                        {getStatusBadge(number)}
                      </div>
                      
                      {number.phoneNumber && (
                        <p className="text-sm text-gray-600 mb-2">{number.phoneNumber}</p>
                      )}
                      
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Users: {getUserNames(number.assignedUsers)}</span>
                        </div>
                        <div>Branch: {getBranchName(number.branchId)}</div>
                        
                        {number.status === 'connected' && (
                          <>
                            {number.lastSeen && (
                              <div className="flex items-center gap-1">
                                <Wifi className="w-3 h-3 text-green-500" />
                                <span>Last seen: {new Date(number.lastSeen).toLocaleString()}</span>
                              </div>
                            )}
                            {number.batteryLevel && (
                              <div className="flex items-center gap-1">
                                <Battery className="w-3 h-3" />
                                <span>Battery: {number.batteryLevel}%</span>
                                {number.isPlugged && <Plug className="w-3 h-3 text-green-500" />}
                              </div>
                            )}
                            {number.connectedAt && (
                              <div>Connected: {new Date(number.connectedAt).toLocaleString()}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {number.status === 'connected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(number.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <WifiOff className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNumber(number.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <WhatsAppConnectionDialog 
          isOpen={isConnectionDialogOpen}
          onOpenChange={setIsConnectionDialogOpen}
        />
      </div>
    </SettingsCard>
  );
};

export default WhatsappSettings;