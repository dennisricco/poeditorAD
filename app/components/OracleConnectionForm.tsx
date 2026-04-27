'use client';

import { useState } from 'react';
import Button from './Button';
import { Database, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface OracleConnectionFormProps {
  onConnectionSuccess: (config: OracleConnectionConfig) => void;
}

export interface OracleConnectionConfig {
  host: string;
  port: string;
  serviceName: string;
  username: string;
  password: string;
}

export default function OracleConnectionForm({ onConnectionSuccess }: OracleConnectionFormProps) {
  const [formData, setFormData] = useState<OracleConnectionConfig>({
    host: '',
    port: '1521',
    serviceName: '',
    username: '',
    password: '',
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear status when user types
    if (connectionStatus.type) {
      setConnectionStatus({ type: null, message: '' });
    }
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.host || !formData.port || !formData.serviceName || !formData.username || !formData.password) {
      setConnectionStatus({
        type: 'error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus({ type: null, message: '' });

    try {
      // Call API to test connection
      const response = await fetch('/api/oracle/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus({
          type: 'success',
          message: 'Connection successful! You can now use the query editor.',
        });
        
        // Call success callback after a short delay
        setTimeout(() => {
          onConnectionSuccess(formData);
        }, 1000);
      } else {
        setConnectionStatus({
          type: 'error',
          message: data.error || 'Failed to connect to database',
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-poe-yellow border-4 border-poe-black rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6" strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black">Database Connection</h2>
      </div>

      <form onSubmit={handleTestConnection} className="space-y-5">
        {/* Host */}
        <div>
          <label htmlFor="host" className="block text-sm font-black uppercase tracking-wide mb-2">
            Host / IP Address *
          </label>
          <input
            type="text"
            id="host"
            name="host"
            value={formData.host}
            onChange={handleInputChange}
            placeholder="localhost or 192.168.1.100"
            className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
            required
          />
        </div>

        {/* Port */}
        <div>
          <label htmlFor="port" className="block text-sm font-black uppercase tracking-wide mb-2">
            Port *
          </label>
          <input
            type="text"
            id="port"
            name="port"
            value={formData.port}
            onChange={handleInputChange}
            placeholder="1521"
            className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
            required
          />
        </div>

        {/* Service Name */}
        <div>
          <label htmlFor="serviceName" className="block text-sm font-black uppercase tracking-wide mb-2">
            Service Name / SID *
          </label>
          <input
            type="text"
            id="serviceName"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleInputChange}
            placeholder="ORCL or XE"
            className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-black uppercase tracking-wide mb-2">
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="system or your_username"
            className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
            required
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-black uppercase tracking-wide mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" strokeWidth={3} />
              ) : (
                <Eye className="w-5 h-5" strokeWidth={3} />
              )}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus.type && (
          <div
            className={`
              border-4 border-poe-black rounded-2xl p-4 flex items-start gap-3
              ${connectionStatus.type === 'success' ? 'bg-poe-green' : 'bg-poe-pink'}
            `}
          >
            {connectionStatus.type === 'success' ? (
              <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
            ) : (
              <XCircle className="w-6 h-6 shrink-0 mt-0.5" strokeWidth={3} />
            )}
            <p className="font-bold text-base">{connectionStatus.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            variant="blue"
            size="lg"
            className="w-full"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" strokeWidth={3} />
                <span>Test Connection</span>
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-poe-yellow bg-opacity-20 border-4 border-poe-black rounded-2xl p-4">
          <p className="text-sm font-bold">
            <span className="font-black">Note:</span> Make sure your Oracle database is accessible from this network. 
            The connection will be tested before allowing you to proceed to the query editor.
          </p>
        </div>
      </form>
    </div>
  );
}
