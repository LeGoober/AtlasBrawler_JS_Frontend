export const APP_NAME = "ATLAS BRAWLER";

export const ASSETS = {
  // Home/Login Screen
  SKATER_IDLE: "/assets/super_character_sprite(olly_homepage).gif",
  LOGO: "/assets/atlas_brawler_logo_component.png",
  
  // Shop
  SHOP_ITEM: "/assets/celo_skateboard.png",
  TV_LEFT: "/assets/shop_screen/television-selection-screen_left.png",
  TV_DIAL: "/assets/shop_screen/tv-dial.png",
  
  // Game Sprites
  PLAYER_SPRITE: "/assets/sprites/player/player-0.png",
  PLAYER_PUNCH_SPRITE: "/assets/sprites/player/player-1.png",

  // Game Controls UI
  JOYSTICK: "/assets/vertical_game_screen/joystick.png",
  BTN_ACTION: "/assets/vertical_game_screen/action-button.png",
  BTN_BACKSIDE: "/assets/vertical_game_screen/backside-btn.png",
  BTN_FRONTSIDE: "/assets/vertical_game_screen/frontside-btn.png",
  PUSH_CONTROLLER_BARE_LONG: "/assets/vertical_game_screen/push-controller-component_bare(long).png",
  PUSH_STRENGTH_INDICATOR: "/assets/vertical_game_screen/push-strength-indicator-bar.png",
  SKATE_CONTROLLER: "/assets/vertical_game_screen/skate-controller-component.png",

  // Game Audio
  GAME_AUDIO: {
    BACKGROUND_MUSIC: "/assets/game_audio/through_the_wire.mp3",
    SCROLL_MOVEMENT: "/assets/game_audio/rolling-desk-chair-31433.mp3",
  },

  // Character Audio
  CHARACTER_AUDIO: {
    TRICK_SOUND: "/assets/character_audio/skateboarding_trick_frontside_backside.wav.mp3",
    PUNCH_ACTION: "/assets/character_audio/character_pixel_jump_audio.mp3",
  },
};

// Obstacle positions for collision detection (relative to 800px width)
export const OBSTACLES = {
  RAMPS: [
    { x: 80, width: 50, baseY: 570, height: 50, lift: 30 },
    { x: 320, width: 60, baseY: 580, height: 50, lift: 30 },
    { x: 550, width: 70, baseY: 570, height: 60, lift: 35 },
  ],
  RAILS: [
    { x: 210, width: 160, y: 350, height: 6, lift: 20 },
    { x: 220, width: 140, y: 420, height: 6, lift: 20 },
    { x: 445, width: 180, y: 380, height: 6, lift: 20 },
  ],
};

export const COLORS = {
  CELO_YELLOW: '#FFF600',
  CELO_GREEN: '#35D07F',
  CELO_BLUE: '#87CEEB',
  SKY_BLUE: '#87CEEB',
  GROUND_GRAY: '#3E3E3E',
  BUILDING_DARK: '#444',
  BUILDING_MEDIUM: '#666',
  BUILDING_LIGHT: '#777',
};

// CSS gradients for game background
export const BACKGROUND_GRADIENTS = {
  SKY: 'linear-gradient(to bottom, #87CEEB 0%, #87CEEB 70%, #3E3E3E 70%, #3E3E3E 100%)',
  SKYLINE: 'linear-gradient(to right, transparent 0%, #555 10%, #555 15%, transparent 20%, transparent 30%, #666 35%, #666 40%, transparent 45%, transparent 55%, #777 60%, #777 65%, transparent 70%, transparent 80%, #444 85%, #444 90%, transparent 100%)',
  RAMP: 'linear-gradient(to top right, #FFF600 0%, #FFD700 100%)',
  RAIL: 'repeating-linear-gradient(90deg, #ccc 0px, #ccc 40px, #999 40px, #999 42px)',
  STREET_GRID: 'repeating-linear-gradient(90deg, transparent 0px, transparent 38px, rgba(0,0,0,0.2) 38px, rgba(0,0,0,0.2) 40px), repeating-linear-gradient(0deg, transparent 0px, transparent 18px, rgba(0,0,0,0.1) 18px, rgba(0,0,0,0.1) 20px)',
  STREET_LINES: 'repeating-linear-gradient(90deg, transparent 0px, transparent 78px, #FFF600 78px, #FFF600 82px, transparent 82px, transparent 160px)',
};