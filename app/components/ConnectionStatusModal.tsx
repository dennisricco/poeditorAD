'use client';

import { useEffect } from 'react';
import Button from './Button';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ConnectionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  message: string;
}

export default function ConnectionStatusModal({
  isOpen,
  onClose,
  success,
  message,
}: ConnectionStatusModalProps) {
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`
          relative w-full max-w-md
          ${success ? 'bg-poe-green' : 'bg-poe-pink'}
          border-4 border-poe-black rounded-3xl cartoon-shadow
          p-8
          animate-fadeIn
        `}
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
            {success ? (
              <CheckCircle className="w-12 h-12 text-poe-green" strokeWidth={3} />
            ) : (
              <XCircle className="w-12 h-12 text-poe-pink" strokeWidth={3} />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-center mb-4">
          {success ? 'Connection Successful!' : 'Connection Failed'}
        </h2>

        {/* Message */}
        <p className="text-lg font-bold text-center mb-6">
          {message}
        </p>

        {/* Connection Details (if success) */}
        {success && (
          <div className="bg-white border-4 border-poe-black rounded-2xl p-4 mb-6">
            <div className="space-y-2 text-sm font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-poe-green rounded-full"></div>
                <span>Database connection is active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-poe-green rounded-full"></div>
                <span>Ready to execute queries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-poe-green rounded-full"></div>
                <span>All features available</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant={success ? 'blue' : 'white'}
          size="lg"
          className="w-full"
          onClick={onClose}
        >
          {success ? 'Continue' : 'Try Again'}
        </Button>
      </div>
    </div>
  );
}
