'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Database } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { signOut } from '../lib/auth';

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsDropdownOpen(false);
      
      // Sign out from Supabase
      await signOut();
      
      // Use replace instead of push to avoid back button issues
      // And use window.location for hard navigation to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
      <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center gap-3 sm:gap-4 hover:opacity-90 transition-opacity">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-poe-yellow border-4 border-poe-black rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl rotate-3 shrink-0">
              P
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight whitespace-nowrap">
              POE<span className="text-poe-blue">3D</span>
            </h1>
          </Link>
          
          {/* Profile Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-11 h-11 sm:w-12 sm:h-12 bg-poe-pink border-4 border-poe-black rounded-full cartoon-shadow-sm flex items-center justify-center transition-cartoon btn-press hover:bg-opacity-90 shrink-0"
              aria-label="User profile"
              aria-expanded={isDropdownOpen}
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow overflow-hidden">
                {/* User Info */}
                {user && (
                  <div className="px-4 py-3 border-b-4 border-poe-black bg-poe-yellow/20">
                    <p className="font-black text-sm uppercase tracking-wide text-gray-600">Signed in as</p>
                    <p className="font-bold text-sm truncate mt-1">{user.email}</p>
                  </div>
                )}
                
                {/* Database Connection Link */}
                <Link
                  href="/database-connection"
                  className="w-full px-4 py-3 flex items-center gap-3 font-bold text-left hover:bg-poe-blue hover:bg-opacity-20 transition-colors border-b-4 border-poe-black"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Database className="w-5 h-5" strokeWidth={3} />
                  <span>Database Connection</span>
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-3 flex items-center gap-3 font-bold text-left hover:bg-poe-pink hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-5 h-5" strokeWidth={3} />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
