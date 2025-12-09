import { useState, useCallback } from 'react';
import { completeGameSession, getPlayerBalance } from '../services/api';
import { GameSessionRequest } from '../services/api';

export interface UseGameSessionProps {
  walletAddress: string;
  onBalanceUpdate?: (balance: number) => void;
}

export function useGameSession({ walletAddress, onBalanceUpdate }: UseGameSessionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSessionResult, setLastSessionResult] = useState<any>(null);

  const saveGameSession = useCallback(async (
    score: number,
    wavesSurvived: number,
    isWin: boolean
  ) => {
    if (!walletAddress) {
      setSaveError('No wallet address provided');
      return null;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const sessionData: GameSessionRequest = {
          walletAddress,
          score,
          wavesSurvived,
          isWin,
          timestamp: undefined
      };

      const result = await completeGameSession(sessionData);
      setLastSessionResult(result);

      // Update balance
      const updatedPlayer = await getPlayerBalance(walletAddress);
      if (updatedPlayer && onBalanceUpdate) {
        onBalanceUpdate(updatedPlayer.softTokenBalance || 0);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save game session';
      setSaveError(errorMessage);
      console.error('Game session save error:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [walletAddress, onBalanceUpdate]);

  const calculateTokensEarned = useCallback((score: number, wavesSurvived: number): number => {
    const baseTokens = Math.floor(score / 100);
    const waveBonus = wavesSurvived * 5;
    const winBonus = wavesSurvived >= 10 ? 50 : 0;
    return baseTokens + waveBonus + winBonus;
  }, []);

  return {
    saveGameSession,
    isSaving,
    saveError,
    lastSessionResult,
    calculateTokensEarned,
  };
}