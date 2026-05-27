import { useEffect, useState } from 'react';

interface MobileControlsProps {
  onJump: () => void;
}

export function MobileControls({ onJump }: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  const handleJump = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onJump();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
      <div className="flex justify-between items-end">
        {/* Left side - visual indicator */}
        <div className="pointer-events-none">
          <div className="bg-slate-800 bg-opacity-50 rounded-lg px-4 py-2">
            <p className="text-slate-400 text-xs">TAP TO JUMP</p>
          </div>
        </div>
        
        {/* Jump button */}
        <button
          onTouchStart={handleJump}
          onMouseDown={handleJump}
          className="pointer-events-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-500 active:bg-cyan-400 border-4 border-cyan-300 shadow-lg shadow-cyan-500/50 flex items-center justify-center transition-all active:scale-90"
          style={{ touchAction: 'manipulation' }}
        >
          <svg 
            className="w-10 h-10 sm:w-12 sm:h-12 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 15l7-7 7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}