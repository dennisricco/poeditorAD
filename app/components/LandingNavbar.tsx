'use client';

import Link from 'next/link';

export default function LandingNavbar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
      <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 hover:opacity-90 transition-opacity">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-poe-yellow border-4 border-poe-black rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl rotate-3 shrink-0">
              P
            </div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight whitespace-nowrap">
              POE<span className="text-poe-blue">3D</span>
            </h1>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Login Button - Outline */}
            <Link href="/login">
              <button className="px-5 py-2 sm:px-6 sm:py-2.5 border-4 border-poe-black rounded-xl font-black text-sm sm:text-base transition-all duration-200 hover:scale-105 hover:shadow-[4px_4px_0px_0px_#000000] active:scale-95 active:shadow-none bg-white">
                Login
              </button>
            </Link>
            
            {/* Register Button - Filled */}
            <Link href="/register">
              <button className="px-5 py-2 sm:px-6 sm:py-2.5 border-4 border-poe-black rounded-xl font-black text-sm sm:text-base transition-all duration-200 hover:scale-105 hover:shadow-[4px_4px_0px_0px_#000000] active:scale-95 active:shadow-none bg-poe-blue text-white cartoon-shadow-sm">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
