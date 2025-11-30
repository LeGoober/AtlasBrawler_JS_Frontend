import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './components/screens/Home';
import Game from './components/screens/Game';
import Shop from './components/screens/Shop';
import Settings from './components/screens/Settings';
import Profile from './components/screens/Profile';
import Login from './components/screens/Login';
import Signup from './components/screens/Signup';
import { GameState } from './types';
import { useWallet } from './src/hooks/useWallet';
import { getPlayerBalance } from './src/services/api';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement; isAuthenticated: boolean }> = ({ 
  children, 
  isAuthenticated 
}) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { address, isConnected } = useWallet();
  
  const [gameState, setGameState] = useState<GameState>({
    balance: 0,
    username: "Skater",
    currentLevel: 1,
    selectedSkater: "default"
  });

  // Fetch player balance when wallet connects
  useEffect(() => {
    if (address) {
      getPlayerBalance(address)
        .then((player) => {
          if (!player) {
            // Player not found (404) — keep default state (balance 0) and allow user to register
            console.log('Player not registered', address);
            setGameState(prev => ({ ...prev, balance: 0 }));
            return;
          }

          setGameState(prev => ({
            ...prev,
            balance: player.softTokenBalance || 0,
            username: player.username || "Skater",
          }));
        })
        .catch((err) => {
          console.log("Player not registered or backend unavailable:", err);
          // fallback to 0 balance
          setGameState(prev => ({ ...prev, balance: 0 }));
        });
    }
  }, [address]);

  // Handle login success
  const handleLoginSuccess = (walletAddress: string) => {
    setGameState(prev => ({ ...prev, balance: 0 }));
  };

  // Handle signup success
  const handleSignupSuccess = (walletAddress: string, username: string) => {
    setGameState(prev => ({ ...prev, username, balance: 0 }));
  };

  useEffect(() => {
    console.log("Atlas Brawler Initialized");
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Signup onSignupSuccess={handleSignupSuccess} />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute isAuthenticated={isConnected}>
              <Home balance={gameState.balance} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/game" 
          element={
            <ProtectedRoute isAuthenticated={isConnected}>
              <Game walletAddress={address || ''} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shop" 
          element={
            <ProtectedRoute isAuthenticated={isConnected}>
              <Shop balance={gameState.balance} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute isAuthenticated={isConnected}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute isAuthenticated={isConnected}>
              <Profile balance={gameState.balance} walletAddress={address || ''} />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;