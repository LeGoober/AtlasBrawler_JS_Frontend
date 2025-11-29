import React from 'react';

export const APP_NAME = "ATLAS BRAWLER";

// Placeholder assets using Picsum and geometric patterns
export const ASSETS = {
  SKATER_IDLE: "/assets/super_character_sprite(olly_homepage).gif",
  SKATER_JUMP: "/assets/celo_skateboard.png",
  BG_CITY: "/assets/atlas_brawler_background_sprite.png",
  SHOP_ITEM: "/assets/celo_skateboard.png",
  LOGO: "/assets/atlas_brawler_logo_component.png",
  BTN_PROFILE: "/assets/btn-profile.png",
  BTN_SHOP: "/assets/btn-shop.png",
  BTN_SETTINGS: "/assets/btn-settings.png",
  BTN_START: "/assets/btn-start_game.png",
  JOYSTICK: "/assets/vertical_game_screen/joystick.png",
  BTN_ACTION: "/assets/vertical_game_screen/action-button.png",
  BTN_BACKSIDE: "/assets/vertical_game_screen/backside-btn.png",
  BTN_FRONTSIDE: "/assets/vertical_game_screen/frontside-btn.png",
  PUSH_CONTROLLER_BARE: "/assets/vertical_game_screen/push-controller-component_bare.png",
  PUSH_CONTROLLER_BARE_LONG: "/assets/vertical_game_screen/push-controller-component_bare(long).png",
  PUSH_STRENGTH_INDICATOR: "/assets/vertical_game_screen/push-strength-indicator-bar.png",
  PUSH_CONTROLLER: "/assets/vertical_game_screen/push-controller-component.png",
  SKATE_CONTROLLER: "/assets/vertical_game_screen/skate-controller-component.png",
  TV_LEFT: "/assets/shop_screen/television-selection-screen_left.png",
  TV_RIGHT: "/assets/shop_screen/television-selection-screen_right.png",
  TV_DIAL: "/assets/shop_screen/tv-dial.png",
  CLOUD_BALANCE: "/assets/profile_screen/user-balance-cloud-component.png",
  
  // New PixiJS Game Sprites
  SKATER_SPRITE_SHEET: "/assets/sprites/Elderly Skateboarder Sprite Sheet.png",
  CAMERA_ENEMY_SPRITE: "/assets/sprites/Neon Skater Sprite Sheet_remix.png",
  PARALLAX_LAYER_1: "/assets/sprites/Skateable Cape Town Street_remix_01.png",
  PARALLAX_LAYER_2: "/assets/sprites/Skateable Cape Town Street_remix_02.png",
  PARALLAX_LAYER_3: "/assets/sprites/Skateable Cape Town Street_remix_03.png",
  PARALLAX_LAYER_4: "/assets/sprites/Skateable Cape Town Street_remix_04.png",
  
  // Player Animation Frames
  PLAYER_FRAMES: {
    IDLE_0: "/assets/sprites/player/neon-frame_%03-0.png",
    IDLE_1: "/assets/sprites/player/neon-frame_%03-1.png",
    IDLE_2: "/assets/sprites/player/neon-frame_%03-2.png",
    FRONTSIDE_4: "/assets/sprites/player/neon-frame_%03-4.png",
    FRONTSIDE_5: "/assets/sprites/player/neon-frame_%03-5.png",
    FRONTSIDE_6: "/assets/sprites/player/neon-frame_%03-6.png",
    BACKSIDE_8: "/assets/sprites/player/neon-frame_%03-8.png",
    BACKSIDE_9: "/assets/sprites/player/neon-frame_%03-9.png",
    BACKSIDE_10: "/assets/sprites/player/neon-frame_%03-10.png",
  },
  
  // Enemy Animation Frames
  ENEMY_FRAMES: {
    FRAME_0: "/assets/sprites/enemy/neon-frame_%03-0.png",
    FRAME_1: "/assets/sprites/enemy/neon-frame_%03-1.png",
    FRAME_2: "/assets/sprites/enemy/neon-frame_%03-2.png",
    FRAME_3: "/assets/sprites/enemy/neon-frame_%03-3.png",
    FRAME_4: "/assets/sprites/enemy/neon-frame_%03-4.png",
    FRAME_5: "/assets/sprites/enemy/neon-frame_%03-5.png",
    FRAME_6: "/assets/sprites/enemy/neon-frame_%03-6.png",
    FRAME_7: "/assets/sprites/enemy/neon-frame_%03-7.png",
    FRAME_8: "/assets/sprites/enemy/neon-frame_%03-8.png",
    FRAME_9: "/assets/sprites/enemy/neon-frame_%03-9.png",
    FRAME_10: "/assets/sprites/enemy/neon-frame_%03-10.png",
    FRAME_11: "/assets/sprites/enemy/neon-frame_%03-11.png",
  },
  
  // Animation Config
  PLAYER_ANIMATIONS_JSON: "/assets/sprites/player-animations.json",
  
  // Generated Pixel Art City Background matching the user's provided sprite style
  // Features: Grey buildings, Blue windows, Shop fronts (Red/White signs), Urban aesthetic
  GAME_BG_CITY: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJ3aW5kb3dzIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB4PSI1IiB5PSI1IiB3aWR0aD0iMTAiIGhlaWdodD0iMTUiIGZpbGw9IiM4N0NFRUIiIC8+CiAgICA8L3BhdHRlcm4+CiAgICA8cGF0dGVybiBpZD0iZ3J1bmdlIiB4PSIwIiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iMiIgZmlsbD0iIzNBM0EzQSIgLz4KICAgICAgPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjIiIGhlaWdodD0iMiIgZmlsbD0iIzIyMiIgLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPCEtLSBTa3kgLS0+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzg3Q0VFQiIgLz4KICAKICA8IS0tIEJhY2sgQnVpbGRpbmdzIC0tPgogIDxyZWN0IHg9IjAiIHk9IjIwMCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiM1MDU1NTUiIC8+CiAgPHJlY3QgeD0iMjAwIiB5PSIxNTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjNDQ0IiAvPgogIDxyZWN0IHg9IjU1MCIgeT0iMjUwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjM1MCIgZmlsbD0iIzU1NSIgLz4KCiAgPCEtLSBNYWluIEJ1aWxkaW5nIFJvdyAtLT4KICA8IS0tIEJ1aWxkaW5nIDEgLS0+CiAgPHJlY3QgeD0iMCIgeT0iMjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iIzcwNzA3MCIgLz4KICA8cmVjdCB4PSIxMCIgeT0iMjkwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCN3aW5kb3dzKSIgLz4KICA8cmVjdCB4PSIyMCIgeT0iNTAwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIGZpbGw9IiM4N0NFRUIiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSI0IiAvPiA8IS0tIFNob3AgV2luZG93IC0tPgogIDxyZWN0IHg9IjAiIHk9IjI2MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzIyMiIgLz4KCiAgPCEtLSBCdWlsZGluZyAyIChQcm9taW5lbnQgU3RvcmUpIC0tPgogIDxyZWN0IHg9IjE4MCIgeT0iMzAwIiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzk5OSIgLz4KICA8cmVjdCB4PSIxODAiIHk9IjQ1MCIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIyMiIgLz4KICA8cmVjdCB4PSIyMDAiIHk9IjQ3MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzg3Q0VFQiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPHJlY3QgeD0iMjAwIiB5PSI0ODAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMCIgZmlsbD0icmVkIiAvPiA8IS0tIFN1cHJlbWUgQm94IC0tPgogIAogIDwhLS0gQnVpbGRpbmcgMyAtLT4KICA8cmVjdCB4PSI0MzAiIHk9IjIyMCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSIzODAiIGZpbGw9IiM2NjYiIC8+CiAgPHJlY3QgeD0iNDQwIiB5PSIyMzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3dpbmRvd3MpIiAvPgogIDxyZWN0IHg9IjQzMCIgeT0iNDUwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIgLz4gPCEtLSBCUk9LRSBTaWduIEJhY2tncm91bmQgLS0+CiAgPHJlY3QgeD0iNDUwIiB5PSI1MDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzg3Q0VFQiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgCiAgPCEtLSBCdWlsZGluZyA0IC0tPgogIDxyZWN0IHg9IjY1MCIgeT0iMjgwIiB3aWR0aD0iMTUwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iIzU1NSIgLz4KICA8cmVjdCB4PSI2NjAiIHk9IjI5MCIgd2lkdGg9IjEzMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjd2luZG93cykiIC8+Cjwvc3ZnPg==`
};

export const COLORS = {
  CELO_YELLOW: '#FFF600',
};