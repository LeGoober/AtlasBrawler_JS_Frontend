import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Trophy, TrendingUp } from 'lucide-react';
import { ScreenContainer } from '../Shared';
import { ASSETS, OBSTACLES, GAME_BACKGROUND_INLINE_SVG } from '../../src/constants';
import { completeGameSession, getPlayerBalance } from '../../src/services/api';
import { getGameSettings } from '../../src/utils/gameSettings';

interface GameProps {
  walletAddress: string;
}

const Game: React.FC<GameProps> = ({ walletAddress }) => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60); // Changed from 120 to 60
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [waves, setWaves] = useState(0);
  const [pushStrength, setPushStrength] = useState(0);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [playerVerticalOffset, setPlayerVerticalOffset] = useState(0);
  const [playerHorizontalOffset, setPlayerHorizontalOffset] = useState(0);
  const [isPerformingTrick, setIsPerformingTrick] = useState(false);
  const [playerBalance, setPlayerBalance] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [verticalVelocity, setVerticalVelocity] = useState(0);
  const [isOnObstacle, setIsOnObstacle] = useState(false);
  const [obstacleBonus, setObstacleBonus] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.5);

  // Add this state for background fallback
  const [backgroundUrl, setBackgroundUrl] = useState(ASSETS.GAME_BACKGROUND_SVG);

  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const scrollSoundRef = useRef<HTMLAudioElement | null>(null);
  const trickSoundRef = useRef<HTMLAudioElement | null>(null);
  const punchSoundRef = useRef<HTMLAudioElement | null>(null);

  // Parallax positions
  const cityPos = useRef(0);
  const streetPos = useRef(0);
  const requestRef = useRef<number>(0);
  const playerPhysicsY = useRef(0);
  
  // Timer ref to track interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings on mount
  useEffect(() => {
    const settings = getGameSettings();
    setAudioEnabled(settings.audioEnabled);
    setAudioVolume(settings.audioVolume);
  }, []);

  // Initialize audio
  useEffect(() => {
    if (!audioEnabled) return;

    backgroundMusicRef.current = new Audio(ASSETS.GAME_AUDIO.BACKGROUND_MUSIC);
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = audioVolume;

    scrollSoundRef.current = new Audio(ASSETS.GAME_AUDIO.SCROLL_MOVEMENT);
    scrollSoundRef.current.loop = true;
    scrollSoundRef.current.volume = audioVolume * 0.6;

    trickSoundRef.current = new Audio(ASSETS.CHARACTER_AUDIO.TRICK_SOUND);
    trickSoundRef.current.volume = audioVolume * 0.6;

    punchSoundRef.current = new Audio(ASSETS.CHARACTER_AUDIO.PUNCH_ACTION);
    punchSoundRef.current.volume = audioVolume * 0.6;

    return () => {
      backgroundMusicRef.current?.pause();
      scrollSoundRef.current?.pause();
      trickSoundRef.current?.pause();
      punchSoundRef.current?.pause();
    };
  }, [audioEnabled, audioVolume]);

  // Test if background SVG loads, fallback to inline if not
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Background SVG loaded successfully');
    };
    img.onerror = () => {
      console.log('External SVG failed to load, using inline fallback');
      setBackgroundUrl(GAME_BACKGROUND_INLINE_SVG);
    };
    img.src = ASSETS.GAME_BACKGROUND_SVG;
  }, []);

  // Start background music when game starts
  useEffect(() => {
    if (!audioEnabled || countdown !== null) return;

    if (!isPaused && !isGameOver && backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(err => console.log('Audio play failed:', err));
    } else if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, [isPaused, isGameOver, audioEnabled, countdown]);

  // Handle scroll sound based on pushStrength
  useEffect(() => {
    if (!scrollSoundRef.current || !audioEnabled || countdown !== null) return;

    if (pushStrength > 5 && !isPaused && !isGameOver) {
      if (scrollSoundRef.current.paused) {
        scrollSoundRef.current.play().catch(err => console.log('Scroll audio play failed:', err));
      }
    } else {
      scrollSoundRef.current.pause();
      scrollSoundRef.current.currentTime = 0;
    }
  }, [pushStrength, isPaused, isGameOver, audioEnabled, countdown]);

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

  // Countdown timer
  useEffect(() => {
    if (countdown !== null) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setCountdown(null);
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Game timer - FIXED: Separated from pushStrength dependency
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Don't start timer if game is paused, over, or countdown is active
    if (isPaused || isGameOver || countdown !== null) return;

    // Start the game timer
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          // Game over when timer reaches 0
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleGameOver(score, waves);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, isGameOver, countdown]); // Removed pushStrength, score, waves from dependencies

  // Score updates based on pushStrength - Separated from timer
  useEffect(() => {
    if (isPaused || isGameOver || countdown !== null) return;

    const scoreInterval = setInterval(() => {
      const pointsPerSecond = Math.floor(pushStrength * 0.15);
      if (pointsPerSecond > 0) {
        setScore(prev => {
          const newScore = prev + pointsPerSecond;
          // Add wave bonus if applicable
          if (pushStrength > 50 && waves > 0) {
            return newScore + Math.floor(waves * 0.5);
          }
          return newScore;
        });
      }
    }, 1000);

    return () => clearInterval(scoreInterval);
  }, [pushStrength, waves, isPaused, isGameOver, countdown]);

  const handleGameOver = async (finalScore: number, wavesSurvived: number) => {
    setIsGameOver(true);
    setIsPaused(true);

    // Clear timer if still running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const result = await completeGameSession({
        walletAddress,
        score: finalScore,
        wavesSurvived,
        isWin: wavesSurvived >= 10,
        timestamp: undefined
      });
      console.log('Game session completed successfully:', result);

      const updatedPlayer = await getPlayerBalance(walletAddress);
      if (updatedPlayer) {
        setPlayerBalance(updatedPlayer.softTokenBalance || 0);
        setTotalWins(updatedPlayer.totalWins || 0);
        setTotalGames(updatedPlayer.totalGamesPlayed || 0);
      }

      setTimeout(() => {
        setShowResultsModal(true);
      }, 1500);
    } catch (err) {
      console.error('Failed to save game session:', err);
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
    if (countdown !== null) return;
    const touch = e.touches[0];
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeStartRef.current || countdown !== null) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - swipeStartRef.current.y;

    if (deltaY > 0) {
      const strength = Math.min((deltaY / 150) * 100, 100);
      setPushStrength(strength);
    }
  };

  const handleTouchEnd = () => {
    if (countdown !== null) return;

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
    if (countdown !== null) return;
    isMouseDownRef.current = true;
    swipeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !swipeStartRef.current || countdown !== null) return;

    const deltaY = e.clientY - swipeStartRef.current.y;

    if (deltaY > 0) {
      const strength = Math.min((deltaY / 150) * 100, 100);
      setPushStrength(strength);
    }
  };

  const handleMouseUp = () => {
    if (countdown !== null) return;
    isMouseDownRef.current = false;
    handleTouchEnd();
  };

  // Bonus points from obstacles
  useEffect(() => {
    if (isOnObstacle && pushStrength > 20 && countdown === null) {
      const bonusInterval = setInterval(() => {
        setScore(prev => prev + 5);
      }, 500);
      return () => clearInterval(bonusInterval);
    }
  }, [isOnObstacle, pushStrength, countdown]);

  // Cleanup decay timer
  useEffect(() => {
    return () => {
      if (decayTimerRef.current) {
        clearInterval(decayTimerRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Trick handlers
  const performFrontside = () => {
    if (isPerformingTrick || countdown !== null) return;
    setIsPerformingTrick(true);

    const basePoints = 50;
    const bonusPoints = isOnObstacle ? 50 : 0;
    setScore(prev => prev + basePoints + bonusPoints);
    setWaves(prev => prev + 1);

    if (trickSoundRef.current && audioEnabled) {
      trickSoundRef.current.currentTime = 0;
      trickSoundRef.current.play().catch(err => console.log('Trick audio failed:', err));
    }

    setPlayerRotation(-7);

    setTimeout(() => {
      setPlayerRotation(0);
      setIsPerformingTrick(false);
    }, 400);
  };

  const performBackside = () => {
    if (isPerformingTrick || countdown !== null) return;
    setIsPerformingTrick(true);

    const basePoints = 50;
    const bonusPoints = isOnObstacle ? 50 : 0;
    setScore(prev => prev + basePoints + bonusPoints);
    setWaves(prev => prev + 1);

    if (trickSoundRef.current && audioEnabled) {
      trickSoundRef.current.currentTime = 0;
      trickSoundRef.current.play().catch(err => console.log('Trick audio failed:', err));
    }

    setPlayerRotation(7);

    setTimeout(() => {
      setPlayerRotation(0);
      setIsPerformingTrick(false);
    }, 400);
  };

  const performPunch = () => {
    if (isPerformingTrick || countdown !== null) return;
    setIsPerformingTrick(true);

    setScore(prev => prev + 25);

    if (punchSoundRef.current && audioEnabled) {
      punchSoundRef.current.currentTime = 0;
      punchSoundRef.current.play().catch(err => console.log('Punch audio failed:', err));
    }

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
    if (countdown !== null) return;
    const pos = 'touches' in e ?
      { x: e.touches[0].clientX, y: e.touches[0].clientY } :
      { x: e.clientX, y: e.clientY };
    joystickStartRef.current = pos;
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickStartRef.current || countdown !== null) return;

    const pos = 'touches' in e ?
      { x: e.touches[0].clientX, y: e.touches[0].clientY } :
      { x: e.clientX, y: e.clientY };

    const deltaY = pos.y - joystickStartRef.current.y;
    const offset = Math.max(0, Math.min(60, 30 - deltaY));
    setPlayerVerticalOffset(offset);
  };

  const handleJoystickEnd = () => {
    joystickStartRef.current = null;
    setPlayerVerticalOffset(0);
  };

  // Parallax animation with collision detection
  const animate = () => {
    if (isPaused || isGameOver || countdown !== null) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    // Different speeds for parallax layers
    const speed = pushStrength * 0.2;
    cityPos.current -= speed * 0.5; // Background moves slower than ground
    streetPos.current -= speed * 0.8; // Ground moves faster

    const cityEl = document.getElementById('city-layer');
    const streetEl = document.getElementById('street-layer');
    
    if (cityEl) cityEl.style.backgroundPositionX = `${cityPos.current}px`;
    if (streetEl) streetEl.style.backgroundPositionX = `${streetPos.current}px`;

    // Collision detection with obstacles (using lowered rail positions)
    const playerX = 50;
    const playerBottomY = window.innerHeight - 140 - playerVerticalOffset;
    const playerWidth = 120 * 1.3;
    const playerHeight = 120 * 1.3;
    
    const scrollOffset = Math.abs(cityPos.current);
    let hitObstacle = false;
    let currentLift = 0;

    // Check ramps
    OBSTACLES.RAMPS.forEach(ramp => {
      const repeats = Math.floor(scrollOffset / 800);
      const effectiveX = ramp.x + (repeats * 800) - scrollOffset;
      
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

    // Check rails (using lowered positions)
    OBSTACLES.RAILS.forEach(rail => {
      const repeats = Math.floor(scrollOffset / 800);
      const effectiveX = rail.x + (repeats * 800) - scrollOffset;
      
      if (effectiveX < playerX + playerWidth && effectiveX + rail.width > playerX) {
        const railScreenY = window.innerHeight - (600 - rail.y); // y values are now 450, 470, 460
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
      playerPhysicsY.current = Math.max(playerPhysicsY.current, currentLift);
    } else {
      playerPhysicsY.current = Math.max(0, playerPhysicsY.current - 2);
    }

    setVerticalVelocity(playerPhysicsY.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [pushStrength, isPaused, isGameOver, playerVerticalOffset, isOnObstacle, countdown]);

  const numBars = Math.floor(pushStrength / 20);

  return (
    <ScreenContainer className="overflow-hidden bg-[#87CEEB]">
      {/* Game Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="font-retro text-8xl text-celo-yellow animate-pulse">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="font-retro text-white text-2xl mt-4 animate-pulse">
              Get ready to skate!
            </p>
          </div>
        </div>
      )}

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

        <div className="flex gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="bg-white/20 backdrop-blur-sm border border-white/30 p-2 rounded-full active:scale-95 pointer-events-auto"
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="bg-white border-2 border-black p-2 active:scale-95 pointer-events-auto"
          >
            <Pause size={20} className="text-black" />
          </button>
        </div>
      </div>

      {/* Timer Overlay */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <span
          className={`font-retro text-4xl drop-shadow-[2px_2px_0px_black] ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'
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
            <span className="font-retro text-black text-sm">🛹 ON OBSTACLE! +{obstacleBonus} BONUS</span>
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && !isGameOver && countdown === null && (
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
            <p className="font-retro text-green-400 text-lg mt-2">+{obstacleBonus} Obstacle Bonus</p>
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
              <div className="text-center">
                <p className="font-retro text-gray-400 text-sm mb-1">OBSTACLE BONUS</p>
                <p className="font-retro text-green-400 text-3xl">+{obstacleBonus}</p>
              </div>
              <div className="text-center">
                <p className="font-retro text-gray-400 text-sm mb-1">TIME BONUS</p>
                <p className="font-retro text-blue-400 text-3xl">+{Math.floor(timer * 0.5)}</p>
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

      {/* Layer 1: Sky Gradient Base */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#87CEEB] via-[#87CEEB] to-[#3E3E3E]">
        {/* Simple animated clouds */}
        <div className="absolute top-10 left-10 w-32 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-40 h-20 bg-white/8 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 left-1/3 w-36 h-14 bg-white/12 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Layer 2: SVG Background with parallax */}
      <div 
        id="city-layer"
        className="absolute inset-0 z-10 bg-repeat-x"
        style={{
          backgroundImage: `url("${backgroundUrl}")`,
          backgroundSize: 'auto 100%',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'repeat-x',
        }}
      ></div>

      {/* Layer 3: Speed Lines Overlay */}
      <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 200px, rgba(255,255,255,0.05) 200px, rgba(255,255,255,0.05) 202px)',
          opacity: 0,
          transition: 'opacity 0.3s',
          ...(pushStrength > 30 && { opacity: 0.7 })
        }}></div>
      </div>

      {/* Layer 4: Particle Effects (optional) */}
      {pushStrength > 50 && (
        <div className="absolute inset-0 z-12 pointer-events-none">
          {Array.from({length: 10}).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Player Sprite */}
      <div 
        className="absolute bottom-[1px] left-[1px] z-30 transition-all duration-100"
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
          {pushStrength === 0 && countdown === null && (
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
              disabled={countdown !== null}
              className="left-0 right-0 top-[50%] w-12 h-12 rounded-full p-0 border-0 bg-transparent transform translate-y-3 active:scale-90 disabled:opacity-50"
            >
              <img src={ASSETS.BTN_ACTION} alt="Action" className="w-full h-full object-contain" />
            </button>
            <button
              onClick={performFrontside}
              disabled={countdown !== null}
              className="w-12 h-13 rounded-full p-0 border-0 bg-transparent transform rotate-12 translate-x-2 translate-y-3 active:scale-90 disabled:opacity-50"
            >
              <img src={ASSETS.BTN_FRONTSIDE} alt="Frontside" className="w-full h-full object-contain" />
            </button>
            <button
              onClick={performBackside}
              disabled={countdown !== null}
              className="w-23 h-12 rounded-full p-0 border-0 bg-transparent transform -rotate-12 -translate-x-1 translate-y-9 active:scale-90 disabled:opacity-50"
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