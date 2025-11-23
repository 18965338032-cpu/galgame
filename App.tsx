import React, { useState, useEffect, useCallback } from 'react';
import { startGame, nextTurn, generateComicImage } from './services/geminiService';
import { GameState, GameGenre, Choice, StoryNode } from './types';
import { ComicPanel } from './components/ComicPanel';
import { DialogueBox } from './components/DialogueBox';
import { Controls } from './components/Controls';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    history: [],
    currentTurn: null,
    currentImage: null,
    isLoadingText: false,
    isLoadingImage: false,
    gameStarted: false,
    error: null,
    playerName: '',
    genre: GameGenre.SUPERHERO,
  });

  // Preload images
  const handleImageGeneration = useCallback(async (description: string) => {
    setGameState(prev => ({ ...prev, isLoadingImage: true, currentImage: null }));
    try {
      const imageUrl = await generateComicImage(description);
      setGameState(prev => ({ ...prev, currentImage: imageUrl, isLoadingImage: false }));
    } catch (error) {
      console.error("Failed to generate image", error);
      setGameState(prev => ({ ...prev, isLoadingImage: false }));
    }
  }, []);

  const handleStartGame = async () => {
    if (!gameState.playerName.trim()) return;

    setGameState(prev => ({ ...prev, isLoadingText: true, gameStarted: true, error: null }));

    try {
      const firstTurn = await startGame(gameState.genre, gameState.playerName);
      setGameState(prev => ({ 
        ...prev, 
        currentTurn: firstTurn, 
        history: [firstTurn], 
        isLoadingText: false 
      }));
      
      // Trigger image generation
      handleImageGeneration(firstTurn.visualDescription);

    } catch (error: any) {
      setGameState(prev => ({ 
        ...prev, 
        isLoadingText: false, 
        gameStarted: false, 
        error: "Failed to start game. Ensure API Key is set and valid." 
      }));
    }
  };

  const handleChoice = async (choice: Choice) => {
    if (!gameState.currentTurn) return;

    // Optimistic UI update or just loading state
    setGameState(prev => ({ ...prev, isLoadingText: true, error: null }));

    try {
      // Construct context from history (simplified for token limits)
      const contextSummary = gameState.history.map(h => `Narrator: ${h.narrative}\n${h.speakerName}: ${h.dialogue}`).join('\n');
      
      const nextStoryNode = await nextTurn(contextSummary, choice.text);
      
      setGameState(prev => ({ 
        ...prev, 
        currentTurn: nextStoryNode, 
        history: [...prev.history, nextStoryNode], 
        isLoadingText: false 
      }));

      // Trigger image generation for new scene
      handleImageGeneration(nextStoryNode.visualDescription);

    } catch (error) {
      setGameState(prev => ({ 
        ...prev, 
        isLoadingText: false, 
        error: "Could not load next chapter. Please try again." 
      }));
    }
  };

  // Initial Entry Screen
  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 relative">
          <div className="absolute -top-6 -right-6 bg-yellow-400 border-4 border-black p-3 rotate-12 z-10">
            <span className="font-black text-xl">NEW!</span>
          </div>
          
          <h1 className="text-6xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 stroke-black" style={{ WebkitTextStroke: '2px black' }}>
            COMIC CRUSH
          </h1>
          <p className="text-center font-bold mb-8 text-gray-600">AI-Powered Visual Novel</p>

          <div className="space-y-4">
            <div>
              <label className="block font-bold border-b-2 border-black mb-1 w-max">HERO NAME</label>
              <input 
                type="text" 
                value={gameState.playerName}
                onChange={(e) => setGameState(prev => ({...prev, playerName: e.target.value}))}
                className="w-full border-4 border-black p-2 font-bold text-lg focus:bg-yellow-50 outline-none"
                placeholder="e.g. Captain React"
              />
            </div>

            <div>
              <label className="block font-bold border-b-2 border-black mb-1 w-max">STORY GENRE</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(GameGenre).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGameState(prev => ({...prev, genre: g}))}
                    className={`border-2 border-black p-2 text-sm font-bold transition-all
                      ${gameState.genre === g ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}
                    `}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleStartGame}
              disabled={!gameState.playerName}
              className="w-full bg-blue-500 text-white font-black text-2xl py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              START ADVENTURE
            </button>

            {gameState.error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-sm font-bold">
                {gameState.error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen flex flex-col items-center pt-4 md:pt-8 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="w-full px-4 flex justify-between items-center mb-4">
        <div className="bg-white border-2 border-black px-2 py-1 rotate-[-2deg] shadow-md">
          <span className="font-bold text-sm">ISSUE #1</span>
        </div>
        <div className="bg-yellow-400 border-2 border-black px-4 py-1 rotate-[1deg] shadow-md">
          <span className="font-black text-lg uppercase">{gameState.genre.split(' ')[0]}</span>
        </div>
      </div>

      {/* Main Scene Area */}
      <div className="w-full max-w-2xl px-4 mb-2">
         <ComicPanel 
            imageUrl={gameState.currentImage} 
            isLoading={gameState.isLoadingImage} 
            soundEffect={gameState.currentTurn?.soundEffectText}
         />
      </div>

      {/* Dialogue & Controls Area */}
      {gameState.currentTurn && (
        <div className="w-full flex flex-col items-center animate-fade-in">
          
          {/* Text Box */}
          <DialogueBox 
            speaker={gameState.currentTurn.speakerName}
            text={gameState.currentTurn.dialogue}
            narrative={gameState.currentTurn.narrative}
          />

          {/* Thinking Indicator for Next Text */}
          {gameState.isLoadingText && (
             <div className="mt-4 animate-bounce">
                <span className="bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-bold">
                  Writing next page...
                </span>
             </div>
          )}

          {/* Choice Buttons */}
          {!gameState.isLoadingText && (
            <Controls 
              choices={gameState.currentTurn.choices}
              onChoose={handleChoice}
              disabled={gameState.isLoadingText}
            />
          )}
        </div>
      )}

      {gameState.error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white border-4 border-black p-4 font-bold shadow-lg max-w-xs">
          ERROR: {gameState.error}
          <button onClick={() => setGameState(prev => ({...prev, error: null}))} className="block mt-2 underline text-sm">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default App;