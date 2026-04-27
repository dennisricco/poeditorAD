export default function CartoonBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient - softer colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
      
      {/* Large decorative shapes - reduced quantity */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-poe-yellow/30 border-4 border-poe-black/20 rounded-3xl rotate-12 opacity-40"></div>
      <div className="absolute bottom-32 right-20 w-40 h-40 bg-poe-blue/30 border-4 border-poe-black/20 rounded-2xl -rotate-6 opacity-40"></div>
      <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-poe-pink/30 border-4 border-poe-black/20 rounded-full opacity-40"></div>
      
      {/* Subtle floating blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-poe-yellow/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-poe-blue/10 rounded-full blur-3xl"></div>
      
      {/* Minimal dots pattern - very subtle */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }}></div>
    </div>
  );
}
