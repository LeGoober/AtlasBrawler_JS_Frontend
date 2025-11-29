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
        app.destroy(true);
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

      try {
        await PIXI.Assets.load([...playerFramePaths, ...enemyFramePaths]);
      } catch (err) {
        console.error('Failed to load sprite frames:', err);
      }

      // Create textures
      const playerTextures = playerFramePaths.map(path => {
        const texture = PIXI.Texture.from(path);
        texture.source.scaleMode = 'nearest';
        return texture;
      });

      const enemyTextures = enemyFramePaths.map(path => {
        const texture = PIXI.Texture.from(path);
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

      // Tiled brick wall background
      const bgTexture = PIXI.Texture.from(ASSETS.PARALLAX_LAYER_4);
      bgTexture.source.scaleMode = 'nearest';
      const bgTiling = new PIXI.TilingSprite({
        texture: bgTexture,
        width: app.screen.width * 2,
        height: app.screen.height,
      });
      bgTiling.tileScale.set(2, 2);
      bgContainer.addChild(bgTiling);

      // === ENEMY CONTAINER (Z=10) ===
      const enemyContainer = new PIXI.Container();
      enemyContainer.zIndex = 10;
      app.stage.addChild(enemyContainer);

      // === PLAYER SPRITE (Z=20) ===
      const playerSprite = new PIXI.AnimatedSprite(animations.idle);
      playerSprite.anchor.set(0.5);
      playerSprite.x = app.screen.width * 0.3;
      playerSprite.y = app.screen.height * 0.65;
      playerSprite.scale.set(0.4);
      playerSprite.animationSpeed = 0.2;
      playerSprite.play();
      playerSprite.zIndex = 20;
      app.stage.addChild(playerSprite);
      playerSpriteRef.current = playerSprite;

      // === UI LAYER (Z=30) ===
      const uiContainer = new PIXI.Container();
      uiContainer.zIndex = 30;
      app.stage.addChild(uiContainer);

      // Enable sorting
      app.stage.sortableChildren = true;

      // === ANIMATION CONTROL ===
      const switchAnimation = (name: AnimationName, onComplete?: () => void) => {
        if (!playerSpriteRef.current || currentAnimationRef.current === name) return;
        
        currentAnimationRef.current = name;
        playerSpriteRef.current.textures = animations[name];
        playerSpriteRef.current.loop = name !== 'punch';
        playerSpriteRef.current.gotoAndPlay(0);

        if (onComplete && name === 'punch') {
          setTimeout(onComplete, 400);
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
          switchAnimation('idle');
          isPerformingTrick = false;
        });

        playerSpriteRef.current.rotation = -Math.PI / 4;
        const originalX = playerSpriteRef.current.x;
        const originalY = playerSpriteRef.current.y;
        
        playerSpriteRef.current.x -= 30;
        playerSpriteRef.current.y -= 20;

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

        setTimeout(() => {
          if (playerSpriteRef.current) {
            playerSpriteRef.current.rotation = 0;
            playerSpriteRef.current.x = originalX;
            playerSpriteRef.current.y = originalY;
          }
        }, 600);
      };

      const performBackside = () => {
        if (isPerformingTrick || !playerSpriteRef.current) return;
        isPerformingTrick = true;

        switchAnimation('backside', () => {
          switchAnimation('idle');
          isPerformingTrick = false;
        });

        playerSpriteRef.current.rotation = Math.PI / 4;
        const originalX = playerSpriteRef.current.x;
        const originalY = playerSpriteRef.current.y;
        
        playerSpriteRef.current.x += 30;
        playerSpriteRef.current.y -= 20;

        setTimeout(() => {
          if (playerSpriteRef.current) {
            playerSpriteRef.current.rotation = 0;
            playerSpriteRef.current.x = originalX;
            playerSpriteRef.current.y = originalY;
          }
        }, 600);
      };

      const performPunch = () => {
        if (gameStateRef.current.isPunching) return;
        gameStateRef.current.isPunching = true;

        switchAnimation('punch', () => {
          switchAnimation('idle');
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
        bgTiling.width = app.screen.width * 2;
        bgTiling.height = app.screen.height;
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

        // Background scrolling
        bgTiling.tilePosition.x -= state.momentum * deltaTime * 30;

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
            if (playerSpriteRef.current) playerSpriteRef.current.tint = 0xff0000;
            
            setTimeout(() => {
              if (playerSpriteRef.current) playerSpriteRef.current.tint = 0xffffff;
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
        appRef.current.destroy(true);
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
