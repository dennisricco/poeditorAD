'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import CartoonBackground from '../components/CartoonBackground';
import OTPInput from '../components/OTPInput';
import { resetPassword, verifyOTPAndUpdatePassword } from '../lib/auth';
import { OTP_CONFIG, getOTPDescription } from '../config/otp';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      // Handle rate limit errors specifically
      const errorMessage = err.message || '';
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many') || errorMessage.includes('60 seconds')) {
        setError('Please wait 60 seconds before requesting another code. This is a security measure to prevent abuse.');
      } else {
        setError(errorMessage || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (otpValue: string) => {
    setOtp(otpValue);
    setStep('password');
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }

    setIsLoading(true);

    try {
      await verifyOTPAndUpdatePassword(email, otp, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email);
      startResendTimer();
      // Clear any previous errors on successful resend
      setError('');
    } catch (err: any) {
      // Handle rate limit errors specifically
      const errorMessage = err.message || '';
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many') || errorMessage.includes('60 seconds')) {
        setError('Rate limit reached. Please wait 60 seconds before requesting another code.');
      } else {
        setError(errorMessage || 'Failed to resend code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Timer for resend button
  const startResendTimer = () => {
    setResendTimer(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CartoonBackground />
      <LandingNavbar />
      
      <main className="min-h-screen flex items-center justify-center pt-32 pb-16">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="max-w-md mx-auto">
            
            {/* Card */}
            <div className="bg-white border-4 border-poe-black rounded-3xl cartoon-shadow p-8 sm:p-10 m-2">
              
              {/* Step 1: Email Input */}
              {step === 'email' && (
                <>
                  {/* Header */}
                  <div className="text-center space-y-4 mb-8">
                    <div className="w-20 h-20 mx-auto bg-poe-blue border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center rotate-3 m-2">
                      <KeyRound className="w-10 h-10" strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl font-black italic">Forgot Password?</h1>
                    <p className="text-gray-700 font-bold">
                      No worries! We'll send you a reset code
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-100 border-4 border-poe-black rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={3} />
                      <p className="font-bold text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-black uppercase tracking-wide mb-2">
                        Email Address
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

                    <div className="m-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg bg-poe-blue border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none box-border disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{isLoading ? 'Sending...' : 'Send Reset Code'}</span>
                        {!isLoading && <ArrowRight className="w-6 h-6" strokeWidth={3} />}
                      </button>
                    </div>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-poe-blue font-black hover:underline">
                      <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                      <span>Back to Login</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <>
                  {/* Header */}
                  <div className="text-center space-y-4 mb-8">
                    <div className="w-20 h-20 mx-auto bg-poe-yellow border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center -rotate-3 m-2">
                      <Mail className="w-10 h-10" strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl font-black italic">Check Your Email</h1>
                    <p className="text-gray-700 font-bold">
                      We sent a {getOTPDescription()} to<br />
                      <span className="text-poe-blue">{email}</span>
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-100 border-4 border-poe-black rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={3} />
                      <p className="font-bold text-red-800">{error}</p>
                    </div>
                  )}

                  {/* OTP Input */}
                  <div className="mb-8">
                    <label className="block text-sm font-black uppercase tracking-wide mb-4 text-center">
                      Enter Verification Code
                    </label>
                    <OTPInput
                      length={OTP_CONFIG.LENGTH}
                      onComplete={handleVerifyOTP}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 text-center mt-3 font-bold">
                      Enter the {getOTPDescription()} from your email
                    </p>
                  </div>

                  {/* Resend Code */}
                  <div className="text-center space-y-4">
                    <p className="font-bold text-gray-700">
                      Didn't receive the code?
                    </p>
                    <button
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || isLoading}
                      className="font-black text-poe-blue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                    
                    {/* Rate limit info */}
                    <p className="text-xs text-gray-500 font-bold mt-2">
                      For security, you can only request a code once per minute
                    </p>
                  </div>

                  {/* Back */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setStep('email')}
                      className="inline-flex items-center gap-2 text-poe-blue font-black hover:underline"
                    >
                      <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                      <span>Change Email</span>
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: New Password */}
              {step === 'password' && (
                <>
                  {/* Header */}
                  <div className="text-center space-y-4 mb-8">
                    <div className="w-20 h-20 mx-auto bg-poe-green border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center rotate-3 m-2">
                      <Lock className="w-10 h-10" strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl font-black italic">New Password</h1>
                    <p className="text-gray-700 font-bold">
                      Create a strong password for your account
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-100 border-4 border-poe-black rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={3} />
                      <p className="font-bold text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-black uppercase tracking-wide mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Lock className="w-5 h-5 text-gray-600" strokeWidth={3} />
                        </div>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-3 border-4 border-poe-black rounded-xl font-bold text-base transition-all duration-200 focus:outline-none focus:border-poe-yellow focus:shadow-[4px_4px_0px_0px_#FFDE59] box-border"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

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

                    <div className="m-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg bg-poe-green border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none box-border disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                        {!isLoading && <ArrowRight className="w-6 h-6" strokeWidth={3} />}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <>
                  {/* Header */}
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-poe-green border-4 border-poe-black rounded-full cartoon-shadow flex items-center justify-center -rotate-6 m-2">
                      <CheckCircle className="w-14 h-14" strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl font-black italic">All Set!</h1>
                    <p className="text-xl font-bold text-gray-800">
                      Your password has been reset successfully
                    </p>

                    <div className="pt-4">
                      <Link href="/login">
                        <button className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg bg-poe-blue border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none">
                          <span>Go to Login</span>
                          <ArrowRight className="w-6 h-6" strokeWidth={3} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
