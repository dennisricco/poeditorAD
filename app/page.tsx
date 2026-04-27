import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LandingNavbar from './components/LandingNavbar';
import Button from './components/Button';
import CartoonBackground from './components/CartoonBackground';
import Hero3DBox from './components/Hero3DBox';
import HeroBadge from './components/HeroBadge';
import FeatureIcons from './components/FeatureIcons';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <CartoonBackground />
      <LandingNavbar />
      
      {/* Hero Section - Centered */}
      <main className="min-h-screen flex items-center justify-center pt-32 pb-16">
        <div className="w-full max-w-6xl mx-auto px-6">
          
          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div>
              <HeroBadge />
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black italic leading-tight mb-3">
                Localize your App <br />
                with <span className="text-poe-blue">Fun!</span>
              </h1>
              
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Manage translations across multiple languages with our 3D cartoon-style localization platform. 
                Make boring translation work exciting!
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link href="/register">
                  <Button variant="green" size="lg" className="w-full sm:w-auto text-xl">
                    <span>Get Started</span>
                    <ArrowRight className="w-6 h-6" strokeWidth={3} />
                  </Button>
                </Link>
                
                <Link href="/learn-more">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 text-lg gap-3 border-4 border-poe-black rounded-2xl cartoon-shadow font-black transition-cartoon btn-press hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-1 active:shadow-none bg-white hover:bg-gray-50">
                    Learn More
                  </button>
                </Link>
              </div>
              
              {/* Features */}
              <FeatureIcons />
            </div>
            
            {/* Right Visual */}
            <Hero3DBox />
          </div>
        </div>
      </main>
    </div>
  );
}
