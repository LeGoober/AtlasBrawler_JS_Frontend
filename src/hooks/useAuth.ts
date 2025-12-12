import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { getPlayerBalance } from '../services/api';

export function useAuth() {
  const { address, isConnected } = useWallet();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!address || !isConnected) {
        setIsRegistered(null);
        setIsLoading(false);
        return;
      }

      try {
        const player = await getPlayerBalance(address);
        setIsRegistered(player !== null);
      } catch (err) {
        console.error('Failed to check registration:', err);
        setIsRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [address, isConnected]);

  return {
    isRegistered,
    isLoading,
    address,
    isConnected,
  };
}
