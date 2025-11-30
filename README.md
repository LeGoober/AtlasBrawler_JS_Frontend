# 🛹 ATLAS BRAWLER - Frontend

```
   ╔═══════════════════════════════════════╗
   ║                                       ║
   ║     ▄▀█ ▀█▀ █░░ ▄▀█ █▀               ║
   ║     █▀█ ░█░ █▄▄ █▀█ ▄█               ║
   ║                                       ║
   ║     █▄▄ █▀█ ▄▀█ █░█░█ █░░ █▀▀ █▀█    ║
   ║     █▄█ █▀▄ █▀█ ▀▄▀▄▀ █▄▄ ██▄ █▀▄    ║
   ║                                       ║
   ║         🛹 Skate • Trick • Earn 💰     ║
   ╚═══════════════════════════════════════╝
```

A retro skateboarding brawler game built for **Celo Africa DAO Hackathon**. Swipe to push, pull tricks, and earn crypto rewards!

---

## 🎮 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Game
```bash
npm run dev
```

### 3. Open Your Browser
Navigate to `http://localhost:5173`

---

## 🕹️ How to Play

### Controls
- **Left Controller** - Swipe down to push and build speed 🚀
- **Joystick** - Drag up/down to move vertically on the street
- **Frontside (FS)** - +50 points, tilted left jump
- **Backside (BS)** - +50 points, tilted right jump  
- **Action Button** - +25 points, forward dash attack

### Goals
- Survive as long as possible ⏱️
- Perform tricks to rack up points 📈
- Earn tokens for your wallet 💰
- Beat your high score!

---

## 🏗️ Tech Stack

- **React** + **TypeScript** + **Vite**
- **TailwindCSS** for styling
- **CSS Parallax** for smooth scrolling
- **Celo Wallet** integration (MiniPay compatible)

---

## 🎨 Game Features

✅ Swipe-down push mechanics  
✅ CSS parallax city background with ramps & rails  
✅ Static sprite with dynamic transforms  
✅ Trick system (Frontside, Backside, Punch)  
✅ Joystick vertical movement control  
✅ Background music + sound effects  
✅ Token rewards system  
✅ Win/Loss tracking  

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```
VITE_API_URL=http://localhost:8080/api
```

### Backend Connection
Make sure the backend is running on `http://localhost:8080`

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 🎯 Game Design Philosophy

**Simple. Fast. Fun.**

We ditched complex PixiJS sprite sheets for clean CSS parallax and static sprites. The result? Butter-smooth gameplay with zero screen tearing.

**Swipe to Push 🛹** → **Tricks for Points 🎪** → **Earn Tokens 💰**

---

Built with ❤️ for **Celo Africa DAO**  
Skateboard your way to crypto rewards! 🛹💨
