import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, CheckCircle, AlertCircle, Plus, Trash2, Users, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';
// Simple QR Code display component
const QRCodeDisplay = ({ numberId }) => {
  const generatePattern = (id) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 200, 200);
    
    ctx.fillStyle = '#000000';
    const blockSize = 6;
    for (let i = 0; i < 33; i++) {
      for (let j = 0; j < 33; j++) {
        if ((i + j + parseInt(id)) % 3 === 0) {
          ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  return (
    <div className="flex justify-center">
      <img 
        src={generatePattern(numberId)} 
        alt="WhatsApp QR Code" 
        className="border-2 border-gray-200 rounded-lg"
        width={200}
        height={200}
      />
    </div>
  );
};

const WhatsAppConnectionManager = ({ isOpen, onOpenChange }) => {
  const { settings, updateSettings, currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  
  const [newNumber, setNewNumber] = useState({
    label: '',
    phoneNumber: '',
    assignedUsers: [],
    branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
  });
  const [showQRCode, setShowQRCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});

  const whatsappNumbers = settings.whatsappNumbers || [];
  const availableUsers = settings.users || [];

  useEffect(() => {
    whatsappNumbers.forEach(number => {
      if (number.status === 'connecting') {
        simulateConnection(number.id);
      }
    });
  }, [whatsappNumbers]);

  const simulateConnection = (numberId) => {
    setConnectionStatus(prev => ({ ...prev, [numberId]: 'connecting' }));
    
    setTimeout(() => {
      const updatedNumbers = whatsappNumbers.map(num => 
        num.id === numberId 
          ? { ...num, status: 'connected', connectedAt: new Date().toISOString() }
          : num
      );
      updateSettings({ whatsappNumbers: updatedNumbers });
      setConnectionStatus(prev => ({ ...prev, [numberId]: 'connected' }));
      setShowQRCode(null);
      toast({
        title: "WhatsApp Connected! ✅",
        description: `Successfully connected ${updatedNumbers.find(n => n.id === numberId)?.label}`,
      });
    }, 8000);
  };

  const handleAddNumber = () => {
    if (!newNumber.label || !newNumber.phoneNumber) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter both label and phone number.",
        variant: "destructive"
      });
      return;
    }

    const numberExists = whatsappNumbers.some(n => n.phoneNumber === newNumber.phoneNumber);
    if (numberExists) {
      toast({
        title: "Number Already Exists",
        description: "This phone number is already registered.",
        variant: "destructive"
      });
      return;
    }

    const newWhatsAppNumber = {
      id: Date.now().toString(),
      ...newNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    updateSettings({ 
      whatsappNumbers: [...whatsappNumbers, newWhatsAppNumber] 
    });

    setNewNumber({
      label: '',
      phoneNumber: '',
      assignedUsers: [],
      branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
    });

    toast({
      title: "WhatsApp Number Added",
      description: "Click 'Connect' to scan the QR code and activate.",
    });
  };

  const handleConnect = (numberId) => {
    const updatedNumbers = whatsappNumbers.map(num => 
      num.id === numberId ? { ...num, status: 'connecting' } : num
    );
    updateSettings({ whatsappNumbers: updatedNumbers });
    setShowQRCode(numberId);
    simulateConnection(numberId);
  };

  const handleDisconnect = (numberId) => {
    const updatedNumbers = whatsappNumbers.map(num => 
      num.id === numberId ? { ...num, status: 'disconnected' } : num
    );
    updateSettings({ whatsappNumbers: updatedNumbers });
    setConnectionStatus(prev => ({ ...prev, [numberId]: 'disconnected' }));
    toast({
      title: "WhatsApp Disconnected",
      description: "The WhatsApp number has been disconnected.",
      variant: "destructive"
    });
  };

  const handleDeleteNumber = (numberId) => {
    const updatedNumbers = whatsappNumbers.filter(num => num.id !== numberId);
    updateSettings({ whatsappNumbers: updatedNumbers });
    toast({
      title: "WhatsApp Number Removed",
      description: "The WhatsApp number has been deleted.",
      variant: "destructive"
    });
  };

  const handleUpdateAssignedUsers = (numberId, userIds) => {
    const updatedNumbers = whatsappNumbers.map(num => 
      num.id === numberId ? { ...num, assignedUsers: userIds } : num
    );
    updateSettings({ whatsappNumbers: updatedNumbers });
  };

  const getStatusBadge = (number) => {
    const status = connectionStatus[number.id] || number.status;
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', text: 'Pending' },
      connecting: { color: 'bg-yellow-100 text-yellow-800', text: 'Connecting...' },
      connected: { color: 'bg-green-100 text-green-800', text: 'Connected' },
      disconnected: { color: 'bg-red-100 text-red-800', text: 'Disconnected' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold gradient-text">WhatsApp Integration</h2>
              <p className="text-gray-600 mt-1">Connect and manage multiple WhatsApp numbers</p>
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>✕</Button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto space-y-6">
          {showQRCode && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  Scan QR Code to Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <QRCodeDisplay numberId={showQRCode} />
                <p className="text-sm text-gray-600 mt-4">
                  1. Open WhatsApp on your phone<br/>
                  2. Go to Settings → Linked Devices<br/>
                  3. Tap "Link a Device" and scan this QR code
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New WhatsApp Number
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Display Name *</Label>
                  <Input
                    id="label"
                    value={newNumber.label}
                    onChange={(e) => setNewNumber(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Main Reception, Dr. Smith"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={newNumber.phoneNumber}
                    onChange={(e) => setNewNumber(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+1234567890"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Branch</Label>
                  <Select 
                    value={newNumber.branchId} 
                    onValueChange={(value) => setNewNumber(prev => ({ ...prev, branchId: value }))}
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
                    value={newNumber.assignedUsers[0] || ''} 
                    onValueChange={(value) => setNewNumber(prev => ({ 
                      ...prev, 
                      assignedUsers: value ? [value] : [] 
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All users can access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All users can access</SelectItem>
                      {availableUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleAddNumber} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add WhatsApp Number
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Connected WhatsApp Numbers ({whatsappNumbers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {whatsappNumbers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No WhatsApp numbers added yet.</p>
                  <p className="text-sm">Add your first number above to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {whatsappNumbers.map(number => (
                    <div key={number.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{number.label}</h3>
                            {getStatusBadge(number)}
                          </div>
                          <p className="text-sm text-gray-600">{number.phoneNumber}</p>
                          {number.assignedUsers.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Assigned to: {number.assignedUsers.map(userId => 
                                  availableUsers.find(u => u.id === userId)?.name || 'Unknown'
                                ).join(', ')}
                              </span>
                            </div>
                          )}
                          {number.connectedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Connected: {new Date(number.connectedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {number.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleConnect(number.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Connect
                            </Button>
                          )}
                          
                          {number.status === 'connected' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDisconnect(number.id)}
                            >
                              Disconnect
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteNumber(number.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default WhatsAppConnectionManager;