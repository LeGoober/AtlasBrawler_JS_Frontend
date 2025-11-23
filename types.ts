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