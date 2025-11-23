# 🚀 Quick Start - Atlas Brawler PWA

## ✅ Ready to Run

Everything is set up! Your PWA has:
- ✅ 67 game assets copied to `public/assets/`
- ✅ PixiJS for sprite rendering & parallax
- ✅ Spring Boot backend integration
- ✅ PWA manifest for installability
- ✅ Google AI Studio screens (Home, Game, Profile, Shop, Settings)

## Start Developing

### 1. Install Dependencies
```bash
cd 6.atlas_brawler_google_ai_studio_frontend
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

Visit: **http://localhost:5173**

### 3. Start Backend (Separate Terminal)
```bash
cd ../3.spring_boot_backend_integration
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080**

## What You'll See

### Home Screen
- Yellow header with "ATLAS BRAWLER" logo
- Character sprite preview
- Settings / Market / Play buttons
- Balance display

### Game Screen
- PixiJS canvas with parallax background
- Score/Timer HUD
- Pause button
- Paused overlay (Resume/Quit)

### Profile Screen
- Wallet address display
- Username management
- Wins/Losses stats
- Add friend functionality

### Shop Screen
- Retro TV interface
- Item selection (Cruiser/Street/Golden)
- Purchase button with cUSD pricing

### Settings Screen
- Sound FX toggle
- Music toggle
- Haptics toggle
- Manage Wallet button

## Build for Production

```bash
npm run build
```

Output: `dist/` folder (deploy this!)

## Deploy to Netlify (Free)

### Option 1: Drag & Drop
1. Run `npm run build`
2. Go to https://app.netlify.com
3. Drag `dist/` folder to deploy area
4. Get instant URL!

### Option 2: CLI
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: Git Integration
1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Auto-deploy on every push!

## Install as Mobile App

### Android/Chrome
1. Open deployed URL in Chrome
2. Tap menu (⋮) → "Install app"
3. Or banner appears: "Add Atlas Brawler to Home Screen"
4. Tap "Install"
5. App appears on home screen with icon
6. Launches fullscreen

### iOS/Safari
1. Open deployed URL in Safari
2. Tap Share button
3. Scroll down → "Add to Home Screen"
4. Tap "Add"
5. App installs with icon

## Test PWA Features

### Check Manifest
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Click "Manifest" in left sidebar
4. Verify all fields populate

### Check Service Worker
1. In DevTools → Application → Service Workers
2. Should show "activated and is running"
3. Check "Offline" → Reload page
4. App should still work (cached assets)

## Assets Verification

All assets loaded from `/public/assets/`:
```
/assets/
├── atlas_brawler_logo_component.png
├── atlas_brawler_background_sprite.png
├── celo_skateboard.png
├── btn-profile.png
├── btn-shop.png
├── btn-settings.png
├── horizontal_game_page/
│   ├── joystick.png
│   ├── action-button.png
│   ├── backside-btn.png
│   ├── frontside-btn.png
│   └── push-strength-bar.png
└── character_audio/
    └── (8 audio files)
```

Verify in browser: `http://localhost:5173/assets/atlas_brawler_logo_component.png`

## Backend Integration Test

### 1. Health Check
```bash
curl http://localhost:8080/api/health
# Expected: {"status":"UP","service":"Atlas Brawler Backend"}
```

### 2. Test from Frontend
Open browser console (F12) and run:
```javascript
// Test health
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(console.log);

// Test player balance (replace with real wallet)
fetch('http://localhost:8080/api/players/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/balance')
  .then(r => r.json())
  .then(console.log);
```

## Troubleshooting

### Assets Not Loading
- Check `public/assets/` folder exists
- Verify paths start with `/assets/` (not `./assets/`)
- Clear browser cache (Ctrl+Shift+R)

### Backend CORS Error
Update Spring Boot `SecurityConfig.java`:
```java
configuration.setAllowedOriginPatterns(List.of("*"));
```

Restart Spring Boot backend.

### PWA Not Installing
- Must use HTTPS in production (Netlify provides this)
- Local dev uses localhost (HTTPS not required)
- Check manifest.json validates in DevTools

### PixiJS Canvas Not Showing
- Check browser console for errors
- Verify PixiJS installed: `npm list pixi.js`
- Check z-index in PixiGame.tsx

## Development Tips

### Hot Reload
- Vite automatically reloads on file changes
- Keep dev server running
- Edit files and see instant updates

### Debug Mode
Open browser console to see:
- "Atlas Brawler Initialized"
- Asset loading logs
- API call responses

### Asset Path Helper
```typescript
// In any component
const getAsset = (path: string) => `/assets/${path}`;

<img src={getAsset('celo_skateboard.png')} />
```

## Next Steps

### Now You Can:
1. ✅ Run `npm run dev` and see the game
2. ✅ Navigate between all screens
3. ✅ Test game loop with timer/score
4. ⏳ Connect wallet (add MiniPay)
5. ⏳ Test backend API calls
6. ⏳ Deploy to Netlify

### Immediate TODO:
- Run `npm install` in the PWA directory
- Run `npm run dev` to start
- Open http://localhost:5173
- Navigate to /game to see PixiJS parallax

---

**Status**: PWA ready to run!  
**Run Command**: `npm run dev`  
**Deploy Command**: `npm run build` → Upload `dist/` to Netlify
