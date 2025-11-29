import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Zap } from 'lucide-react';
import { ScreenContainer } from '../Shared';
import { ASSETS } from '../../constants';
import { PixiGame } from '../../src/game/PixiGame';
import { completeGameSession } from '../../src/services/api';
interface GameProps {
  walletAddress: string;
}
const Game: React.FC<GameProps> = ({ walletAddress }) => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [waves, setWaves] = useState(0);
  const [pushStrength, setPushStrength] = useState(0);
  const handleGameOver = async (finalScore: number, wavesSurvived: number) => {
    setIsGameOver(true);
    setIsPaused(true);
    try {
      await completeGameSession({
        walletAddress,
        score: finalScore,
        wavesSurvived,
        isWin: wavesSurvived >= 10,
      });
      console.log('Game session completed successfully');
    } catch (err) {
      console.error('Failed to save game session:', err);
    }
  };
  const handlePush = () => {
    setPushStrength((prev) => Math.min(prev + 20, 100));
   
    setTimeout(() => {
      setPushStrength((prev) => Math.max(0, prev - 10));
    }, 500);
  };
  const handleTrick = (trick: 'frontside' | 'backside') => {
    console.log(`Trick performed: ${trick}`);
    setScore((s) => s + 25);
    if (trick === 'frontside' && (window as any).pixiPerformFrontside) {
      (window as any).pixiPerformFrontside();
    } else if (trick === 'backside' && (window as any).pixiPerformBackside) {
      (window as any).pixiPerformBackside();
    }
  };
  const handlePunch = () => {
    console.log('Punch action!');
    if ((window as any).pixiPerformPunch) {
      (window as any).pixiPerformPunch();
    }
  };

  const numBars = Math.floor(pushStrength / 20);

  return (
    <ScreenContainer className="overflow-hidden bg-[#87CEEB]">
      {/* PixiJS Game Canvas */}
      <PixiGame
        onScoreUpdate={setScore}
        onTimeUpdate={setTimer}
        onGameOver={handleGameOver}
        isPaused={isPaused}
        pushStrength={pushStrength}
        onTrickPressed={handleTrick}
        onPunchPressed={handlePunch}
      />
      {/* In-Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 p-2 flex justify-between items-start pointer-events-none">
        <div className="bg-celo-yellow border-2 border-black p-1 px-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <span className="font-retro font-bold text-black text-xl">
            SCORE: {Math.floor(score).toString().padStart(6, '0')}
          </span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="bg-white border-2 border-black p-2 active:scale-95 pointer-events-auto"
        >
          <Pause size={20} className="text-black" />
        </button>
      </div>
      {/* Timer Overlay */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <span
          className={`font-retro text-4xl drop-shadow-[2px_2px_0px_black] ${
            timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'
          }`}
        >
          {timer}s
        </span>
      </div>
      {/* Waves Counter */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-purple-600 border-2 border-black px-4 py-1 shadow-lg">
          <span className="font-retro text-white text-sm">WAVE {waves}</span>
        </div>
      </div>
      {/* Pause Menu Overlay */}
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 backdrop-blur-sm pointer-events-auto">
          <h2 className="font-retro text-4xl text-celo-yellow mb-8">PAUSED</h2>
          <button
            onClick={() => setIsPaused(false)}
            className="w-full max-w-xs bg-white text-black font-retro text-xl py-3 border-4 border-black mb-4 hover:bg-gray-200 uppercase"
          >
            Resume
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs bg-red-500 text-white font-retro text-xl py-3 border-4 border-black hover:bg-red-600 uppercase"
          >
            Quit
          </button>
        </div>
      )}
      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm pointer-events-auto">
          <h2 className="font-retro text-5xl text-celo-yellow mb-4">GAME OVER</h2>
          <div className="bg-white/10 border-4 border-celo-yellow p-6 mb-8 rounded-lg">
            <p className="font-retro text-white text-2xl mb-2">
              FINAL SCORE: {Math.floor(score).toString().padStart(6, '0')}
            </p>
            <p className="font-retro text-white text-xl">WAVES SURVIVED: {waves}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs bg-celo-yellow text-black font-retro text-xl py-3 border-4 border-black hover:bg-yellow-400 uppercase shadow-lg"
          >
            Back to Home
          </button>
        </div>
      )}
      {/* CONTROLS OVERLAY */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-40 flex justify-between items-end p-4 pb-8">
        {/* Left: Push Controller */}
        <div className="flex flex-col items-center gap-2">
          <button onClick={handlePush} className="relative w-32 h-36">
            <img src={ASSETS.PUSH_CONTROLLER_BARE_LONG} alt="Push controller" className="w-full h-full object-contain pointer-events-none select-none" />
           
            {/* Stacked strength indicator bars overlayed */}
            <div className="absolute left-[19%] top-[33%] bottom-6 w-4 h-4 flex flex-col-reverse items-center pointer-events-none transition-all duration-200">
              {[...Array(numBars)].map((_, i) => (
                <img key={i} src={ASSETS.PUSH_STRENGTH_INDICATOR} alt="Strength bar" className="w-full" />
              ))}
            </div>
          </button>
        </div>
        {/* Right: Action Buttons */}
        <div className="relative w-48 h-48 bg-gray-700/80 p-4 rounded-3xl border-4 border-gray-600 transform -rotate-12 shadow-xl backdrop-blur-sm">
          {/* Skate controller background (decorative) */}
          <img src={ASSETS.SKATE_CONTROLLER} alt="Skate controller background" className="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none select-none -z-10" />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handlePunch} className="left-0 right-0 top-[50%] w-12 h-12 rounded-full p-0 border-0 bg-transparent transform translate-y-3">
              <img src={ASSETS.BTN_ACTION} alt="Action" className="w-full h-full object-contain" />
            </button>
            <button onClick={() => handleTrick('frontside')} className="w-12 h-13 rounded-full p-0 border-0 bg-transparent transform rotate-12 translate-x-2 translate-y-3">
              <img src={ASSETS.BTN_FRONTSIDE} alt="Frontside" className="w-full h-full object-contain" />
            </button>
            <button onClick={() => handleTrick('backside')} className="w-23 h-12 rounded-full p-0 border-0 bg-transparent transform -rotate-12 -translate-x-2 translate-y-9">
              <img src={ASSETS.BTN_BACKSIDE} alt="Backside" className="w-full h-full object-contain" />
            </button>
            <img src={ASSETS.JOYSTICK} alt="Joystick" className="top-10 w-13 h-13 object-contain pointer-events-none select-none justify-self-end translate-x-3 translate-y-6" />
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
export default Game;