/**
 * Web3 Wallet Hook - MetaMask & Celo Integration
 */

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CELO_SEPOLIA_CHAIN_ID = '0xAA36A7'; // 11142220 in hex
const CELO_SEPOLIA_CONFIG = {
  chainId: CELO_SEPOLIA_CHAIN_ID,
  chainName: 'Celo Alfajores Testnet',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
  blockExplorerUrls: ['https://alfajores.celoscan.io'],
};

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress && window.ethereum) {
      setWalletState({
        address: savedAddress,
        isConnected: true,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        const newAddress = accounts[0];
        localStorage.setItem('walletAddress', newAddress);
        setWalletState({
          address: newAddress,
          isConnected: true,
          isLoading: false,
          error: null,
        });
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWallet = async (): Promise<string | null> => {
    if (!window.ethereum) {
      setWalletState({ ...walletState, error: 'MetaMask not installed' });
      return null;
    }

    setWalletState({ ...walletState, isLoading: true, error: null });

    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Switch to Celo Sepolia
      await switchToCeloSepolia();

      // Save to localStorage
      localStorage.setItem('walletAddress', address);

      setWalletState({
        address,
        isConnected: true,
        isLoading: false,
        error: null,
      });

      return address;
    } catch (error: any) {
      setWalletState({
        address: null,
        isConnected: false,
        isLoading: false,
        error: error.message || 'Failed to connect wallet',
      });
      return null;
    }
  };

  const switchToCeloSepolia = async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to Celo Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CELO_SEPOLIA_CONFIG],
          });
        } catch (addError: any) {
          throw new Error('Failed to add Celo network');
        }
      } else {
        throw switchError;
      }
    }
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!window.ethereum || !walletState.address) {
      return null;
    }

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletState.address],
      });

      return signature;
    } catch (error) {
      console.error('Sign message failed:', error);
      return null;
    }
  };

  const disconnect = () => {
    localStorage.removeItem('walletAddress');
    setWalletState({
      address: null,
      isConnected: false,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...walletState,
    connectWallet,
    switchToCeloSepolia,
    signMessage,
    disconnect,
  };
}
