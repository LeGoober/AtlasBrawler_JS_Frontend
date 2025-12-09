import React from 'react';

export interface GameState {
  balance: number;
  username: string;
  currentLevel: number;
  selectedSkater: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export enum Screen {
  HOME = '/',
  GAME = '/game',
  SHOP = '/shop',
  PROFILE = '/profile',
  SETTINGS = '/settings'
}

export interface PlayerStats {
  walletAddress: string;
  username: string;
  softTokenBalance: number;
  cUSDBalance: number;
  totalGamesPlayed: number;
  totalWins: number;
  highScore: number;
}

export interface GameSession {
  walletAddress: string;
  score: number;
  wavesSurvived: number;
  isWin: boolean;
  timestamp: Date;
}

export interface ShopItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  type: 'skateboard' | 'clothing' | 'accessory';
}

export interface GameSettings {
  audioEnabled: boolean;
  audioVolume: number;
  hapticFeedback: boolean;
  showTutorial: boolean;
  lastWalletAddress: string | null;
}

export interface WalletConnection {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  isMiniPay: boolean;
}

export interface GameSessionResult {
  finalScore: number;
  wavesSurvived: number;
  obstacleBonus: number;
  timeBonus: number;
  totalTokensEarned: number;
  isVictory: boolean;
}

export interface Transaction {
  id: number;
  fromAddress: string;
  toAddress: string;
  amount: number;
  type: 'transfer' | 'purchase' | 'reward';
  timestamp: Date;
  description: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  type: string;
  equipped: boolean;
  purchaseDate: Date;
}