'use client';

import { X, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border-4 border-poe-black rounded-3xl cartoon-shadow overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 bg-poe-yellow border-b-4 border-poe-black p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white border-4 border-poe-black rounded-xl cartoon-shadow-sm flex items-center justify-center -rotate-3">
              <FileText className="w-6 h-6" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black italic">Terms & Conditions</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white border-4 border-poe-black rounded-xl cartoon-shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors btn-press"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6 font-bold text-gray-800">
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-blue">1. 🎨 Welcome to POEditor Translation Manager!</h3>
              <p className="leading-relaxed">
                By using our fun and colorful translation platform, you agree to these terms. 
                We're here to make localization exciting and easy for everyone!
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-pink">2. 🔐 Your Account</h3>
              <p className="leading-relaxed mb-2">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Keeping your password secure and confidential</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Providing accurate and up-to-date information</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-green">3. 🌍 Translation Services</h3>
              <p className="leading-relaxed mb-2">
                Our platform allows you to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Connect with POEditor API for translation management</li>
                <li>Export translations in multiple formats (JSON, CSV, etc.)</li>
                <li>Manage multiple language projects</li>
                <li>Clean and format translation strings</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-blue">4. 📊 Data & Privacy</h3>
              <p className="leading-relaxed">
                We respect your privacy! Your translation data is stored securely. 
                We use Supabase for authentication and data storage. We will never 
                share your data with third parties without your explicit consent.
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-pink">5. 🚫 Prohibited Activities</h3>
              <p className="leading-relaxed mb-2">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the service for any illegal purposes</li>
                <li>Attempt to hack or compromise our systems</li>
                <li>Upload malicious content or spam</li>
                <li>Violate any intellectual property rights</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-green">6. 💡 Intellectual Property</h3>
              <p className="leading-relaxed">
                You retain all rights to your translation content. Our platform's 
                design, code, and features are protected by copyright and remain 
                our property.
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-blue">7. 🔄 Service Changes</h3>
              <p className="leading-relaxed">
                We may update, modify, or discontinue features at any time. 
                We'll do our best to notify you of major changes in advance.
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-pink">8. ⚠️ Limitation of Liability</h3>
              <p className="leading-relaxed">
                We provide the service "as is" and cannot guarantee uninterrupted 
                access. We're not liable for any data loss, though we take backups 
                seriously!
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-black mb-3 text-poe-green">9. 📧 Contact Us</h3>
              <p className="leading-relaxed">
                Questions about these terms? Reach out to us at support@poeditor-manager.com. 
                We're here to help make your localization journey smooth!
              </p>
            </section>
            
            <section className="bg-poe-yellow/20 border-4 border-poe-black rounded-2xl p-4 m-2">
              <p className="text-center font-black italic">
                🎉 By clicking "Accept & Continue", you agree to these terms and 
                are ready to start your localization adventure!
              </p>
            </section>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t-4 border-poe-black p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-4 border-poe-black rounded-xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-1 active:shadow-none"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-6 py-3 bg-poe-green border-4 border-poe-black rounded-xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
