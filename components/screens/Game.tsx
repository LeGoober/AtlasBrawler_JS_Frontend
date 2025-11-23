import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Zap, Radio } from 'lucide-react';
import { ScreenContainer } from '../Shared';
import { ASSETS } from '../../constants';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(120);
  const [speed, setSpeed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Animation loops
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 0) {
            setIsPaused(true);
            return 0;
        }
        return t - 1;
      });
      setScore((s) => s + Math.floor(speed * 0.1));
      setSpeed(s => Math.max(0, s - 0.5)); // Friction
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPaused, speed]);

  const handlePush = () => {
    setSpeed(prev => Math.min(prev + 15, 100));
  };

  const cityPos = useRef(0);
  const streetPos = useRef(0);
  const requestRef = useRef<number>(0);

  const animate = () => {
    if (!isPaused) {
        // Parallax calculations
        // City moves slower (0.05 factor)
        cityPos.current -= (speed * 0.05);
        // Street moves faster (0.2 factor)
        streetPos.current -= (speed * 0.2);

        const cityEl = document.getElementById('city-layer');
        const streetEl = document.getElementById('street-layer');
        
        if (cityEl) cityEl.style.backgroundPositionX = `${cityPos.current}px`;
        if (streetEl) streetEl.style.backgroundPositionX = `${streetPos.current}px`;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [speed, isPaused]);

  return (
    <ScreenContainer className="overflow-hidden bg-[#87CEEB]">
      {/* In-Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 p-2 flex justify-between items-start">
        <div className="bg-celo-yellow border-2 border-black p-1 px-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
            <span className="font-retro font-bold text-black text-xl">SCORE: {Math.floor(score).toString().padStart(6, '0')}</span>
        </div>
        <button 
            onClick={() => setIsPaused(!isPaused)}
            className="bg-white border-2 border-black p-2 active:scale-95"
        >
            <Pause size={20} className="text-black" />
        </button>
      </div>
      
      {/* Timer Overlay */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20">
         <span className={`font-retro text-4xl drop-shadow-[2px_2px_0px_black] ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timer}s
         </span>
      </div>

      {/* Pause Menu Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
             <h2 className="font-retro text-4xl text-celo-yellow mb-8">PAUSED</h2>
             <button onClick={() => setIsPaused(false)} className="w-full max-w-xs bg-white text-black font-retro text-xl py-3 border-4 border-black mb-4 hover:bg-gray-200 uppercase">Resume</button>
             <button onClick={() => navigate('/')} className="w-full max-w-xs bg-red-500 text-white font-retro text-xl py-3 border-4 border-black hover:bg-red-600 uppercase">Quit</button>
        </div>
      )}

      {/* --- PARALLAX BACKGROUND LAYERS --- */}
      
      {/* Layer 1: Sky (Static or very slow gradient) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F7FA]"></div>

      {/* Layer 2: City Buildings (Mid-speed) */}
      <div 
        id="city-layer"
        className="absolute inset-0 z-10 bg-repeat-x"
        style={{
            backgroundImage: `url("${ASSETS.GAME_BG_CITY}")`,
            backgroundSize: 'auto 100%',
            backgroundPosition: 'bottom left',
        }}
      ></div>

      {/* Layer 3: Street/Ground (Fast speed) */}
      <div 
        id="street-layer"
        className="absolute bottom-0 left-0 right-0 h-[120px] z-10 border-t-4 border-black"
        style={{ 
             backgroundColor: '#3E3E3E',
             backgroundImage: `
                repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(0,0,0,0.3) 40px, rgba(0,0,0,0.3) 42px),
                repeating-linear-gradient(0deg, transparent 0, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 22px)
             `,
             backgroundSize: '100px 100px' 
        }}
      >
         {/* Street Markings */}
         <div className="w-full h-4 bg-transparent border-b-4 border-dashed border-white/30 absolute top-10"></div>
      </div>


      {/* Player Sprite */}
      <div className="absolute bottom-[80px] left-10 z-20 transition-transform duration-100"
           style={{ transform: `translateY(${speed > 50 ? -10 : 0}px)` }}>
          <div className={`w-24 h-32 bg-celo-yellow border-4 border-black relative ${speed > 0 ? 'animate-bounce-slight' : ''}`}>
             {/* Simple blocky character representation */}
             <div className="absolute top-0 w-full h-8 bg-black/20"></div> {/* Helmet */}
             <div className="absolute top-12 w-full h-4 bg-black"></div> {/* Shirt stripe */}
             <div className="absolute bottom-[-10px] w-32 left-[-4px] h-4 bg-gray-400 border-2 border-black rounded-full"></div> {/* Skateboard */}
          </div>
      </div>

      {/* CONTROLS OVERLAY */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-40 pointer-events-none flex justify-between items-end p-4 pb-8">
        
        {/* Left: Push Slider */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
             <div className="h-32 w-12 bg-gray-700 border-4 border-gray-500 rounded-lg relative overflow-hidden">
                <div 
                    className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-200"
                    style={{ height: `${speed}%` }}
                ></div>
                {/* Visual notches */}
                <div className="absolute inset-0 flex flex-col justify-between p-1">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-full h-1 bg-black/30"></div>)}
                </div>
             </div>
             <button 
                onClick={handlePush}
                className="w-16 h-16 rounded-full bg-gray-200 border-b-8 border-gray-400 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center text-black font-bold font-retro shadow-lg"
             >
                PUSH
             </button>
        </div>

        {/* Right: Action Buttons (Rotated Cluster) */}
        <div className="pointer-events-auto bg-gray-700/80 p-4 rounded-3xl border-4 border-gray-600 transform -rotate-12 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
                <button className="w-14 h-14 rounded-full bg-purple-500 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white font-bold shadow-lg">
                    FS
                </button>
                <button className="w-14 h-14 rounded-full bg-purple-500 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white font-bold shadow-lg">
                    BS
                </button>
                <div className="col-span-2 flex justify-center">
                     <button className="w-16 h-16 rounded-full bg-red-500 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 flex items-center justify-center text-white shadow-lg">
                         <Zap size={24} fill="currentColor" />
                     </button>
                </div>
            </div>
        </div>

      </div>
    </ScreenContainer>
  );
};

export default Game;