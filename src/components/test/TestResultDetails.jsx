import React from 'react';

const TestResultDetails = ({ details }) => {
    if (!details) {
        return null;
    }

    return (
        <details className="text-xs text-gray-600">
            <summary className="cursor-pointer font-medium">View Details</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                {JSON.stringify(details, null, 2)}
            </pre>
        </details>
    );
};

export default TestResultDetails;