import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { ASSETS } from '../../constants';

interface PixiGameProps {
  onScoreUpdate: (score: number) => void;
  onTimeUpdate: (time: number) => void;
  onGameOver: (score: number, waves: number) => void;
  isPaused: boolean;
  pushStrength: number;
  onTrickPressed: (trick: 'frontside' | 'backside') => void;
  onPunchPressed: () => void;
}

interface Enemy {
  sprite: PIXI.AnimatedSprite;
  x: number;
  y: number;
  speed: number;
  health: number;
}

type AnimationName = 'idle' | 'frontside' | 'backside' | 'punch';

export const PixiGame: React.FC<PixiGameProps> = ({ 
  onScoreUpdate, 
  onTimeUpdate, 
  onGameOver,
  isPaused,
  pushStrength,
  onTrickPressed,
  onPunchPressed,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const playerSpriteRef = useRef<PIXI.AnimatedSprite | null>(null);
  const currentAnimationRef = useRef<AnimationName>('idle');
  
  const gameStateRef = useRef({
    score: 0,
    timer: 120,
    momentum: 0,
    wavesSurvived: 0,
    enemies: [] as Enemy[],
    isHit: false,
    hitCooldown: 0,
    isPunching: false,
    playerBaseX: 0,  // Base X position for player
    playerTargetX: 0, // Target X position for smooth movement
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    let mounted = true;
    const app = new PIXI.Application();
    
    app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x87CEEB,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(async () => {
      if (!mounted || !canvasRef.current) {
        app.destroy(true, { children: true, texture: true, textureSource: true });
        return;
      }

      appRef.current = app;
      canvasRef.current.appendChild(app.canvas);

      // === LOAD PLAYER ANIMATION FRAMES ===
      const playerFramePaths = [
        ASSETS.PLAYER_FRAMES.IDLE_0,
        ASSETS.PLAYER_FRAMES.IDLE_1,
        ASSETS.PLAYER_FRAMES.IDLE_2,
        ASSETS.PLAYER_FRAMES.FRONTSIDE_4,
        ASSETS.PLAYER_FRAMES.FRONTSIDE_5,
        ASSETS.PLAYER_FRAMES.FRONTSIDE_6,
        ASSETS.PLAYER_FRAMES.BACKSIDE_8,
        ASSETS.PLAYER_FRAMES.BACKSIDE_9,
        ASSETS.PLAYER_FRAMES.BACKSIDE_10,
      ];

      const enemyFramePaths = [
        ASSETS.ENEMY_FRAMES.FRAME_0,
        ASSETS.ENEMY_FRAMES.FRAME_1,
        ASSETS.ENEMY_FRAMES.FRAME_2,
        ASSETS.ENEMY_FRAMES.FRAME_3,
        ASSETS.ENEMY_FRAMES.FRAME_4,
        ASSETS.ENEMY_FRAMES.FRAME_5,
        ASSETS.ENEMY_FRAMES.FRAME_6,
        ASSETS.ENEMY_FRAMES.FRAME_7,
        ASSETS.ENEMY_FRAMES.FRAME_8,
      ];

      // Store frame paths for lazy loading
      let bgFramePaths: string[] = [];
      if ((ASSETS as any).BG_CITY_FRAMES && Array.isArray((ASSETS as any).BG_CITY_FRAMES)) {
        bgFramePaths = (ASSETS as any).BG_CITY_FRAMES;
      }

      try {
        // Preload all assets, including the first background frame
        await PIXI.Assets.load([...playerFramePaths, ...enemyFramePaths, ASSETS.BG_CITY, ...bgFramePaths]);
      } catch (err) {
        console.error('Failed to load sprite frames:', err);
      }
      
      // Create textures
      const playerTextures = playerFramePaths.map(path => {
        const texture = PIXI.Texture.from(path);
        if (!texture) {
          console.warn('Player texture missing or invalid:', path);
          return PIXI.Texture.WHITE;
        }
        texture.source.scaleMode = 'nearest';
        return texture;
      });

      const enemyTextures = enemyFramePaths.map(path => {
        const texture = PIXI.Texture.from(path);
        if (!texture) {
          console.warn('Enemy texture missing or invalid:', path);
          return PIXI.Texture.WHITE;
        }
        texture.source.scaleMode = 'nearest';
        return texture;
      });

      // Animation frame groups
      const animations = {
        idle: [playerTextures[0], playerTextures[1], playerTextures[2]],
        frontside: [playerTextures[3], playerTextures[4], playerTextures[5]],
        backside: [playerTextures[6], playerTextures[7], playerTextures[8]],
        punch: [playerTextures[1], playerTextures[2]],
      };

      // === BACKGROUND LAYER (Z=0) ===
      const bgContainer = new PIXI.Container();
      bgContainer.zIndex = 0;
      app.stage.addChild(bgContainer);
      // Background animation frame tracking
      let bgFrameIndex = 0;
      let bgAnimTickCounter = 0;

      // Load background frames (lazy loading to avoid 75-file preload)
      let bgTexture: PIXI.Texture;
      let bgSprite: PIXI.Sprite;
      
      // Load first frame only
      try {
        bgTexture = PIXI.Texture.from(ASSETS.BG_CITY);
        bgTexture.source.scaleMode = 'nearest';
      } catch (e) {
        console.warn('Failed to load BG_CITY, using PARALLAX_LAYER_4 as fallback', e);
        bgTexture = PIXI.Texture.from(ASSETS.PARALLAX_LAYER_4);
        if (bgTexture) bgTexture.source.scaleMode = 'nearest';
      }
      
      // Create regular Sprite (not TilingSprite) for individual frames
      bgSprite = new PIXI.Sprite(bgTexture);
      bgSprite.anchor.set(0, 0);
      
      // Scale to fit screen while maintaining aspect ratio
      const bgScale = Math.max(
        app.screen.width / bgSprite.width,
        app.screen.height / bgSprite.height
      );
      bgSprite.scale.set(bgScale);
      
      // Center the sprite
      bgSprite.x = (app.screen.width - bgSprite.width * bgScale) / 2;
      bgSprite.y = 0;
      
      bgContainer.addChild(bgSprite);

      // === ENEMY CONTAINER (Z=10) ===
      const enemyContainer = new PIXI.Container();
      enemyContainer.zIndex = 10;
      app.stage.addChild(enemyContainer);

      // === PLAYER SPRITE (Z=20) ===
      // Player uses single idle frame, only animates on action
      const playerSprite = new PIXI.AnimatedSprite(animations.idle);
      playerSprite.anchor.set(0.5);
      const startX = app.screen.width * 0.2;
      playerSprite.x = startX;
      playerSprite.y = app.screen.height * 0.7;
      playerSprite.scale.set(2.0);
      playerSprite.animationSpeed = 0;  // No auto-animation
      playerSprite.loop = false;         // Only play on action
      playerSprite.gotoAndStop(0);       // Start at idle frame 0
      playerSprite.zIndex = 20;
      app.stage.addChild(playerSprite);
      playerSpriteRef.current = playerSprite;
      
      // Initialize player position tracking
      gameStateRef.current.playerBaseX = startX;
      gameStateRef.current.playerTargetX = startX;

      // === FOREGROUND STRIP (Z=25) - Ground layer above controls ===
      const fgConfig = (ASSETS as any).FOREGROUND_STRIP || { HEIGHT: 80, COLOR: 0x3D3D3D, Y_OFFSET: 0.75 };
      const foregroundStrip = new PIXI.Graphics();
      foregroundStrip.rect(0, app.screen.height * fgConfig.Y_OFFSET, app.screen.width, fgConfig.HEIGHT);
      foregroundStrip.fill(fgConfig.COLOR);
      foregroundStrip.zIndex = 25;
      app.stage.addChild(foregroundStrip);

      // === UI LAYER (Z=30) ===
      const uiContainer = new PIXI.Container();
      uiContainer.zIndex = 30;
      app.stage.addChild(uiContainer);

      // Enable sorting
      app.stage.sortableChildren = true;

      // === ANIMATION CONTROL ===
      const switchAnimation = (name: AnimationName, onComplete?: () => void) => {
        if (!playerSpriteRef.current) return;
        
        currentAnimationRef.current = name;
        playerSpriteRef.current.textures = animations[name];
        
        if (name === 'idle') {
          // Idle state: single static frame
          playerSpriteRef.current.loop = false;
          playerSpriteRef.current.gotoAndStop(0);
        } else {
          // Action animations: play once
          playerSpriteRef.current.loop = false;
          playerSpriteRef.current.animationSpeed = 0.2;
          playerSpriteRef.current.gotoAndPlay(0);
          
          // Auto-return to idle after animation
          const duration = name === 'punch' ? 400 : 600;
          setTimeout(() => {
            if (onComplete) onComplete();
            switchAnimation('idle');
          }, duration);
        }
      };

      // === ENEMY SPAWNING ===
      const spawnEnemy = () => {
        const enemySprite = new PIXI.AnimatedSprite(enemyTextures);
        enemySprite.anchor.set(0.5);
        enemySprite.scale.set(0.5);
        enemySprite.animationSpeed = 0.15;
        enemySprite.play();
        
        const enemy: Enemy = {
          sprite: enemySprite,
          x: app.screen.width + 100,
          y: app.screen.height * 0.65 + (Math.random() - 0.5) * 100,
          speed: 2 + Math.random() * 2,
          health: 100,
        };
        
        enemySprite.x = enemy.x;
        enemySprite.y = enemy.y;
        enemyContainer.addChild(enemySprite);
        gameStateRef.current.enemies.push(enemy);
      };

      // === COLLISION DETECTION ===
      const checkCollision = (sprite1: PIXI.Sprite, sprite2: PIXI.Sprite): boolean => {
        const bounds1 = sprite1.getBounds();
        const bounds2 = sprite2.getBounds();
        
        return (
          bounds1.x < bounds2.x + bounds2.width &&
          bounds1.x + bounds1.width > bounds2.x &&
          bounds1.y < bounds2.y + bounds2.height &&
          bounds1.y + bounds1.height > bounds2.y
        );
      };

      // === TRICK ACTIONS ===
      let isPerformingTrick = false;

      const performFrontside = () => {
        if (isPerformingTrick || !playerSpriteRef.current) return;
        isPerformingTrick = true;

        switchAnimation('frontside', () => {
          isPerformingTrick = false;
        });

        // Smoother rotation and jump
        const originalRotation = playerSpriteRef.current.rotation;
        const originalY = playerSpriteRef.current.y;
        
        // Gradual rotation
        playerSpriteRef.current.rotation = -Math.PI / 6; // Less extreme (-30°)
        playerSpriteRef.current.y -= 15; // Smaller jump

        // Punch nearest enemy
        const nearest = gameStateRef.current.enemies[0];
        if (nearest && Math.abs(nearest.x - playerSpriteRef.current.x) < 150) {
          nearest.health -= 50;
          if (nearest.health <= 0) {
            enemyContainer.removeChild(nearest.sprite);
            gameStateRef.current.enemies.shift();
            gameStateRef.current.score += 100;
          }
        }

        // Smooth return to normal
        setTimeout(() => {
          if (playerSpriteRef.current) {
            playerSpriteRef.current.rotation = originalRotation;
            playerSpriteRef.current.y = originalY;
          }
        }, 400);
      };

      const performBackside = () => {
        if (isPerformingTrick || !playerSpriteRef.current) return;
        isPerformingTrick = true;

        switchAnimation('backside', () => {
          isPerformingTrick = false;
        });

        // Smoother rotation and jump
        const originalRotation = playerSpriteRef.current.rotation;
        const originalY = playerSpriteRef.current.y;
        
        playerSpriteRef.current.rotation = Math.PI / 6; // Less extreme (+30°)
        playerSpriteRef.current.y -= 15; // Smaller jump

        // Smooth return to normal
        setTimeout(() => {
          if (playerSpriteRef.current) {
            playerSpriteRef.current.rotation = originalRotation;
            playerSpriteRef.current.y = originalY;
          }
        }, 400);
      };

      const performPunch = () => {
        if (gameStateRef.current.isPunching) return;
        gameStateRef.current.isPunching = true;

        switchAnimation('punch', () => {
          gameStateRef.current.isPunching = false;
        });

        // Damage all enemies in range
        gameStateRef.current.enemies.forEach((enemy, index) => {
          if (Math.abs(enemy.x - (playerSpriteRef.current?.x || 0)) < 100) {
            enemy.health -= 75;
            if (enemy.health <= 0) {
              enemyContainer.removeChild(enemy.sprite);
              gameStateRef.current.enemies.splice(index, 1);
              gameStateRef.current.score += 50;
            }
          }
        });
      };

      // === WINDOW RESIZE ===
      const handleResize = () => {
        if (!app) return;
        app.renderer.resize(window.innerWidth, window.innerHeight);
        
        // Rescale background sprite to fit new screen size
        const newBgScale = Math.max(
          app.screen.width / bgSprite.texture.width,
          app.screen.height / bgSprite.texture.height
        );
        bgSprite.scale.set(newBgScale);
        bgSprite.x = (app.screen.width - bgSprite.width) / 2;
        bgSprite.y = 0;
        
        // Resize foreground strip
        foregroundStrip.clear();
        foregroundStrip.rect(0, app.screen.height * fgConfig.Y_OFFSET, app.screen.width, fgConfig.HEIGHT);
        foregroundStrip.fill(fgConfig.COLOR);
      };
      window.addEventListener('resize', handleResize);

      // === GAME LOOP ===
      let lastTime = Date.now();
      let enemySpawnTimer = 0;
      
      app.ticker.add(() => {
        if (isPaused) return;

        const now = Date.now();
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        const state = gameStateRef.current;

        // Update timer
        state.timer -= deltaTime;
        if (state.timer <= 0) {
          state.timer = 0;
          onGameOver(state.score, state.wavesSurvived);
          app.ticker.stop();
          return;
        }

        // Update momentum
        state.momentum = pushStrength;

        // Move player forward based on momentum (smooth horizontal movement)
        if (state.momentum > 5 && playerSpriteRef.current) {
          // Increase target position based on momentum
          state.playerTargetX += state.momentum * deltaTime * 2;
          
          // Smooth interpolation to target position
          const currentX = playerSpriteRef.current.x;
          const newX = currentX + (state.playerTargetX - currentX) * 0.1;
          playerSpriteRef.current.x = newX;
          
          // Keep player from going off-screen right
          const maxX = app.screen.width * 0.7;
          if (playerSpriteRef.current.x > maxX) {
            playerSpriteRef.current.x = maxX;
            state.playerTargetX = maxX;
          }
        }

        // Background frame animation (smooth cycling based on momentum)
        if (bgFramePaths.length > 1 && state.momentum > 5) {
          // Smoother frame progression - accumulate fractional progress
          const frameSpeed = state.momentum / 100;  // 0-1 range
          bgAnimTickCounter += frameSpeed;
          
          if (bgAnimTickCounter >= 1) {
            bgAnimTickCounter = 0;
            bgFrameIndex = (bgFrameIndex + 1) % bgFramePaths.length;
            
            // Lazy load the texture on-demand
            const newTexture = PIXI.Texture.from(bgFramePaths[bgFrameIndex]);
            newTexture.source.scaleMode = 'nearest';
            bgSprite.texture = newTexture;
          }
        }

        // Add score based on momentum
        state.score += state.momentum * 0.1 * deltaTime;

        // Spawn enemies
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer >= 3) {
          spawnEnemy();
          enemySpawnTimer = 0;
          state.wavesSurvived++;
        }

        // Update enemies
        state.enemies.forEach((enemy, index) => {
          enemy.x -= (state.momentum * 0.5 + enemy.speed) * deltaTime * 60;
          enemy.sprite.x = enemy.x;

          // Check collision with player
          if (playerSpriteRef.current && !state.isHit && checkCollision(playerSpriteRef.current, enemy.sprite)) {
            state.isHit = true;
            state.hitCooldown = 2;
            
            // Subtle screen shake instead of red flash
            const originalY = playerSpriteRef.current.y;
            playerSpriteRef.current.y += 3;
            setTimeout(() => {
              if (playerSpriteRef.current) playerSpriteRef.current.y = originalY;
            }, 50);
            
            setTimeout(() => {
              state.isHit = false;
            }, 200);
          }

          // Remove off-screen enemies
          if (enemy.x < -200) {
            enemyContainer.removeChild(enemy.sprite);
            state.enemies.splice(index, 1);
          }
        });

        // Hit cooldown
        if (state.hitCooldown > 0) {
          state.hitCooldown -= deltaTime;
        }

        // Update callbacks
        onScoreUpdate(Math.floor(state.score));
        onTimeUpdate(Math.floor(state.timer));
      });

      // === EXPOSE CONTROLS ===
      (window as any).pixiPerformFrontside = () => {
        performFrontside();
        onTrickPressed('frontside');
      };
      (window as any).pixiPerformBackside = () => {
        performBackside();
        onTrickPressed('backside');
      };
      (window as any).pixiPerformPunch = () => {
        performPunch();
        onPunchPressed();
      };

    }).catch((err) => {
      console.error('PixiJS initialization failed:', err);
    });
    
    return () => {
      mounted = false;
      window.removeEventListener('resize', () => {});
      
      if (appRef.current) {
        // The 'true' argument will destroy the renderer and its plugins
        appRef.current.destroy(true, { children: true, texture: true, textureSource: true });
        appRef.current = null;
      }

      (window as any).pixiPerformFrontside = undefined;
      (window as any).pixiPerformBackside = undefined;
      (window as any).pixiPerformPunch = undefined;
    };
  }, [isPaused, pushStrength, onScoreUpdate, onTimeUpdate, onGameOver, onTrickPressed, onPunchPressed]);

  return (
    <div 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 1,
      }} 
    />
  );
};
