import React from 'react';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  narrative: string;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ speaker, text, narrative }) => {
  const isNarrator = speaker === 'Narrator';

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto mt-[-20px] z-20 relative px-4">
      
      {/* Narrative Box (Yellow Rectangle) */}
      {narrative && (
        <div className="bg-yellow-100 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-4">
          <p className="font-bold text-black uppercase tracking-wide text-sm md:text-base">
            {narrative}
          </p>
        </div>
      )}

      {/* Dialogue Bubble */}
      {!isNarrator && text && (
        <div className="flex flex-col items-start">
           {/* Name Tag */}
           <div className="bg-red-600 text-white border-2 border-black px-3 py-1 transform -skew-x-12 translate-x-4 translate-y-2 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
              <span className="font-black uppercase tracking-wider transform skew-x-12 inline-block text-sm">
                {speaker}
              </span>
           </div>
           
           {/* Bubble */}
           <div className="bg-white border-4 border-black rounded-[2rem] rounded-tl-none p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] relative min-w-[60%]">
              <p className="text-lg md:text-xl font-medium leading-relaxed font-comic text-gray-900">
                {text}
              </p>
              {/* Bubble Tail */}
              <div className="absolute -top-[18px] left-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-black border-r-[0px] border-r-transparent"></div>
              <div className="absolute -top-[12px] left-[4px] w-0 h-0 border-l-[14px] border-l-transparent border-b-[16px] border-b-white border-r-[0px] border-r-transparent"></div>
           </div>
        </div>
      )}
    </div>
  );
};
