import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../components/screens/Home';
import Game from '../components/screens/Game';
import Shop from '../components/screens/Shop';
import Settings from '../components/screens/Settings';
import Profile from '../components/screens/Profile';
import Login from '../components/screens/Login';
import Signup from '../components/screens/Signup';
import { GameState } from './types';
import { useWallet } from './hooks/useWallet';
import { getPlayerBalance } from './services/api'; // Correct import
import { getLastWalletAddress } from './utils/gameSettings';

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

  // Function to refresh player balance - returns Promise<void>
  const refreshPlayerBalance = async (): Promise<void> => {
    if (!address) return;
    
    try {
      const player = await getPlayerBalance(address);
      if (player) {
        setGameState(prev => ({
          ...prev,
          balance: player.softTokenBalance || 0,
          username: player.username || "Skater",
        }));
        console.log('Balance refreshed:', player.softTokenBalance);
      }
    } catch (err) {
      console.log("Failed to refresh balance:", err);
    }
  };

  // Separate function if you need to get the player data elsewhere
  const getPlayerData = async () => {
    if (!address) return null;
    
    try {
      return await getPlayerBalance(address);
    } catch (err) {
      console.log("Failed to get player data:", err);
      return null;
    }
  };

  // Fetch player balance when wallet connects
  useEffect(() => {
    if (address) {
      refreshPlayerBalance();
      
      // Set up interval to refresh balance every 30 seconds
      const intervalId = setInterval(refreshPlayerBalance, 30000);
      
      return () => clearInterval(intervalId);
    } else {
      setGameState({
        balance: 0,
        username: "Skater",
        currentLevel: 1,
        selectedSkater: "default"
      });
    }
  }, [address]);

  // Check for last wallet address on mount
  useEffect(() => {
    const lastAddress = getLastWalletAddress();
    if (lastAddress && !address) {
      console.log('Found last wallet address:', lastAddress);
    }
  }, []);

  // Handle login success
  const handleLoginSuccess = (walletAddress: string) => {
    refreshPlayerBalance();
  };

  // Handle signup success
  const handleSignupSuccess = (walletAddress: string, username: string) => {
    setGameState(prev => ({ ...prev, username }));
    refreshPlayerBalance();
  };

  useEffect(() => {
    console.log("Atlas Brawler Initialized");
    console.log("Wallet connected:", isConnected, "Address:", address);
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
              <Home 
                balance={gameState.balance} 
                walletAddress={address || ''}
                onRefreshBalance={refreshPlayerBalance}
              />
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