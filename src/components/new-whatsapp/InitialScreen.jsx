import React from 'react';
import { Smartphone } from 'lucide-react';

function InitialScreen({ status = 'initializing', onConnect }) {
    return (
        <>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mx-auto w-28 h-28 flex items-center justify-center rounded-full bg-green-50 mb-4">
                    <Smartphone className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Connect your WhatsApp</h2>
                <p className="text-gray-600 mb-6">
                    Manage WhatsApp messages from your Clinic CRM dashboard.
                </p>

                <div className="space-y-3">
                    <div className="text-sm text-gray-500">Status: <span className="font-medium text-gray-700">{status}</span></div>

                    <button
                        onClick={onConnect}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <span>Connect WhatsApp</span>
                    </button>
                </div>
            </div>
        </>

    );
}

export default InitialScreen;
