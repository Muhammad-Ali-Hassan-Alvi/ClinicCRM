import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Database, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCrmTests } from '@/hooks/useCrmTests';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const CRMTestSuite = () => {
    const { toast } = useToast();
    const { testCRMLifecycle } = useCrmTests();
    const [testLog, setTestLog] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [overallStatus, setOverallStatus] = useState('idle');

    const logCallback = (status, message, details = null) => {
        setTestLog(prev => [...prev, { status, message, details, timestamp: new Date() }]);
    };

    const runFullTest = async () => {
        setIsRunning(true);
        setTestLog([]);
        setOverallStatus('running');

        try {
            await testCRMLifecycle(logCallback);
            setOverallStatus('passed');
            toast({
                title: "✅ System Test Passed",
                description: "The entire CRM lifecycle completed successfully.",
            });
        } catch (error) {
            setOverallStatus('failed');
            toast({
                title: "❌ System Test Failed",
                description: "An error occurred during the test. Check logs for details.",
                variant: "destructive",
            });
        } finally {
            setIsRunning(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'passed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Database className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'running': return 'text-blue-600';
            case 'passed': return 'text-green-600';
            case 'failed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="glass-effect rounded-2xl p-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold gradient-text mb-2">Full System Test</h1>
                            <p className="text-gray-600 text-lg">End-to-end test for the complete CRM lifecycle.</p>
                        </div>
                        <Button onClick={runFullTest} disabled={isRunning} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                            {isRunning ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Running Test...</>
                            ) : (
                                <><Play className="w-5 h-5 mr-2" />Run Full Test</>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                    Test Log
                </h2>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-3">
                    <AnimatePresence>
                        {testLog.map((log, index) => (
                            <motion.div
                                key={index}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value={`item-${index}`} className="bg-white/50 border rounded-lg px-4">
                                        <AccordionTrigger className="hover:no-underline py-3 text-left">
                                            <div className="flex items-center gap-4 w-full">
                                                {getStatusIcon(log.status)}
                                                <span className={`font-medium flex-1 text-left ${getStatusColor(log.status)}`}>{log.message}</span>
                                                <span className="text-xs text-gray-400">{log.timestamp.toLocaleTimeString()}</span>
                                            </div>
                                        </AccordionTrigger>
                                        {log.details && (
                                            <AccordionContent>
                                                <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-x-auto">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </AccordionContent>
                                        )}
                                    </AccordionItem>
                                </Accordion>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isRunning && testLog.length === 0 && <p className="text-center text-gray-500 py-8">Test starting...</p>}
                    {!isRunning && testLog.length === 0 && <p className="text-center text-gray-500 py-8">Click "Run Full Test" to begin.</p>}
                </div>
                
                {!isRunning && overallStatus !== 'idle' && (
                     <div className={`mt-6 p-4 rounded-lg border ${overallStatus === 'passed' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center gap-3">
                            {getStatusIcon(overallStatus)}
                            <h3 className="text-lg font-bold">
                                Test {overallStatus === 'passed' ? 'Completed Successfully' : 'Failed'}
                            </h3>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CRMTestSuite;