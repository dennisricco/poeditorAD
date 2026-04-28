'use client';

import { useEffect } from 'react';
import Button from './Button';
import { AlertCircle, X, LogOut } from 'lucide-react';

import { DatabaseConnectionConfig } from '../types/database-connection';

interface DisconnectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  connectionInfo?: DatabaseConnectionConfig | null;
}

export default function DisconnectConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  connectionInfo,
}: DisconnectConfirmModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-poe-yellow border-4 border-poe-black rounded-3xl cartoon-shadow p-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white border-4 border-poe-black rounded-xl flex items-center justify-center transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white border-4 border-poe-black rounded-3xl flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-poe-yellow" strokeWidth={3} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-center mb-4">
          Disconnect from Database?
        </h2>

        {/* Message */}
        <p className="text-lg font-bold text-center mb-6">
          Are you sure you want to disconnect from the database?
        </p>

        {/* Connection Info */}
        {connectionInfo && (
          <div className="bg-white border-4 border-poe-black rounded-2xl p-4 mb-6">
            <h3 className="text-sm font-black uppercase tracking-wide mb-3">Current Connection:</h3>
            <div className="space-y-2 text-sm font-bold">
              {/* Show different info based on database type */}
              {connectionInfo.type === 'oracle' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host:</span>
                    <span className="font-black">{connectionInfo.host}:{connectionInfo.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-black">{connectionInfo.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-black">{connectionInfo.username}</span>
                  </div>
                </>
              )}
              {(connectionInfo.type === 'mysql' || connectionInfo.type === 'postgresql' || connectionInfo.type === 'sqlserver') && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host:</span>
                    <span className="font-black">{connectionInfo.host}:{connectionInfo.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <span className="font-black">{connectionInfo.database}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-black">{connectionInfo.username}</span>
                  </div>
                </>
              )}
              {connectionInfo.type === 'sqlite' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">File:</span>
                  <span className="font-black truncate ml-2">{connectionInfo.filePath}</span>
                </div>
              )}
              {connectionInfo.type === 'mongodb' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host:</span>
                    <span className="font-black">{connectionInfo.host}:{connectionInfo.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <span className="font-black">{connectionInfo.database}</span>
                  </div>
                  {connectionInfo.username && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">User:</span>
                      <span className="font-black">{connectionInfo.username}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-poe-pink bg-opacity-20 border-4 border-poe-black rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={3} />
            <div className="text-sm font-bold">
              <p className="font-black mb-1">Note:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Any unsaved queries will be lost</li>
                <li>Query results will be cleared</li>
                <li>You'll need to reconnect to execute queries</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="white"
            size="lg"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="pink"
            size="lg"
            className="flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <LogOut className="w-5 h-5" strokeWidth={3} />
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
