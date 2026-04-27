'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import CartoonBackground from '../components/CartoonBackground';
import Button from '../components/Button';
import OracleConnectionForm from '../components/OracleConnectionForm';
import QueryEditor from '../components/QueryEditor';
import ConnectionStatusModal from '../components/ConnectionStatusModal';
import DisconnectConfirmModal from '../components/DisconnectConfirmModal';
import { ArrowLeft, Database, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { withAuth } from '../lib/withAuth';

function DatabaseConnectionPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleConnectionSuccess = (config: any) => {
    setIsConnected(true);
    setConnectionConfig(config);
    setConnectionStatus({
      success: true,
      message: 'Successfully connected to Oracle Database!'
    });
    setShowStatusModal(true);
  };

  const handleDisconnectClick = () => {
    // Show disconnect confirmation modal
    setShowDisconnectModal(true);
  };

  const handleDisconnectConfirm = () => {
    // Actually disconnect
    setIsConnected(false);
    setConnectionConfig(null);
    
    // Don't show status modal after disconnect
    // User already confirmed in disconnect modal
  };

  const handleTestConnection = async () => {
    if (!connectionConfig) return;

    setIsTestingConnection(true);
    
    try {
      const response = await fetch('/api/oracle/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus({
          success: true,
          message: 'Connection is active and working properly!'
        });
      } else {
        setConnectionStatus({
          success: false,
          message: data.error || 'Connection test failed'
        });
      }
      setShowStatusModal(true);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Network error. Unable to test connection.'
      });
      setShowStatusModal(true);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CartoonBackground />
      <Navbar />
      
      <main className="pt-32 pb-16 sm:pb-24">
        <div className="w-full max-w-7xl mx-auto px-6">
          
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="white" size="md" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
              Back to Dashboard
            </Button>
          </div>

          {/* Page Header */}
          <div className="bg-poe-blue text-white border-4 border-poe-black rounded-3xl cartoon-shadow p-8 sm:p-10 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl flex items-center justify-center shrink-0">
                  <Database className="w-8 h-8 text-poe-blue" strokeWidth={3} />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                    Oracle Database
                  </h1>
                  <p className="text-lg sm:text-xl font-bold opacity-90">
                    Connect and manage your translations
                  </p>
                </div>
              </div>
              
              {/* Connection Status & Test Button */}
              {isConnected && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="bg-poe-green border-4 border-poe-black rounded-2xl px-4 py-3 inline-flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="font-black text-white">Connected</span>
                  </div>
                  <Button 
                    variant="yellow" 
                    size="md" 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={3} />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" strokeWidth={3} />
                        <span>Test Connection</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Connection Form or Query Editor */}
          {!isConnected ? (
            <OracleConnectionForm onConnectionSuccess={handleConnectionSuccess} />
          ) : (
            <QueryEditor 
              connectionConfig={connectionConfig} 
              onDisconnect={handleDisconnectClick}
            />
          )}
        </div>
      </main>

      {/* Connection Status Modal */}
      {showStatusModal && connectionStatus && (
        <ConnectionStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          success={connectionStatus.success}
          message={connectionStatus.message}
        />
      )}

      {/* Disconnect Confirmation Modal */}
      <DisconnectConfirmModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleDisconnectConfirm}
        connectionInfo={connectionConfig}
      />
    </div>
  );
}

export default withAuth(DatabaseConnectionPage);
