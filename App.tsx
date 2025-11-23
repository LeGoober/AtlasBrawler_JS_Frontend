import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/screens/Home';
import Game from './components/screens/Game';
import Shop from './components/screens/Shop';
import Settings from './components/screens/Settings';
import Profile from './components/screens/Profile';
import { GameState } from './types';

const App: React.FC = () => {
  // Simulate global game state
  const [gameState, setGameState] = useState<GameState>({
    balance: 12.50,
    username: "Atlas",
    currentLevel: 1,
    selectedSkater: "default"
  });

  // Preload assets effect (optional optimization for real apps)
  useEffect(() => {
    console.log("Atlas Brawler Initialized");
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home balance={gameState.balance} />} />
        <Route path="/game" element={<Game />} />
        <Route path="/shop" element={<Shop balance={gameState.balance} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile balance={gameState.balance} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;