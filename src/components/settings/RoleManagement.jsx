import React from 'react';
import { useData } from '@/contexts/DataContext';
import SettingsCard from '@/components/settings/SettingsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, UserPlus } from 'lucide-react';

const RoleManagement = () => {
    const { settings } = useData();
    const { toast } = useToast();

    const handleNotImplemented = () => {
        toast({
            title: "🚧 Feature in development!",
            description: "Full role and permission management is coming soon.",
        });
    };

    return (
        <SettingsCard
            title="Role Management"
            description="Define user roles and their access permissions across the CRM."
        >
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button onClick={handleNotImplemented}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add New Role
                    </Button>
                </div>
                <div className="space-y-4">
                    {settings.roles.map(role => (
                        <div key={role.id} className="p-4 border rounded-lg bg-white/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <ShieldCheck className="text-purple-600 h-5 w-5" />
                                        {role.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleNotImplemented}>Edit</Button>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-medium text-sm mb-2">Permissions:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map(permission => (
                                        <Badge key={permission} variant="secondary" className="font-normal">
                                            {permission === 'all' ? 'All Permissions' : permission.replace(/-/g, ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SettingsCard>
    );
};

export default RoleManagement;