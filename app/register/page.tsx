'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Rocket, AlertCircle, CheckCircle } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import CartoonBackground from '../components/CartoonBackground';
import TermsModal from '../components/TermsModal';
import { signUp } from '../lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }
    
    // Show terms modal
    setIsTermsModalOpen(true);
  };

  const handleAcceptTerms = async () => {
    setIsTermsModalOpen(false);
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await signUp({
        email,
        password,
        fullName: name,
      });

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds using window.location
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
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
            
            {/* Register Card */}
            <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-8 sm:p-10 m-2">
              
              {/* Header with Icon */}
              <div className="text-center space-y-4 mb-8">
                <div className="w-20 h-20 mx-auto bg-poe-pink border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center -rotate-3 m-2">
                  <Rocket className="w-10 h-10" strokeWidth={3} />
                </div>
                <h1 className="text-4xl font-black italic">Join Us!</h1>
                <p className="text-gray-700 font-bold">Create your account and start localizing</p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border-4 border-poe-black rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <p className="font-bold text-red-800">{error}</p>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-100 border-4 border-poe-black rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <p className="font-bold text-green-800">{success}</p>
                </div>
              )}
              
              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-black uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <User className="w-5 h-5 text-gray-600" strokeWidth={3} />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base transition-all duration-200 focus:outline-none focus:border-poe-yellow focus:shadow-[4px_4px_0px_0px_#FFDE59] box-border"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
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
                
                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-black uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Lock className="w-5 h-5 text-gray-600" strokeWidth={3} />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base transition-all duration-200 focus:outline-none focus:border-poe-yellow focus:shadow-[4px_4px_0px_0px_#FFDE59] box-border"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="m-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg bg-poe-blue text-white border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none box-border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
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
              
              {/* Login Link */}
              <div className="text-center">
                <p className="font-bold text-gray-700">
                  Already have an account?{' '}
                  <Link href="/login" className="text-poe-blue font-black hover:underline">
                    Login Here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
