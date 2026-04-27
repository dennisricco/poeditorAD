export default function TestFlagsPage() {
  return (
    <div className="min-h-screen bg-poe-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Flag Icons Test</h1>
        
        {/* Test 1: Direct flag-icons classes */}
        <div className="bg-white border-4 border-poe-black rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-black mb-4">Test 1: Direct Classes</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="text-center">
              <span 
                className="fi fi-us" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">US</p>
            </div>
            <div className="text-center">
              <span 
                className="fi fi-id" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">ID</p>
            </div>
            <div className="text-center">
              <span 
                className="fi fi-gb" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">GB</p>
            </div>
            <div className="text-center">
              <span 
                className="fi fi-jp" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">JP</p>
            </div>
            <div className="text-center">
              <span 
                className="fi fi-cn" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">CN</p>
            </div>
            <div className="text-center">
              <span 
                className="fi fi-fr" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">FR</p>
            </div>
            <div className="text-center">
              <span 
                className="fi fi-de" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">DE</p>
            </div>
            <div className="text-center">
              <span 
                className="fi fi-es" 
                style={{ width: '48px', height: '36px', display: 'inline-block' }}
              />
              <p className="text-sm font-bold mt-2">ES</p>
            </div>
          </div>
        </div>

        {/* Test 2: With 3D styling */}
        <div className="bg-white border-4 border-poe-black rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-black mb-4">Test 2: With 3D Styling</h2>
          <div className="flex gap-4 flex-wrap">
            {['us', 'id', 'gb', 'jp', 'cn', 'fr', 'de', 'es'].map((code) => (
              <div 
                key={code}
                className="w-16 h-16 bg-white border-4 border-poe-black rounded-2xl cartoon-shadow flex items-center justify-center transform rotate-3 hover:rotate-6 transition-all"
              >
                <span 
                  className={`fi fi-${code}`}
                  style={{ width: '48px', height: '36px', display: 'inline-block' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-poe-yellow border-4 border-poe-black rounded-2xl p-6">
          <h2 className="text-2xl font-black mb-4">Instructions</h2>
          <ul className="space-y-2 font-bold">
            <li>✅ If you see flags above, flag-icons is working!</li>
            <li>❌ If you see empty boxes, check:</li>
            <ul className="ml-6 space-y-1">
              <li>1. CSS is loaded (check Network tab in DevTools)</li>
              <li>2. Restart development server</li>
              <li>3. Clear browser cache (Ctrl+Shift+R)</li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
}
