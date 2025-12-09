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
  
  // Game Background - Fixed SVG file
  GAME_BACKGROUND_SVG: "/assets/game_background.svg",
};

// Obstacle positions for collision detection (relative to 800px SVG width)
export const OBSTACLES = {
  RAMPS: [
    { x: 150, width: 80, baseY: 570, height: 50, lift: 30 },    // Ramp 1
    { x: 350, width: 60, baseY: 580, height: 50, lift: 30 },    // Ramp 2  
    { x: 550, width: 70, baseY: 570, height: 50, lift: 35 },    // Ramp 3
  ],
  RAILS: [
    { x: 220, width: 160, y: 470, height: 6, lift: 20 },  // Rail 1 - lowered from 350 to 450
    { x: 240, width: 140, y: 500, height: 6, lift: 20 },  // Rail 2 - lowered from 420 to 470
    { x: 445, width: 180, y: 460, height: 6, lift: 20 },  // Rail 3 - lowered from 380 to 460
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
  RAIL_COLOR: '#ccc',
  RAIL_BORDER: '#333',
};

// Inline SVG fallback with lowered rails
export const GAME_BACKGROUND_INLINE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#87CEEB"/>
  
  <!-- Simple buildings -->
  <rect x="100" y="300" width="140" height="200" fill="#666"/>
  <rect x="110" y="310" width="120" height="50" fill="#87CEEB" opacity="0.3"/>
  <rect x="110" y="370" width="120" height="50" fill="#87CEEB" opacity="0.3"/>
  
  <rect x="280" y="280" width="160" height="220" fill="#777"/>
  <rect x="290" y="290" width="140" height="60" fill="#87CEEB" opacity="0.3"/>
  <rect x="290" y="360" width="140" height="60" fill="#87CEEB" opacity="0.3"/>
  
  <rect x="480" y="320" width="130" height="180" fill="#555"/>
  <rect x="490" y="330" width="110" height="55" fill="#87CEEB" opacity="0.3"/>
  <rect x="490" y="395" width="110" height="55" fill="#87CEEB" opacity="0.3"/>
  
  <!-- Ramps -->
  <path d="M 180 570 L 150 570 Q 150 520 230 520 Z" fill="#FFF600" stroke="#333" stroke-width="3"/>
  <path d="M 380 580 L 350 580 Q 350 530 410 530 Z" fill="#FFF600" stroke="#333" stroke-width="3"/>
  <path d="M 580 570 L 550 570 Q 550 520 620 520 Z" fill="#FFF600" stroke="#333" stroke-width="3"/>
  
  <!-- Rails - LOWERED -->
    <!-- Rail 1 - Lowered to near ground level -->
    <rect x="220" y="470" width="160" height="6" fill="#ccc" stroke="#333" stroke-width="1"/>
    <!-- Rail 2 - Lowered to near ground level -->
    <rect x="240" y="500" width="140" height="6" fill="#ccc" stroke="#333" stroke-width="1"/>
    <!-- Rail 3 - Lowered to near ground level -->
    <rect x="445" y="460" width="180" height="6" fill="#ccc" stroke="#333" stroke-width="1"/>
  <!-- Ground -->
  <rect x="0" y="500" width="800" height="100" fill="#3E3E3E"/>
  
  <!-- Street lines -->
  <line x1="0" y1="520" x2="800" y2="520" stroke="#FFF600" stroke-width="4" stroke-dasharray="10,10"/>
  <line x1="0" y1="540" x2="800" y2="540" stroke="#FFF600" stroke-width="4" stroke-dasharray="10,10"/>
  <line x1="0" y1="560" x2="800" y2="560" stroke="#FFF600" stroke-width="4" stroke-dasharray="10,10"/>
</svg>
`)}`;