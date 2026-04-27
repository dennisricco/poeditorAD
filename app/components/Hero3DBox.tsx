export default function Hero3DBox() {
  return (
    <div className="relative hidden lg:block">
      <div className="relative p-8">
        {/* Main 3D Box */}
        <div className="bg-poe-blue border-4 border-poe-black rounded-3xl cartoon-shadow-lg p-8 transform rotate-3 hover:rotate-6 transition-all duration-300 m-2">
          <div className="bg-white border-4 border-poe-black rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-poe-yellow border-4 border-poe-black rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-poe-black rounded-full w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded-full w-1/2"></div>
              </div>
            </div>
            <div className="h-24 bg-poe-pink border-4 border-poe-black rounded-xl"></div>
          </div>
          
          <div className="bg-white border-4 border-poe-black rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-poe-green border-4 border-poe-black rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-poe-black rounded-full w-2/3"></div>
                <div className="h-3 bg-gray-300 rounded-full w-1/3"></div>
              </div>
            </div>
            <div className="h-16 bg-poe-yellow border-4 border-poe-black rounded-xl"></div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-poe-yellow border-4 border-poe-black rounded-2xl cartoon-shadow rotate-12 animate-bounce m-2"></div>
        <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-poe-pink border-4 border-poe-black rounded-full cartoon-shadow animate-pulse m-2"></div>
      </div>
    </div>
  );
}
