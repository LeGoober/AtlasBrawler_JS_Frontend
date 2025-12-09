import { GameSettings } from '../types';

const DEFAULT_SETTINGS: GameSettings = {
  audioEnabled: true,
  audioVolume: 0.5,
  hapticFeedback: true,
  showTutorial: true,
  lastWalletAddress: null,
};

export const saveGameSettings = (settings: Partial<GameSettings>) => {
  try {
    const current = getGameSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('atlasBrawlerSettings', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return DEFAULT_SETTINGS;
  }
};

export const getGameSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem('atlasBrawlerSettings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
};

export const clearGameSettings = () => {
  localStorage.removeItem('atlasBrawlerSettings');
};

export const updateLastWalletAddress = (address: string) => {
  saveGameSettings({ lastWalletAddress: address });
};

export const getLastWalletAddress = (): string | null => {
  return getGameSettings().lastWalletAddress;
};