'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import CartoonBackground from '../components/CartoonBackground';
import { signIn } from '../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with email:', email);
      
      const result = await signIn({ email, password });
      
      console.log('Login successful:', result);
      
      // Simple redirect using router
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CartoonBackground />
      <LandingNavbar />
      
      <main className="min-h-screen flex items-center justify-center pt-32 pb-16">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="max-w-md mx-auto">
            
            {/* Login Card */}
            <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-8 sm:p-10 m-2">
              
              {/* Header with Icon */}
              <div className="text-center space-y-4 mb-8">
                <div className="w-20 h-20 mx-auto bg-poe-yellow border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center rotate-3 m-2">
                  <Sparkles className="w-10 h-10" strokeWidth={3} />
                </div>
                <h1 className="text-4xl font-black italic">Welcome Back!</h1>
                <p className="text-gray-700 font-bold">Login to continue your localization journey</p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border-4 border-poe-black rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <p className="font-bold text-red-800">{error}</p>
                </div>
              )}
              
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-black uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Mail className="w-5 h-5 text-gray-600" strokeWidth={3} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base transition-all duration-200 focus:outline-none focus:border-poe-yellow focus:shadow-[4px_4px_0px_0px_#FFDE59] box-border"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-black uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Lock className="w-5 h-5 text-gray-600" strokeWidth={3} />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base transition-all duration-200 focus:outline-none focus:border-poe-yellow focus:shadow-[4px_4px_0px_0px_#FFDE59] box-border"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Forgot Password */}
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm font-bold text-poe-blue hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                
                {/* Submit Button */}
                <div className="m-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg bg-poe-green border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none box-border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isLoading ? 'Logging in...' : 'Login'}</span>
                    {!isLoading && <ArrowRight className="w-6 h-6" strokeWidth={3} />}
                  </button>
                </div>
              </form>
              
              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-4 border-poe-black"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 font-black text-sm uppercase">Or</span>
                </div>
              </div>
              
              {/* Register Link */}
              <div className="text-center">
                <p className="font-bold text-gray-700">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-poe-blue font-black hover:underline">
                    Register Now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
