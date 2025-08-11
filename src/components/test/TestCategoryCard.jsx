import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import TestResultDetails from './TestResultDetails';

const TestCategoryCard = ({ category, result }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
            case 'running': return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
            default: return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            passed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            running: 'bg-blue-100 text-blue-800'
        };
        return variants[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Card className="glass-effect border-white/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <category.icon className="w-6 h-6 text-blue-600" />
                        <CardTitle>{category.name}</CardTitle>
                    </div>
                    {result && getStatusIcon(result.status)}
                </div>
                <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {result ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusBadge(result.status)}>
                                {result.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">
                                {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700">{result.message}</p>
                        <TestResultDetails details={result.details} />
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Test not run yet</p>
                )}
            </CardContent>
        </Card>
    );
};

export default TestCategoryCard;