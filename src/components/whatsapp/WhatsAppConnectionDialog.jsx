import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';
import WhatsAppWebClient from '@/lib/whatsappClient';
import QRCode from 'qrcode';
import ConnectionSetupForm from './ConnectionSetupForm';
import QRCodeStep from './QRCodeStep';
import ConnectionSuccessStep from './ConnectionSuccessStep';
import socket from '../../lib/whatsappSocket';

const WhatsAppConnectionDialog = ({ isOpen, onOpenChange }) => {
  const { settings, updateSettings, currentUser } = useData();
  const { toast } = useToast();
  const { t } = useLocale();

  const [step, setStep] = useState('setup');
  const [formData, setFormData] = useState({
    label: '',
    assignedUsers: [],
    branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [phoneInfo, setPhoneInfo] = useState(null);
  const [whatsappClient, setWhatsappClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentNumberId, setCurrentNumberId] = useState(null);

  const whatsappNumbers = settings.whatsappNumbers || [];
  const availableUsers = settings.users || [];

  useEffect(() => {
    if (isOpen && step === 'setup') {
      setFormData({
        label: '',
        assignedUsers: [],
        branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
      });
      setQrCodeUrl('');
      setConnectionStatus('');
      setPhoneInfo(null);
      setCurrentNumberId(null);
    }
  }, [isOpen, step, currentUser, settings.branches]);

  useEffect(() => {
    return () => {
      if (whatsappClient) {
        whatsappClient.destroy();
      }
    };
  }, [whatsappClient]);



  // socket listeners
  useEffect(() => {
    const onQr = (qr) => {
      setQrCodeUrl(qr);
      setConnectionStatus('qr');
      setStep('connecting');
    };
    const onAuthenticated = (msg) => {
      setConnectionStatus('authenticated');
      setPhoneInfo(prev => prev || {}); // backend may send more; we keep placeholder
      toast({ title: 'Authenticated', description: msg || 'WhatsApp authenticated' });
    };
    const onReady = () => {
      setConnectionStatus('ready');
      toast({ title: 'Ready', description: 'WhatsApp is ready' });
      // backend will emit chats; mark connected number in settings if we created one
      // if we created a numberId earlier, update settings to mark connected
      if (currentNumberId) {
        const newNumber = {
          id: currentNumberId,
          label: formData.label,
          phoneNumber: phoneInfo?.phoneNumber || '',
          status: 'connected',
          assignedUsers: formData.assignedUsers,
          branchId: formData.branchId,
          connectedAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          clientId: currentNumberId
        };
        updateSettings({ whatsappNumbers: [...(settings.whatsappNumbers || []), newNumber] });
        setStep('connected');
        setIsConnecting(false);
      }
    };
    const onError = (msg) => {
      toast({ title: 'WhatsApp Error', description: msg || 'Something went wrong', variant: 'destructive' });
      setIsConnecting(false);
      setStep('setup');
    };

    socket.on('qr', onQr);
    socket.on('authenticated', onAuthenticated);
    socket.on('ready', onReady);
    socket.on('error-message', onError);

    return () => {
      socket.off('qr', onQr);
      socket.off('authenticated', onAuthenticated);
      socket.off('ready', onReady);
      socket.off('error-message', onError);
    };
  }, [currentNumberId, formData, phoneInfo, settings.whatsappNumbers, updateSettings, toast]);

  const generateQRCodeDataURL = async (data) => {
    try {
      // Create a more realistic WhatsApp Web QR code format
      const qrData = `2@${data}@${Date.now()}@${Math.random().toString(36).substring(2, 15)}`;

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw error;
    }
  };

  const handleStartConnection = async () => {
    if (!formData.label.trim()) {
      toast({ title: 'Label required', description: 'Please add a label', variant: 'destructive' });
      return;
    }
    // create number id locally and tell backend to init connection
    setIsConnecting(true);
    const numberId = Date.now().toString();
    setCurrentNumberId(numberId);
    // send initialization request to backend — backend should start client and emit 'qr'
    socket.emit('init-connection', { numberId, metadata: { label: formData.label, branchId: formData.branchId, assignedUsers: formData.assignedUsers } });
    setStep('connecting');
  };
  // const handleStartConnection = async () => {
  //   if (!formData.label.trim()) {
  //     toast({
  //       title: "Label Required",
  //       description: "Please enter a label for this WhatsApp number.",
  //       variant: "destructive"
  //     });
  //     return;
  //   }

  //   setIsConnecting(true);
  //   const numberId = Date.now().toString();
  //   setCurrentNumberId(numberId);

  //   const client = new WhatsAppWebClient();
  //   setWhatsappClient(client);

  //   client.on('status', (status) => {
  //     setConnectionStatus(status);
  //   });

  //   client.on('qr', async (qrData) => {
  //     try {
  //       const qrCodeDataUrl = await generateQRCodeDataURL(qrData);
  //       setQrCodeUrl(qrCodeDataUrl);
  //     } catch (error) {
  //       console.error('QR Code generation error:', error);
  //       toast({
  //         title: "QR Code Error",
  //         description: "Failed to generate QR code. Please try again.",
  //         variant: "destructive"
  //       });
  //     }
  //   });

  //   client.on('authenticated', (authData) => {
  //     setPhoneInfo({
  //       phoneNumber: authData.phoneNumber,
  //       sessionData: authData.sessionData
  //     });
  //     setConnectionStatus('authenticated');
  //   });

  //   client.on('ready', () => {
  //     setConnectionStatus('ready');

  //     const newNumber = {
  //       id: numberId,
  //       label: formData.label,
  //       phoneNumber: phoneInfo?.phoneNumber || '',
  //       status: 'connected',
  //       assignedUsers: formData.assignedUsers,
  //       branchId: formData.branchId,
  //       connectedAt: new Date().toISOString(),
  //       lastSeen: new Date().toISOString(),
  //       clientId: client.sessionId,
  //       sessionData: phoneInfo?.sessionData
  //     };

  //     const updatedNumbers = [...whatsappNumbers, newNumber];
  //     updateSettings({ whatsappNumbers: updatedNumbers });

  //     setStep('connected');
  //     setIsConnecting(false);

  //     toast({
  //       title: "WhatsApp Connected Successfully! 🎉",
  //       description: `${formData.label} is now connected and ready to use.`
  //     });
  //   });

  //   client.on('heartbeat', (data) => {
  //     if (currentNumberId) {
  //       const updatedNumbers = whatsappNumbers.map(num =>
  //         num.id === currentNumberId
  //           ? {
  //             ...num,
  //             lastSeen: new Date().toISOString(),
  //             batteryLevel: data.battery,
  //             isPlugged: data.plugged
  //           }
  //           : num
  //       );
  //       updateSettings({ whatsappNumbers: updatedNumbers });
  //     }
  //   });

  //   client.on('message', (message) => {
  //     console.log('Incoming WhatsApp message:', message);
  //   });

  //   client.on('disconnected', () => {
  //     setConnectionStatus('disconnected');
  //     if (currentNumberId) {
  //       const updatedNumbers = whatsappNumbers.map(num =>
  //         num.id === currentNumberId ? { ...num, status: 'disconnected' } : num
  //       );
  //       updateSettings({ whatsappNumbers: updatedNumbers });
  //     }
  //     setIsConnecting(false);
  //   });

  //   client.on('error', (error) => {
  //     console.error('WhatsApp client error:', error);
  //     toast({
  //       title: "Connection Error",
  //       description: error.message || "Failed to connect to WhatsApp. Please try again.",
  //       variant: "destructive"
  //     });
  //     setStep('setup');
  //     setIsConnecting(false);
  //   });

  //   const initialized = await client.initialize(numberId);
  //   if (initialized) {
  //     setStep('connecting');
  //   } else {
  //     setIsConnecting(false);
  //   }
  // };

   const handleRetryQR = () => {
    if (!currentNumberId) return;
    setQrCodeUrl('');
    socket.emit('retry-qr', { numberId: currentNumberId });
  };

   const handleClose = () => {
    // ask backend to cleanup if needed
    if (currentNumberId) socket.emit('cancel-connection', { numberId: currentNumberId });
    setStep('setup');
    setQrCodeUrl('');
    setConnectionStatus('');
    setPhoneInfo(null);
    setIsConnecting(false);
    setCurrentNumberId(null);
    onOpenChange(false);
  };

  // const handleClose = () => {
  //   if (whatsappClient) {
  //     whatsappClient.destroy();
  //     setWhatsappClient(null);
  //   }
  //   setStep('setup');
  //   setQrCodeUrl('');
  //   setConnectionStatus('');
  //   setPhoneInfo(null);
  //   setIsConnecting(false);
  //   setCurrentNumberId(null);
  //   onOpenChange(false);
  // };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            Connect Real WhatsApp Number
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ConnectionSetupForm
                formData={formData}
                setFormData={setFormData}
                settings={settings}
                availableUsers={availableUsers}
                onStartConnection={handleStartConnection}
                onClose={handleClose}
                isConnecting={isConnecting}
              />
            </motion.div>
          )}

          {step === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <QRCodeStep
                formData={formData}
                connectionStatus={connectionStatus}
                qrCodeUrl={qrCodeUrl}
                phoneInfo={phoneInfo}
                onClose={handleClose}
                onRetry={handleRetryQR}
              />
            </motion.div>
          )}

          {step === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ConnectionSuccessStep
                formData={formData}
                phoneInfo={phoneInfo}
                onClose={handleClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppConnectionDialog;