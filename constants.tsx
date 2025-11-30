export const APP_NAME = "ATLAS BRAWLER";

/**
 * Asset paths for Atlas Brawler
 * Only includes assets actually used in the game
 */
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
  
  // SVG Background with yellow skate ramps and horizontal grind rails
  GAME_BG_CITY: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJ3aW5kb3dzIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iMTAiIGhlaWdodD0iMTUiIGZpbGw9IiM4N0NFRUIiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPCEtLSBTa3kgLS0+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzg3Q0VFQiIvPgogIDwhLS0gQmFjayBCdWlsZGluZ3MgLS0+CiAgPHJlY3QgeD0iMCIgeT0iMjAwIiB3aWR0aD0iMTUwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzUwNTU1NSIvPgogIDxyZWN0IHg9IjIwMCIgeT0iMTUwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzQ0NCIvPgogIDwhLS0gSG9yaXpvbnRhbCBSYWlsIG9uIEJ1aWxkaW5nIDIgLS0+CiAgPHJlY3QgeD0iMjEwIiB5PSIzNTAiIHdpZHRoPSIxNjAiIGhlaWdodD0iNiIgZmlsbD0iI2NjYyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cmVjdCB4PSIyMjAiIHk9IjQyMCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI2IiBmaWxsPSIjY2NjIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxyZWN0IHg9IjU1MCIgeT0iMjUwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjM1MCIgZmlsbD0iIzU1NSIvPgogIDwhLS0gTWFpbiBCdWlsZGluZyBSb3cgLS0+CiAgPHJlY3QgeD0iMCIgeT0iMjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iIzcwNzA3MCIvPgogIDxyZWN0IHg9IjEwIiB5PSIyOTAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3dpbmRvd3MpIi8+CiAgPHJlY3QgeD0iMjAiIHk9IjUwMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjODdDRUVCIiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxyZWN0IHg9IjAiIHk9IjI2MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzIyMiIvPgogIDwhLS0gQnVpbGRpbmcgMiAoUHJvbWluZW50IFN0b3JlKSAtLT4KICA8cmVjdCB4PSIxODAiIHk9IjMwMCIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM5OTkiLz4KICA8cmVjdCB4PSIxODAiIHk9IjQ1MCIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIyMiIvPgogIDxyZWN0IHg9IjIwMCIgeT0iNDcwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjODdDRUVCIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxyZWN0IHg9IjIwMCIgeT0iNDgwIiB3aWR0aD0iODAiIGhlaWdodD0iMzAiIGZpbGw9InJlZCIvPgogIDwhLS0gQnVpbGRpbmcgMyAtLT4KICA8cmVjdCB4PSI0MzAiIHk9IjIyMCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSIzODAiIGZpbGw9IiM2NjYiLz4KICA8cmVjdCB4PSI0NDAiIHk9IjIzMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjd2luZG93cykiLz4KICA8cmVjdCB4PSI0MzAiIHk9IjQ1MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz4KICA8IS0tIEhvcml6b250YWwgUmFpbCBvbiBCdWlsZGluZyAzIC0tPgogIDxyZWN0IHg9IjQ0NSIgeT0iMzgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjYiIGZpbGw9IiNjY2MiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iNDUwIiB5PSI1MDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzg3Q0VFQiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cmVjdCB4PSI2NTAiIHk9IjI4MCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIzMjAiIGZpbGw9IiM1NTUiLz4KICA8cmVjdCB4PSI2NjAiIHk9IjI5MCIgd2lkdGg9IjEzMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjd2luZG93cykiLz4KICA8IS0tIFllbGxvdyBTa2F0ZSBSYW1wcyAtLT4KICA8IS0tIFJhbXAgMSAobGVmdCkgLS0+CiAgPHBhdGggZD0iTSAxMDAgNTcwIEwgODAgNTcwIFEgODAgNTIwIDEzMCA1MjAgWiIgZmlsbD0iI0ZGRjYwMCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjMiLz4KICA8IS0tIFJhbXAgMiAobWlkZGxlKSAtLT4KICA8cGF0aCBkPSJNIDM1MCA1ODAgTCAzMjAgNTgwIFEgMzIwIDUzMCAzODAgNTMwIFoiIGZpbGw9IiNGRkY2MDAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPCEtLSBSYW1wIDMgKHJpZ2h0KSAtLT4KICA8cGF0aCBkPSJNIDU4MCA1NzAgTCA1NTAgNTcwIFEgNTUwIDUxMCA2MjAgNTEwIFoiIGZpbGw9IiNGRkY2MDAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIzIi8+Cjwvc3ZnPg==`
};

// Obstacle positions for collision detection (relative to 800px SVG width)
export const OBSTACLES = {
  RAMPS: [
    { x: 80, width: 50, baseY: 570, height: 50, lift: 30 },    // Ramp 1 (left)
    { x: 320, width: 60, baseY: 580, height: 50, lift: 30 },   // Ramp 2 (middle)
    { x: 550, width: 70, baseY: 570, height: 60, lift: 35 },   // Ramp 3 (right)
  ],
  RAILS: [
    { x: 210, width: 160, y: 350, height: 6, lift: 20 },  // Building 2 - upper rail
    { x: 220, width: 140, y: 420, height: 6, lift: 20 },  // Building 2 - lower rail
    { x: 445, width: 180, y: 380, height: 6, lift: 20 },  // Building 3 - rail
  ],
};

export const COLORS = {
  CELO_YELLOW: '#FFF600',
};