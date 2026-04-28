'use client';

import { useState } from 'react';
import Button from './Button';
import { Database, Loader2, CheckCircle, XCircle, Eye, EyeOff, FolderOpen } from 'lucide-react';
import { DatabaseConnectionConfig, DatabaseType, DATABASE_TYPES } from '../types/database-connection';

interface UniversalConnectionFormProps {
  databaseType: DatabaseType;
  onConnectionSuccess: (config: DatabaseConnectionConfig) => void;
  onBack: () => void;
}

export default function UniversalConnectionForm({ 
  databaseType, 
  onConnectionSuccess,
  onBack 
}: UniversalConnectionFormProps) {
  const dbInfo = DATABASE_TYPES.find(db => db.id === databaseType);
  
  const [formData, setFormData] = useState<any>({
    type: databaseType,
    name: '',
    host: '',
    port: dbInfo?.defaultPort || '',
    database: '',
    serviceName: '',
    username: '',
    password: '',
    filePath: '',
    schema: '',
    instance: '',
    authDatabase: 'admin',
    ssl: false,
    encrypt: false,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (connectionStatus.type) {
      setConnectionStatus({ type: null, message: '' });
    }
  };

  const validateForm = (): boolean => {
    switch (databaseType) {
      case 'oracle':
        return !!(formData.host && formData.port && formData.serviceName && formData.username && formData.password);
      case 'mysql':
      case 'postgresql':
        return !!(formData.host && formData.port && formData.database && formData.username && formData.password);
      case 'sqlite':
        return !!formData.filePath;
      case 'sqlserver':
        return !!(formData.host && formData.port && formData.database && formData.username && formData.password);
      case 'mongodb':
        return !!(formData.host && formData.port && formData.database);
      default:
        return false;
    }
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setConnectionStatus({
        type: 'error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/database/test-connection', {
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
        
        setTimeout(() => {
          onConnectionSuccess(formData as DatabaseConnectionConfig);
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

  const renderFormFields = () => {
    switch (databaseType) {
      case 'oracle':
        return (
          <>
            <FormInput
              label="Connection Name (Optional)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My Oracle DB"
            />
            <FormInput
              label="Host / IP Address"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              placeholder="localhost or 192.168.1.100"
              required
            />
            <FormInput
              label="Port"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              placeholder="1521"
              required
            />
            <FormInput
              label="Service Name / SID"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleInputChange}
              placeholder="ORCL or XE"
              required
            />
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="system or your_username"
              required
              autoComplete="username"
            />
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              required
            />
          </>
        );

      case 'mysql':
        return (
          <>
            <FormInput
              label="Connection Name (Optional)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My MySQL DB"
            />
            <FormInput
              label="Host / IP Address"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              placeholder="localhost or 192.168.1.100"
              required
            />
            <FormInput
              label="Port"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              placeholder="3306"
              required
            />
            <FormInput
              label="Database Name"
              name="database"
              value={formData.database}
              onChange={handleInputChange}
              placeholder="my_database"
              required
            />
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="root or your_username"
              required
              autoComplete="username"
            />
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              required
            />
            <CheckboxInput
              label="Use SSL Connection"
              name="ssl"
              checked={formData.ssl}
              onChange={handleInputChange}
            />
          </>
        );

      case 'postgresql':
        return (
          <>
            <FormInput
              label="Connection Name (Optional)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My PostgreSQL DB"
            />
            <FormInput
              label="Host / IP Address"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              placeholder="localhost or 192.168.1.100"
              required
            />
            <FormInput
              label="Port"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              placeholder="5432"
              required
            />
            <FormInput
              label="Database Name"
              name="database"
              value={formData.database}
              onChange={handleInputChange}
              placeholder="postgres"
              required
            />
            <FormInput
              label="Schema (Optional)"
              name="schema"
              value={formData.schema}
              onChange={handleInputChange}
              placeholder="public"
            />
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="postgres"
              required
              autoComplete="username"
            />
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              required
            />
            <CheckboxInput
              label="Use SSL Connection"
              name="ssl"
              checked={formData.ssl}
              onChange={handleInputChange}
            />
          </>
        );

      case 'sqlite':
        return (
          <>
            <FormInput
              label="Connection Name (Optional)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My SQLite DB"
            />
            <div>
              <label htmlFor="filePath" className="block text-sm font-black uppercase tracking-wide mb-2">
                Database File Path *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="filePath"
                  name="filePath"
                  value={formData.filePath}
                  onChange={handleInputChange}
                  placeholder="C:\path\to\database.db or /path/to/database.db"
                  className="flex-1 px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
                  required
                />
                <Button
                  variant="yellow"
                  size="md"
                  type="button"
                  onClick={() => {
                    // In a real app, this would open a file picker
                    alert('File picker would open here. For now, please type the path manually.');
                  }}
                >
                  <FolderOpen className="w-5 h-5" strokeWidth={3} />
                </Button>
              </div>
              <p className="mt-2 text-xs font-bold text-gray-600">
                Enter the full path to your SQLite database file
              </p>
            </div>
          </>
        );

      case 'sqlserver':
        return (
          <>
            <FormInput
              label="Connection Name (Optional)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My SQL Server DB"
            />
            <FormInput
              label="Host / IP Address"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              placeholder="localhost or 192.168.1.100"
              required
            />
            <FormInput
              label="Port"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              placeholder="1433"
              required
            />
            <FormInput
              label="Instance Name (Optional)"
              name="instance"
              value={formData.instance}
              onChange={handleInputChange}
              placeholder="SQLEXPRESS"
            />
            <FormInput
              label="Database Name"
              name="database"
              value={formData.database}
              onChange={handleInputChange}
              placeholder="master"
              required
            />
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="sa or your_username"
              required
              autoComplete="username"
            />
            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              required
            />
            <CheckboxInput
              label="Encrypt Connection"
              name="encrypt"
              checked={formData.encrypt}
              onChange={handleInputChange}
            />
          </>
        );

      case 'mongodb':
        return (
          <>
            <FormInput
              label="Connection Name (Optional)"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My MongoDB"
            />
            <FormInput
              label="Host / IP Address"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              placeholder="localhost or 192.168.1.100"
              required
            />
            <FormInput
              label="Port"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              placeholder="27017"
              required
            />
            <FormInput
              label="Database Name"
              name="database"
              value={formData.database}
              onChange={handleInputChange}
              placeholder="admin"
              required
            />
            <FormInput
              label="Username (Optional)"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="admin"
              autoComplete="username"
            />
            <PasswordInput
              label="Password (Optional)"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            <FormInput
              label="Auth Database"
              name="authDatabase"
              value={formData.authDatabase}
              onChange={handleInputChange}
              placeholder="admin"
            />
            <CheckboxInput
              label="Use SSL Connection"
              name="ssl"
              checked={formData.ssl}
              onChange={handleInputChange}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-5xl">{dbInfo?.icon}</div>
        <div className="flex-1">
          <h2 className="text-3xl font-black">{dbInfo?.name} Connection</h2>
          <p className="text-base font-bold text-gray-600">{dbInfo?.description}</p>
        </div>
        <Button variant="white" size="sm" onClick={onBack}>
          Change Database
        </Button>
      </div>

      <form onSubmit={handleTestConnection} className="space-y-5">
        {renderFormFields()}

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
            <span className="font-black">Note:</span> Make sure your {dbInfo?.name} database is accessible from this network. 
            The connection will be tested before allowing you to proceed to the query editor.
          </p>
        </div>
      </form>
    </div>
  );
}

// Helper Components
interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

function FormInput({ label, name, value, onChange, placeholder, required, autoComplete }: FormInputProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-black uppercase tracking-wide mb-2">
        {label} {required && '*'}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  required?: boolean;
}

function PasswordInput({ label, name, value, onChange, showPassword, onTogglePassword, required }: PasswordInputProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-black uppercase tracking-wide mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="w-full px-4 py-3 pr-12 border-4 border-poe-black rounded-xl font-bold text-base focus:outline-none focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all"
          required={required}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={onTogglePassword}
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
  );
}

interface CheckboxInputProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function CheckboxInput({ label, name, checked, onChange }: CheckboxInputProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-6 h-6 border-4 border-poe-black rounded-lg focus:ring-4 focus:ring-poe-blue focus:ring-opacity-50 transition-all cursor-pointer"
      />
      <label htmlFor={name} className="text-sm font-black uppercase tracking-wide cursor-pointer">
        {label}
      </label>
    </div>
  );
}
