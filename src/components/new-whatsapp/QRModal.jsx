// src/components/QRModal.jsx
import React from 'react';
import { Loader2, X } from 'lucide-react';

export default function QRModal({ open, qr, loading, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative p-6">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-4">Scan with WhatsApp</h3>

        <div className="flex flex-col items-center">
          {loading ? (
            <>
              <Loader2 className="animate-spin w-12 h-12 text-green-600" />
              <p className="mt-3 text-gray-600">Generating QR code…</p>
            </>
          ) : qr ? (
            <>
              <img src={qr} alt="WhatsApp QR" className="w-56 h-56 object-contain rounded-md shadow-sm" />
              <p className="text-sm text-gray-500 mt-3 text-center">Open WhatsApp → Settings → Linked devices → Scan QR</p>
            </>
          ) : (
            <p className="text-gray-500">Waiting for QR code from server…</p>
          )}
        </div>
      </div>
    </div>
  );
}
