import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Trophy, TrendingUp } from 'lucide-react';
import { ScreenContainer } from '../Shared';
import { ASSETS, OBSTACLES } from '../../src/constants';
import { completeGameSession, getPlayerBalance } from '../../src/services/api';

interface GameProps {
  walletAddress: string;
}

const Game: React.FC<GameProps> = ({ walletAddress }) => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [waves, setWaves] = useState(0);
  const [pushStrength, setPushStrength] = useState(0);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [playerVerticalOffset, setPlayerVerticalOffset] = useState(0); // 0 to 110 (joystick control)
  const [playerHorizontalOffset, setPlayerHorizontalOffset] = useState(0);
  const [isPerformingTrick, setIsPerformingTrick] = useState(false);
  const [playerBalance, setPlayerBalance] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  // Physics state
  const [verticalVelocity, setVerticalVelocity] = useState(0);
  const [isOnObstacle, setIsOnObstacle] = useState(false);
  const [obstacleBonus, setObstacleBonus] = useState(0);
  
  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const scrollSoundRef = useRef<HTMLAudioElement | null>(null);
  const trickSoundRef = useRef<HTMLAudioElement | null>(null);
  const punchSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    backgroundMusicRef.current = new Audio(ASSETS.GAME_AUDIO.BACKGROUND_MUSIC);
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.5;

    scrollSoundRef.current = new Audio(ASSETS.GAME_AUDIO.SCROLL_MOVEMENT);
    scrollSoundRef.current.loop = true;
    scrollSoundRef.current.volume = 0.3;

    trickSoundRef.current = new Audio(ASSETS.CHARACTER_AUDIO.TRICK_SOUND);
    trickSoundRef.current.volume = 0.6;

    punchSoundRef.current = new Audio(ASSETS.CHARACTER_AUDIO.PUNCH_ACTION);
    punchSoundRef.current.volume = 0.6;

    return () => {
      backgroundMusicRef.current?.pause();
      scrollSoundRef.current?.pause();
      trickSoundRef.current?.pause();
      punchSoundRef.current?.pause();
    };
  }, []);

  // Start background music when game starts
  useEffect(() => {
    if (!isPaused && !isGameOver && backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(err => console.log('Audio play failed:', err));
    } else if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, [isPaused, isGameOver]);

  // Handle scroll sound based on pushStrength
  useEffect(() => {
    if (!scrollSoundRef.current) return;

    if (pushStrength > 5 && !isPaused && !isGameOver) {
      if (scrollSoundRef.current.paused) {
        scrollSoundRef.current.play().catch(err => console.log('Scroll audio play failed:', err));
      }
    } else {
      scrollSoundRef.current.pause();
      scrollSoundRef.current.currentTime = 0;
    }
  }, [pushStrength, isPaused, isGameOver]);
  
  // Fetch player balance on mount
  useEffect(() => {
    if (walletAddress) {
      getPlayerBalance(walletAddress)
        .then((player) => {
          if (player) {
            setPlayerBalance(player.softTokenBalance || 0);
            setTotalWins(player.totalWins || 0);
            setTotalGames(player.totalGamesPlayed || 0);
          }
        })
        .catch((err) => console.log('Failed to fetch balance:', err));
    }
  }, [walletAddress]);

  const handleGameOver = async (finalScore: number, wavesSurvived: number) => {
    setIsGameOver(true);
    setIsPaused(true);
    
    try {
      const result = await completeGameSession({
        walletAddress,
        score: finalScore,
        wavesSurvived,
        isWin: wavesSurvived >= 10,
      });
      console.log('Game session completed successfully:', result);
      
      // Fetch updated balance
      const updatedPlayer = await getPlayerBalance(walletAddress);
      if (updatedPlayer) {
        setPlayerBalance(updatedPlayer.softTokenBalance || 0);
        setTotalWins(updatedPlayer.totalWins || 0);
        setTotalGames(updatedPlayer.totalGamesPlayed || 0);
      }
      
      // Show results modal after a delay
      setTimeout(() => {
        setShowResultsModal(true);
      }, 1500);
    } catch (err) {
      console.error('Failed to save game session:', err);
      // Still show results modal
      setTimeout(() => {
        setShowResultsModal(true);
      }, 1500);
    }
  };

  // Swipe-down gesture tracking
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pushControllerRef = useRef<HTMLDivElement>(null);
  const decayTimerRef = useRef<number | null>(null);
  const isMouseDownRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - swipeStartRef.current.y;
    
    if (deltaY > 0) {
      const strength = Math.min((deltaY / 150) * 100, 100);
      setPushStrength(strength);
    }
  };

  const handleTouchEnd = () => {
    swipeStartRef.current = null;
    
    if (decayTimerRef.current) {
      clearInterval(decayTimerRef.current);
    }
    
    decayTimerRef.current = window.setInterval(() => {
      setPushStrength((prev) => {
        const newStrength = Math.max(0, prev - 2);
        if (newStrength === 0 && decayTimerRef.current) {
          clearInterval(decayTimerRef.current);
          decayTimerRef.current = null;
        }
        return newStrength;
      });
    }, 50);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    swipeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !swipeStartRef.current) return;
    
    const deltaY = e.clientY - swipeStartRef.current.y;
    
    if (deltaY > 0) {
      const strength = Math.min((deltaY / 150) * 100, 100);
      setPushStrength(strength);
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    handleTouchEnd();
  };

  // Timer and score updates
  useEffect(() => {
    if (isPaused || isGameOver) return;
    
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          handleGameOver(score, waves);
          return 0;
        }
        return t - 1;
      });
      setScore((s) => s + Math.floor(pushStrength * 0.1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, pushStrength, score, waves]);

  // Cleanup decay timer
  useEffect(() => {
    return () => {
      if (decayTimerRef.current) {
        clearInterval(decayTimerRef.current);
      }
    };
  }, []);

  // Trick handlers
  const performFrontside = () => {
    if (isPerformingTrick) return;
    setIsPerformingTrick(true);
    
    // Add points for trick (bonus if on obstacle)
    const basePoints = 50;
    const bonusPoints = isOnObstacle ? 50 : 0;
    setScore(prev => prev + basePoints + bonusPoints);
    setWaves(prev => prev + 1);
    
    // Play trick sound
    if (trickSoundRef.current) {
      trickSoundRef.current.currentTime = 0;
      trickSoundRef.current.play().catch(err => console.log('Trick audio failed:', err));
    }
    
    // 20% tilt left + vertical jump
    setPlayerRotation(-7); // -7 degrees (20% tilt left)
    
    setTimeout(() => {
      setPlayerRotation(0);
      setIsPerformingTrick(false);
    }, 400);
  };

  const performBackside = () => {
    if (isPerformingTrick) return;
    setIsPerformingTrick(true);
    
    // Add points for trick (bonus if on obstacle)
    const basePoints = 50;
    const bonusPoints = isOnObstacle ? 50 : 0;
    setScore(prev => prev + basePoints + bonusPoints);
    setWaves(prev => prev + 1);
    
    // Play trick sound
    if (trickSoundRef.current) {
      trickSoundRef.current.currentTime = 0;
      trickSoundRef.current.play().catch(err => console.log('Trick audio failed:', err));
    }
    
    // 20% tilt right + vertical jump
    setPlayerRotation(7); // 7 degrees (20% tilt right)
    
    setTimeout(() => {
      setPlayerRotation(0);
      setIsPerformingTrick(false);
    }, 400);
  };

  const performPunch = () => {
    if (isPerformingTrick) return;
    setIsPerformingTrick(true);
    
    // Add points for punch
    setScore(prev => prev + 25);
    
    // Play punch sound
    if (punchSoundRef.current) {
      punchSoundRef.current.currentTime = 0;
      punchSoundRef.current.play().catch(err => console.log('Punch audio failed:', err));
    }
    
    // Forward dash
    setPlayerHorizontalOffset(50);
    
    setTimeout(() => {
      setPlayerHorizontalOffset(0);
      setIsPerformingTrick(false);
    }, 300);
  };

  // Joystick control
  const joystickStartRef = useRef<{ x: number; y: number } | null>(null);
  const joystickRef = useRef<HTMLDivElement>(null);

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    const pos = 'touches' in e ? 
      { x: e.touches[0].clientX, y: e.touches[0].clientY } : 
      { x: e.clientX, y: e.clientY };
    joystickStartRef.current = pos;
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickStartRef.current) return;
    
    const pos = 'touches' in e ? 
      { x: e.touches[0].clientX, y: e.touches[0].clientY } : 
      { x: e.clientX, y: e.clientY };
    
    // Calculate vertical delta (negative = up, positive = down)
    const deltaY = pos.y - joystickStartRef.current.y;
    
    // Map deltaY (-30 to +30) to playerVerticalOffset (60 to 0)
    // Up = higher offset (moves sprite up), Down = lower offset (moves sprite down)
    // Reduced range so sprite doesn't move too high
    const offset = Math.max(0, Math.min(60, 30 - deltaY));
    setPlayerVerticalOffset(offset);
  };

  const handleJoystickEnd = () => {
    joystickStartRef.current = null;
    // Optionally reset to center position
    setPlayerVerticalOffset(0);
  };

  // Parallax animation with collision detection
  const cityPos = useRef(0);
  const streetPos = useRef(0);
  const requestRef = useRef<number>(0);
  const playerPhysicsY = useRef(0);

  const animate = () => {
    if (!isPaused && !isGameOver) {
      cityPos.current -= (pushStrength * 0.05);
      streetPos.current -= (pushStrength * 0.2);

      const cityEl = document.getElementById('city-layer');
      const streetEl = document.getElementById('street-layer');
      
      if (cityEl) cityEl.style.backgroundPositionX = `${cityPos.current}px`;
      if (streetEl) streetEl.style.backgroundPositionX = `${streetPos.current}px`;

      // Collision detection with obstacles
      const playerX = 50; // Player's fixed left position
      const playerBottomY = window.innerHeight - 140 - playerVerticalOffset;
      const playerWidth = 120 * 1.3; // Scaled player width
      const playerHeight = 120 * 1.3;
      
      // Calculate scroll offset for obstacles (repeating pattern every 800px)
      const scrollOffset = Math.abs(cityPos.current);
      let hitObstacle = false;
      let currentLift = 0;

      // Check ramps (use city scroll speed since ramps are on ground)
      OBSTACLES.RAMPS.forEach(ramp => {
        // Ramps repeat every 800px
        const repeats = Math.floor(scrollOffset / 800);
        const effectiveX = ramp.x + (repeats * 800) - scrollOffset;
        
        // Check if player is over this ramp
        if (effectiveX < playerX + playerWidth && effectiveX + ramp.width > playerX) {
          const rampScreenY = window.innerHeight - (600 - ramp.baseY);
          if (playerBottomY > rampScreenY - ramp.height && playerBottomY < rampScreenY + 20) {
            hitObstacle = true;
            currentLift = ramp.lift;
            if (!isOnObstacle) {
              setObstacleBonus(prev => prev + 10);
              setScore(prev => prev + 10);
            }
          }
        }
      });

      // Check rails
      OBSTACLES.RAILS.forEach(rail => {
        const repeats = Math.floor(scrollOffset / 800);
        const effectiveX = rail.x + (repeats * 800) - scrollOffset;
        
        if (effectiveX < playerX + playerWidth && effectiveX + rail.width > playerX) {
          const railScreenY = window.innerHeight - (600 - rail.y);
          if (Math.abs(playerBottomY - railScreenY) < 15) {
            hitObstacle = true;
            currentLift = rail.lift;
            if (!isOnObstacle) {
              setObstacleBonus(prev => prev + 15);
              setScore(prev => prev + 15);
            }
          }
        }
      });

      setIsOnObstacle(hitObstacle);

      // Apply physics
      if (hitObstacle && pushStrength > 10) {
        // Lift player when on obstacle
        playerPhysicsY.current = Math.max(playerPhysicsY.current, currentLift);
      } else {
        // Gravity pulls down
        playerPhysicsY.current = Math.max(0, playerPhysicsY.current - 2);
      }

      setVerticalVelocity(playerPhysicsY.current);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [pushStrength, isPaused, isGameOver, playerVerticalOffset, isOnObstacle]);

  const numBars = Math.floor(pushStrength / 20);

  return (
    <ScreenContainer className="overflow-hidden bg-[#87CEEB]">
      {/* In-Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 p-2 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="bg-celo-yellow border-2 border-black p-1 px-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
            <span className="font-retro font-bold text-black text-xl">
              SCORE: {Math.floor(score).toString().padStart(6, '0')}
            </span>
          </div>
          <div className="bg-green-500 border-2 border-black p-1 px-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-retro font-bold text-white text-sm">
              💰 {playerBalance} TOKENS
            </span>
          </div>
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

      {/* Obstacle Indicator */}
      {isOnObstacle && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-celo-yellow border-2 border-black px-4 py-1 shadow-lg animate-pulse">
            <span className="font-retro text-black text-sm">🛹 ON OBSTACLE! +BONUS</span>
          </div>
        </div>
      )}

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
      {isGameOver && !showResultsModal && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm pointer-events-auto">
          <h2 className="font-retro text-5xl text-celo-yellow mb-4">GAME OVER</h2>
          <div className="bg-white/10 border-4 border-celo-yellow p-6 mb-8 rounded-lg">
            <p className="font-retro text-white text-2xl mb-2">
              FINAL SCORE: {Math.floor(score).toString().padStart(6, '0')}
            </p>
            <p className="font-retro text-white text-xl">WAVES SURVIVED: {waves}</p>
          </div>
          <div className="font-retro text-white text-sm animate-pulse">
            Saving game...
          </div>
        </div>
      )}

      {/* Game Results Modal */}
      {showResultsModal && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-sm pointer-events-auto">
          <Trophy size={80} className="text-celo-yellow mb-4 animate-bounce" />
          <h2 className="font-retro text-5xl text-celo-yellow mb-8">
            {waves >= 10 ? 'VICTORY!' : 'GAME COMPLETE'}
          </h2>
          
          <div className="bg-white/10 border-4 border-celo-yellow p-8 mb-6 rounded-lg max-w-md w-full">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="font-retro text-gray-400 text-sm mb-1">SCORE</p>
                <p className="font-retro text-white text-3xl">{Math.floor(score)}</p>
              </div>
              <div className="text-center">
                <p className="font-retro text-gray-400 text-sm mb-1">WAVES</p>
                <p className="font-retro text-white text-3xl">{waves}</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-600 pt-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-retro text-gray-300 text-sm">TOKEN BALANCE</span>
                <span className="font-retro text-green-400 text-xl">💰 {playerBalance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-retro text-gray-300 text-sm">WIN RATE</span>
                <span className="font-retro text-blue-400 text-lg">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="bg-celo-yellow/20 border-2 border-celo-yellow p-3 rounded text-center">
              <p className="font-retro text-celo-yellow text-xs">
                +{Math.floor(score / 10)} TOKENS EARNED
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-md">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-white text-black font-retro text-lg py-3 border-4 border-black hover:bg-gray-200 uppercase shadow-lg"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-celo-yellow text-black font-retro text-lg py-3 border-4 border-black hover:bg-yellow-400 uppercase shadow-lg"
            >
              Home
            </button>
          </div>
        </div>
      )}

      {/* --- PARALLAX BACKGROUND LAYERS --- */}
      
      {/* Layer 1: Sky */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F7FA]"></div>

      {/* Layer 2: City Buildings */}
      <div 
        id="city-layer"
        className="absolute inset-0 z-10 bg-repeat-x"
        style={{
          backgroundImage: `url("${ASSETS.GAME_BG_CITY}")`,
          backgroundSize: 'auto 100%',
          backgroundPosition: 'bottom left',
        }}
      ></div>

      {/* Layer 3: Street/Ground */}
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
        <div className="w-full h-4 bg-transparent border-b-4 border-dashed border-white/30 absolute top-10"></div>
      </div>

      {/* Player Sprite */}
      <div 
        className="absolute bottom-[1px] left-[1px] z-20 transition-all duration-100"
        style={{ 
          transform: `
            translateX(${playerHorizontalOffset}px) 
            translateY(${-playerVerticalOffset - verticalVelocity + (isPerformingTrick && playerRotation !== 0 ? -5 : 0)}px) 
            rotate(${playerRotation}deg) 
            scale(1.3)
          `
        }}
      >
        <img 
          src={ASSETS.PLAYER_SPRITE} 
          alt="Player" 
          className="h-auto"
          style={{ 
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
            width: 'auto',
            maxHeight: '280px'
          }}
        />
      </div>

      {/* CONTROLS OVERLAY */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-40 flex justify-between items-end p-4 pb-8">
        {/* Left: Push Controller - Swipe Down Area */}
        <div className="flex flex-col items-center gap-2">
          <div 
            ref={pushControllerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-32 h-36 cursor-pointer touch-none active:scale-95 transition-transform select-none"
          >
            <img src={ASSETS.PUSH_CONTROLLER_BARE_LONG} alt="Push controller" className="w-full h-full object-contain pointer-events-none select-none" />
           
            {/* Stacked strength indicator bars overlayed */}
            <div className="absolute left-[17%] top-[33%] bottom-6 w-4 h-4 flex flex-col-reverse items-center pointer-events-none transition-all duration-200">
              {[...Array(numBars)].map((_, i) => (
                <img key={i} src={ASSETS.PUSH_STRENGTH_INDICATOR} alt="Strength bar" className="w-full" />
              ))}
            </div>
            
            {/* Visual feedback overlay */}
            <div 
              className="absolute inset-0 bg-celo-yellow/20 rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none"
              style={{ opacity: pushStrength > 0 ? 0.3 : 0 }}
            />
          </div>
          
          {/* Swipe instruction hint */}
          {pushStrength === 0 && (
            <div className="text-white text-xs font-retro animate-pulse bg-black/50 px-2 py-1 rounded">
              Swipe Down
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="relative w-48 h-48 bg-gray-700/80 p-4 rounded-3xl border-4 border-gray-600 transform -rotate-12 shadow-xl backdrop-blur-sm">
          <img src={ASSETS.SKATE_CONTROLLER} alt="Skate controller background" className="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none select-none -z-10" />
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={performPunch}
              className="left-0 right-0 top-[50%] w-12 h-12 rounded-full p-0 border-0 bg-transparent transform translate-y-3 active:scale-90"
            >
              <img src={ASSETS.BTN_ACTION} alt="Action" className="w-full h-full object-contain" />
            </button>
            <button 
              onClick={performFrontside}
              className="w-12 h-13 rounded-full p-0 border-0 bg-transparent transform rotate-12 translate-x-2 translate-y-3 active:scale-90"
            >
              <img src={ASSETS.BTN_FRONTSIDE} alt="Frontside" className="w-full h-full object-contain" />
            </button>
            <button 
              onClick={performBackside}
              className="w-23 h-12 rounded-full p-0 border-0 bg-transparent transform -rotate-12 -translate-x-1 translate-y-9 active:scale-90"
            >
              <img src={ASSETS.BTN_BACKSIDE} alt="Backside" className="w-full h-full object-contain" />
            </button>
            <div 
              ref={joystickRef}
              onTouchStart={handleJoystickStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickEnd}
              onMouseDown={handleJoystickStart}
              onMouseMove={(e) => {
                if (joystickStartRef.current) handleJoystickMove(e);
              }}
              onMouseUp={handleJoystickEnd}
              onMouseLeave={handleJoystickEnd}
              className="top-10 w-13 h-13 justify-self-end translate-x-1 translate-y-6 cursor-pointer active:scale-90"
            >
              <img src={ASSETS.JOYSTICK} alt="Joystick" className="w-full h-full object-contain select-none pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default Game;
