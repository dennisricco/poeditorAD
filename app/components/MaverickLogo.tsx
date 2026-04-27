'use client';

interface MaverickLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function MaverickLogo({ size = 'md', showText = true }: MaverickLogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} aspect-square bg-gradient-to-br from-poe-yellow via-poe-pink to-poe-blue border-4 border-poe-black rounded-2xl cartoon-shadow flex items-center justify-center relative overflow-hidden group hover:-translate-y-1 transition-cartoon`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Main Logo Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="font-black text-white text-xl sm:text-2xl leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
            M
          </div>
          <div className="font-black text-white text-[8px] sm:text-[10px] leading-none drop-shadow-[1px_1px_0px_rgba(0,0,0,0.3)]">
            AD
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black text-poe-black ${textSizeClasses[size]} tracking-tight`}>
            Maverick
          </span>
          <span className={`font-bold text-gray-600 ${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} tracking-wide`}>
            AD TEAM
          </span>
        </div>
      )}
    </div>
  );
}
