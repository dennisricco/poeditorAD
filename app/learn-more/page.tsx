'use client';

import Link from 'next/link';
import { ArrowRight, Globe, Zap, Shield, Users, Download, Sparkles, CheckCircle, Star } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import CartoonBackground from '../components/CartoonBackground';
import Button from '../components/Button';

export default function LearnMorePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <CartoonBackground />
      <LandingNavbar />
      
      <main className="pt-32 pb-16">
        <div className="w-full max-w-6xl mx-auto px-6">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="bg-poe-yellow border-4 border-poe-black rounded-2xl cartoon-shadow px-6 py-2 rotate-2 m-2">
                <p className="font-black text-sm uppercase tracking-wide">Learn More</p>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black italic leading-tight mb-6">
              Translation Management <br />
              Made <span className="text-poe-blue">Fun & Easy!</span>
            </h1>
            
            <p className="text-xl sm:text-2xl font-bold text-gray-800 max-w-3xl mx-auto mb-8">
              Discover how POE3D transforms boring translation work into an exciting, 
              colorful experience with powerful features and delightful design.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="green" size="lg">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-6 h-6" strokeWidth={3} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="blue" size="lg">
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Features */}
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-black italic text-center mb-12">
              Why Choose <span className="text-poe-pink">POE3D?</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="bg-poe-yellow border-4 border-poe-black rounded-3xl cartoon-shadow p-8 m-2">
                <div className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-6 -rotate-3">
                  <Globe className="w-8 h-8" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black mb-3">Multi-Language Support</h3>
                <p className="font-bold text-gray-800">
                  Manage translations for dozens of languages in one place. 
                  Export in multiple formats: JSON, CSV, XLSX, and more!
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow p-8 m-2">
                <div className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-6 rotate-3">
                  <Zap className="w-8 h-8" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black mb-3">Lightning Fast</h3>
                <p className="font-bold text-gray-800">
                  Export translations in seconds, not minutes. Our optimized 
                  workflow saves you hours of tedious work.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-poe-pink border-4 border-poe-black rounded-3xl cartoon-shadow p-8 m-2">
                <div className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-6 -rotate-3">
                  <Shield className="w-8 h-8" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black mb-3">Secure & Private</h3>
                <p className="font-bold text-gray-800">
                  Your data is protected with enterprise-grade security. 
                  Row-level security ensures your translations stay private.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-poe-green border-4 border-poe-black rounded-3xl cartoon-shadow p-8 m-2">
                <div className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-6 rotate-3">
                  <Users className="w-8 h-8" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black mb-3">Team Collaboration</h3>
                <p className="font-bold text-gray-800">
                  Work together with your team seamlessly. Share projects, 
                  manage permissions, and track changes.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-poe-yellow border-4 border-poe-black rounded-3xl cartoon-shadow p-8 m-2">
                <div className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-6 -rotate-3">
                  <Download className="w-8 h-8" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black mb-3">Flexible Export</h3>
                <p className="font-bold text-gray-800">
                  Export single or dual languages at once. Choose from JSON, 
                  CSV, XLSX, or key-value formats.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow p-8 m-2">
                <div className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-6 rotate-3">
                  <Sparkles className="w-8 h-8" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black mb-3">Auto-Cleaning</h3>
                <p className="font-bold text-gray-800">
                  Automatically clean problematic characters, normalize formats, 
                  and ensure consistency across all translations.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-black italic text-center mb-12">
              How It <span className="text-poe-green">Works</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-poe-yellow border-4 border-poe-black rounded-full cartoon-shadow flex items-center justify-center mx-auto mb-4 -rotate-6">
                  <span className="text-4xl font-black">1</span>
                </div>
                <h3 className="text-xl font-black mb-2">Sign Up</h3>
                <p className="font-bold text-gray-700">
                  Create your free account in seconds
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-poe-blue border-4 border-poe-black rounded-full cartoon-shadow flex items-center justify-center mx-auto mb-4 rotate-6">
                  <span className="text-4xl font-black">2</span>
                </div>
                <h3 className="text-xl font-black mb-2">Connect POEditor</h3>
                <p className="font-bold text-gray-700">
                  Link your POEditor projects
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-poe-pink border-4 border-poe-black rounded-full cartoon-shadow flex items-center justify-center mx-auto mb-4 -rotate-6">
                  <span className="text-4xl font-black">3</span>
                </div>
                <h3 className="text-xl font-black mb-2">Manage Translations</h3>
                <p className="font-bold text-gray-700">
                  View and organize your content
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-poe-green border-4 border-poe-black rounded-full cartoon-shadow flex items-center justify-center mx-auto mb-4 rotate-6">
                  <span className="text-4xl font-black">4</span>
                </div>
                <h3 className="text-xl font-black mb-2">Export & Use</h3>
                <p className="font-bold text-gray-700">
                  Download in your preferred format
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-20">
            <h2 className="text-4xl sm:text-5xl font-black italic text-center mb-12">
              What You'll <span className="text-poe-blue">Love</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {[
                'Save hours of manual translation work',
                'Beautiful, intuitive interface',
                'No more copy-paste errors',
                'Consistent formatting across languages',
                'Real-time sync with POEditor',
                'Export history and version control',
                'Mobile-friendly responsive design',
                'Free to start, scale as you grow'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow p-6 m-2">
                  <div className="shrink-0">
                    <CheckCircle className="w-6 h-6 text-poe-green" strokeWidth={3} />
                  </div>
                  <p className="font-bold text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial-style Section */}
          <div className="mb-20">
            <div className="bg-gradient-to-br from-poe-yellow to-poe-pink border-4 border-poe-black rounded-3xl cartoon-shadow p-12 text-center m-2">
              <div className="flex justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-poe-black" strokeWidth={3} />
                ))}
              </div>
              <p className="text-2xl sm:text-3xl font-black italic mb-6">
                "Finally, a translation tool that doesn't make me want to cry! 
                The design is amazing and it actually makes localization fun."
              </p>
              <p className="text-xl font-bold">
                - Happy Developer 🎉
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow p-12 m-2">
              <h2 className="text-4xl sm:text-5xl font-black italic mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl font-bold text-gray-800 mb-8 max-w-2xl mx-auto">
                Join developers and teams who are already managing their translations 
                with style. It's free to start!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="green" size="lg">
                    <span>Create Free Account</span>
                    <ArrowRight className="w-6 h-6" strokeWidth={3} />
                  </Button>
                </Link>
                <Link href="/login">
                  <button className="inline-flex items-center justify-center px-9 py-4 text-lg gap-3 border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none bg-white hover:bg-gray-50">
                    Already have an account?
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
