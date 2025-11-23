/**
 * PixiJS Game Engine for Atlas Brawler
 * Handles sprite animations, parallax backgrounds, and game loop
 */

import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface PixiGameProps {
  onScoreUpdate: (score: number) => void;
  onTimeUpdate: (time: number) => void;
  onGameOver: (score: number, waves: number) => void;
  isPaused: boolean;
}

export const PixiGame: React.FC<PixiGameProps> = ({ 
  onScoreUpdate, 
  onTimeUpdate, 
  onGameOver,
  isPaused 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const gameStateRef = useRef({
    score: 0,
    timer: 120,
    momentum: 0,
    wavesSurvived: 0,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Pixi Application
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x87CEEB, // Sky blue
      antialias: false, // Pixel-perfect
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });

    appRef.current = app;
    canvasRef.current.appendChild(app.view as HTMLCanvasElement);

    // === PARALLAX BACKGROUND LAYERS ===
    
    const parallaxContainer = new PIXI.Container();
    app.stage.addChild(parallaxContainer);

    // Layer 1: Sky (static)
    const skySprite = PIXI.Sprite.from('/assets/atlas_brawler_background_sprite.png');
    skySprite.width = app.screen.width;
    skySprite.height = app.screen.height;
    parallaxContainer.addChild(skySprite);

    // Layer 2: Buildings (0.5x scroll speed)
    const buildingsContainer = new PIXI.Container();
    const buildingTexture = PIXI.Texture.from('/assets/atlas_brawler_background_sprite.png');
    
    // Create tiling sprite for seamless scrolling
    const buildings = new PIXI.TilingSprite(
      buildingTexture,
      app.screen.width * 2,
      app.screen.height * 0.6
    );
    buildings.y = app.screen.height * 0.2;
    buildings.tileScale.set(1, 1);
    // Pixelated rendering
    buildingTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    buildingsContainer.addChild(buildings);
    parallaxContainer.addChild(buildingsContainer);

    // Layer 3: Floor (1.0x scroll speed)
    const floor = new PIXI.Graphics();
    floor.beginFill(0x8B4513); // Brown floor
    floor.drawRect(0, app.screen.height * 0.8, app.screen.width, app.screen.height * 0.2);
    floor.endFill();
    parallaxContainer.addChild(floor);

    // === CHARACTER SPRITE ===
    
    const character = PIXI.Sprite.from('/assets/celo_skateboard.png');
    character.anchor.set(0.5);
    character.x = 150;
    character.y = app.screen.height * 0.65;
    character.width = 60;
    character.height = 120;
    character.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    app.stage.addChild(character);

    // === GAME LOOP ===
    
    let lastTime = Date.now();
    
    app.ticker.add(() => {
      if (isPaused) return;

      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Seconds
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

      // Parallax scrolling based on momentum
      buildings.tilePosition.x -= state.momentum * 0.5 * deltaTime * 60; // Mid speed
      
      // Add score based on speed
      state.score += state.momentum * 0.1 * deltaTime * 60;

      // Friction
      state.momentum = Math.max(0, state.momentum - 0.5);

      // Update callbacks
      onScoreUpdate(Math.floor(state.score));
      onTimeUpdate(Math.floor(state.timer));

      // Simple character animation (bob up/down)
      character.y = app.screen.height * 0.65 + Math.sin(Date.now() / 200) * 5;
    });

    // === INPUT HANDLING (via window events) ===
    
    const handlePush = (strength: number) => {
      gameStateRef.current.momentum = Math.min(100, gameStateRef.current.momentum + strength);
    };

    // Expose push function globally for UI buttons
    (window as any).pixiPushAction = handlePush;

    // Cleanup
    return () => {
      app.destroy(true, { children: true });
    };
  }, [isPaused]);

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
