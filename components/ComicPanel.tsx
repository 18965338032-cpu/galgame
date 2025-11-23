import React from 'react';

interface ComicPanelProps {
  imageUrl: string | null;
  isLoading: boolean;
  soundEffect?: string;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ imageUrl, isLoading, soundEffect }) => {
  return (
    <div className="relative w-full aspect-[4/3] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden group">
      {/* Loading State: Ben-Day dots animation */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-yellow-200">
          <div className="absolute inset-0 opacity-20 halftone-dots animate-pulse"></div>
          <div className="text-4xl font-black text-black -rotate-2 tracking-widest bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            DRAWING...
          </div>
        </div>
      )}

      {/* Image Display */}
      {imageUrl && !isLoading && (
        <img 
          src={imageUrl} 
          alt="Scene" 
          className="w-full h-full object-cover object-center transition-transform duration-[10s] ease-linear group-hover:scale-110"
        />
      )}

      {/* Placeholder for null state (initial) */}
      {!imageUrl && !isLoading && (
        <div className="w-full h-full flex items-center justify-center bg-blue-500 halftone-dots">
          <span className="text-white font-bold text-xl">Waiting for signal...</span>
        </div>
      )}

      {/* Comic Frame Border Effect (Inner Inset) */}
      <div className="absolute inset-0 border-[12px] border-white opacity-0 pointer-events-none"></div>

      {/* Dynamic Sound Effect Overlay */}
      {soundEffect && !isLoading && (
        <div className="absolute top-4 right-4 transform rotate-12 animate-bounce z-20 pointer-events-none">
          <div className="relative">
             <span className="absolute inset-0 text-red-500 font-black text-6xl select-none stroke-black" 
                   style={{WebkitTextStroke: '2px black'}}>
                {soundEffect}
             </span>
             <span className="relative text-yellow-400 font-black text-6xl select-none"
                   style={{WebkitTextStroke: '2px black', textShadow: '4px 4px 0 #000'}}>
                {soundEffect}
             </span>
          </div>
        </div>
      )}
    </div>
  );
};
