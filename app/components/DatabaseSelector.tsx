'use client';

import { DATABASE_TYPES, DatabaseType } from '../types/database-connection';
import { Check } from 'lucide-react';

interface DatabaseSelectorProps {
  selectedType: DatabaseType | null;
  onSelect: (type: DatabaseType) => void;
}

export default function DatabaseSelector({ selectedType, onSelect }: DatabaseSelectorProps) {
  return (
    <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-black mb-2">Select Database Type</h2>
        <p className="text-lg font-bold text-gray-600">
          Choose the database you want to connect to
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DATABASE_TYPES.map((db) => {
          const isSelected = selectedType === db.id;
          
          return (
            <button
              key={db.id}
              onClick={() => onSelect(db.id)}
              className={`
                relative p-6 border-4 border-poe-black rounded-2xl
                transition-all duration-200 text-left
                ${isSelected 
                  ? 'bg-poe-blue text-white cartoon-shadow-lg transform -translate-y-1' 
                  : 'bg-white hover:bg-gray-50 hover:cartoon-shadow'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-poe-green border-4 border-poe-black rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={4} />
                </div>
              )}

              {/* Database Icon */}
              <div className="text-5xl mb-3">{db.icon}</div>

              {/* Database Name */}
              <h3 className="text-xl font-black mb-1">{db.name}</h3>

              {/* Description */}
              <p className={`text-sm font-bold ${isSelected ? 'text-white opacity-90' : 'text-gray-600'}`}>
                {db.description}
              </p>

              {/* Default Port */}
              {db.defaultPort && (
                <div className={`
                  mt-3 inline-block px-3 py-1 rounded-lg text-xs font-black
                  ${isSelected 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-gray-100 text-gray-700'
                  }
                `}>
                  Port: {db.defaultPort}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-poe-yellow bg-opacity-20 border-4 border-poe-black rounded-2xl p-4">
        <p className="text-sm font-bold">
          <span className="font-black">💡 Tip:</span> Select the database type that matches your server. 
          Each database has different connection requirements and features.
        </p>
      </div>
    </div>
  );
}
