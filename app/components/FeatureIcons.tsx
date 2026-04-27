import { Sparkles, Zap, Globe } from 'lucide-react';

export default function FeatureIcons() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto bg-poe-pink border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-2">
          <Sparkles className="w-7 h-7" strokeWidth={3} />
        </div>
        <p className="font-black text-xs">Easy to Use</p>
      </div>
      <div className="text-center">
        <div className="w-14 h-14 mx-auto bg-poe-yellow border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-2">
          <Zap className="w-7 h-7" strokeWidth={3} />
        </div>
        <p className="font-black text-xs">Super Fast</p>
      </div>
      <div className="text-center">
        <div className="w-14 h-14 mx-auto bg-poe-blue border-4 border-poe-black rounded-2xl cartoon-shadow-sm flex items-center justify-center mb-2">
          <Globe className="w-7 h-7 text-white" strokeWidth={3} />
        </div>
        <p className="font-black text-xs">Multi-Lang</p>
      </div>
    </div>
  );
}
