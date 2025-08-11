import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Users, Settings, Wifi, WifiOff, Battery, Plug, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';
import WhatsAppConnectionDialog from '@/components/whatsapp/WhatsAppConnectionDialog';

const WhatsAppNumberManager = () => {
  const { settings, updateSettings, currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);

  const whatsappNumbers = settings.whatsappNumbers || [];
  const connectedNumbers = whatsappNumbers.filter(n => n.status === 'connected');
  const availableUsers = settings.users || [];

  const getAccessibleNumbers = () => {
    if (currentUser?.role === 'Admin') {
      return whatsappNumbers;
    }
    
    return whatsappNumbers.filter(number => {
      if (!number.assignedUsers || number.assignedUsers.length === 0) return true;
      return number.assignedUsers.includes(currentUser?.id);
    });
  };

  const accessibleNumbers = getAccessibleNumbers();

  const handleDisconnect = (numberId) => {
    const updatedNumbers = whatsappNumbers.map(n => 
      n.id === numberId ? { ...n, status: 'disconnected', lastSeen: new Date().toISOString() } : n
    );
    updateSettings({ whatsappNumbers: updatedNumbers });
    
    toast({
      title: "WhatsApp Disconnected",
      description: "The WhatsApp number has been disconnected.",
      variant: "destructive"
    });
  };

  const handleReconnect = (numberId) => {
    // In a real implementation, this would trigger the reconnection process
    toast({
      title: "🚧 Reconnection Feature",
      description: "Automatic reconnection isn't implemented yet—but you can request it! 🚀",
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
    return userIds.map(id => availableUsers.find(u => u.id === id)?.name || 'Unknown').join(', ');
  };

  const getBranchName = (branchId) => {
    return settings.branches?.find(b => b.id === branchId)?.name || 'All Branches';
  };

  const getStatusBadge = (number) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', text: 'Pending', icon: null },
      connecting: { color: 'bg-yellow-100 text-yellow-800', text: 'Connecting...', icon: QrCode },
      connected: { color: 'bg-green-100 text-green-800', text: 'Connected', icon: CheckCircle },
      disconnected: { color: 'bg-red-100 text-red-800', text: 'Disconnected', icon: AlertCircle },
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

  const getConnectionHealth = (number) => {
    if (number.status !== 'connected') return null;
    
    const lastSeen = new Date(number.lastSeen);
    const now = new Date();
    const minutesAgo = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (minutesAgo < 5) return { status: 'excellent', text: 'Excellent', color: 'text-green-600' };
    if (minutesAgo < 15) return { status: 'good', text: 'Good', color: 'text-blue-600' };
    if (minutesAgo < 60) return { status: 'fair', text: 'Fair', color: 'text-yellow-600' };
    return { status: 'poor', text: 'Poor', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">WhatsApp Numbers</h2>
          <p className="text-gray-600">Manage your connected WhatsApp numbers</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <Button 
            onClick={() => setIsConnectionDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Add WhatsApp Number
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Numbers</p>
                <p className="text-2xl font-bold">{whatsappNumbers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold">{connectedNumbers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Accessible</p>
                <p className="text-2xl font-bold">{accessibleNumbers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Wifi className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold">
                  {connectedNumbers.filter(n => {
                    const lastSeen = new Date(n.lastSeen);
                    const today = new Date();
                    return lastSeen.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Numbers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            WhatsApp Numbers ({accessibleNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accessibleNumbers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No WhatsApp Numbers</h3>
              <p className="mb-4">
                {currentUser?.role === 'Admin' 
                  ? "You haven't connected any WhatsApp numbers yet."
                  : 'No WhatsApp numbers have been assigned to you.'
                }
              </p>
              {currentUser?.role === 'Admin' && (
                <Button 
                  onClick={() => setIsConnectionDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Connect Your First Number
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {accessibleNumbers.map(number => {
                const health = getConnectionHealth(number);
                return (
                  <motion.div
                    key={number.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          number.status === 'connected' ? 'bg-green-100' : 
                          number.status === 'connecting' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <Smartphone className={`w-6 h-6 ${
                            number.status === 'connected' ? 'text-green-600' : 
                            number.status === 'connecting' ? 'text-yellow-600' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{number.label}</h3>
                            {getStatusBadge(number)}
                            {health && (
                              <Badge variant="outline" className={health.color}>
                                <Wifi className="w-3 h-3 mr-1" />
                                {health.text}
                              </Badge>
                            )}
                          </div>
                          
                          {number.phoneNumber && (
                            <p className="text-gray-600 mb-2">{number.phoneNumber}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Users className="w-3 h-3" />
                                <span>Users: {getUserNames(number.assignedUsers)}</span>
                              </div>
                              <div>Branch: {getBranchName(number.branchId)}</div>
                            </div>
                            
                            {number.status === 'connected' && (
                              <div>
                                {number.lastSeen && (
                                  <div className="flex items-center gap-1 mb-1">
                                    <Wifi className="w-3 h-3" />
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
                              </div>
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
                        
                        {number.status === 'disconnected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReconnect(number.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Wifi className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {currentUser?.role === 'Admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNumber(number.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <WhatsAppConnectionDialog 
        isOpen={isConnectionDialogOpen}
        onOpenChange={setIsConnectionDialogOpen}
      />
    </div>
  );
};

export default WhatsAppNumberManager;