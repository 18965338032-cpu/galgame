import React from 'react';
import { Choice } from '../types';

interface ControlsProps {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ choices, onChoose, disabled }) => {
  const getBgColor = (type: Choice['actionType']) => {
    switch(type) {
      case 'romantic': return 'bg-pink-400 hover:bg-pink-300';
      case 'aggressive': return 'bg-red-500 hover:bg-red-400';
      case 'funny': return 'bg-green-400 hover:bg-green-300';
      default: return 'bg-cyan-400 hover:bg-cyan-300';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 w-full max-w-2xl mx-auto mt-6 px-4 pb-8">
      {choices.map((choice, idx) => (
        <button
          key={choice.id || idx}
          onClick={() => onChoose(choice)}
          disabled={disabled}
          className={`
            relative group border-4 border-black p-4 text-left transition-all duration-150
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            active:shadow-none active:translate-x-1 active:translate-y-1
            disabled:opacity-50 disabled:cursor-not-allowed
            ${getBgColor(choice.actionType)}
            ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}
          `}
        >
          <div className="flex items-center justify-between">
             <span className="font-bold text-black text-lg md:text-xl uppercase tracking-tight group-hover:scale-[1.01] transition-transform">
               {choice.text}
             </span>
             <span className="bg-white border-2 border-black rounded-full w-8 h-8 flex items-center justify-center font-black text-xs">
               {idx + 1}
             </span>
          </div>
        </button>
      ))}
    </div>
  );
};
