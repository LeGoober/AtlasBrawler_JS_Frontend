import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
    celo?: any;
    miniPay?: any;
  }
}

// Updated to correct Celo Sepolia configuration
const CELO_SEPOLIA = {
  chainId: '0xaef3', // Celo Sepolia actually uses Alfajores (44787 decimal)
  chainName: 'Celo Sepolia',
  nativeCurrency: { 
    name: 'CELO', 
    symbol: 'CELO', 
    decimals: 18 
  },
  rpcUrls: ['https://alfajores-forno.celo-testnet.org'], // Use Alfajores for Sepolia
  blockExplorerUrls: ['https://alfajores.celoscan.io/'],
};

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  signer: JsonRpcSigner | null;
  isMiniPay: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoading: false,
    error: null,
    signer: null,
    isMiniPay: false,
  });

  // Check if we're in MiniPay browser
  const isMiniPayBrowser = (): boolean => {
    const win = window as Window;
    return !!(win.miniPay || 
              win.celo || 
              navigator.userAgent.includes('MiniPay') || 
              (win.ethereum && win.ethereum.isMiniPay));
  };

  // Check for existing connection on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkConnection = async () => {
      const ethereum = window.ethereum;
      const isMiniPay = isMiniPayBrowser();
      
      if (isMiniPay) {
        console.log('MiniPay browser detected');
        setState(s => ({ ...s, isMiniPay: true }));
      }

      if (ethereum) {
        try {
          // Check if already connected
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            console.log('Found existing connection:', accounts[0]);
            
            // Ensure correct network
            await ensureCeloSepolia(ethereum);
            
            const provider = new BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            setState({
              address,
              isConnected: true,
              isLoading: false,
              error: null,
              signer,
              isMiniPay,
            });

            localStorage.setItem('walletAddress', address);
            localStorage.setItem('providerType', 'injected');
          }
        } catch (err) {
          console.log('No existing connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  const ensureCeloSepolia = async (rawProvider: any) => {
    try {
      // Try to switch to Celo Sepolia
      await rawProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_SEPOLIA.chainId }],
      });
    } catch (error: any) {
      console.log('Switch error:', error);
      
      // If chain doesn't exist, add it
      if (error.code === 4902 || error.code === -32603) {
        try {
          await rawProvider.request({
            method: 'wallet_addEthereumChain',
            params: [CELO_SEPOLIA],
          });
        } catch (addError) {
          console.warn('Failed to add Celo network:', addError);
          throw new Error('Please add Celo Sepolia network to your wallet');
        }
      } else {
        throw error;
      }
    }

    // Verify we're on the correct network
    try {
      const provider = new BrowserProvider(rawProvider);
      const network = await provider.getNetwork();
      console.log('Current network:', Number(network.chainId));
      
      if (Number(network.chainId) !== 44787) { // 44787 = 0xaef3
        console.warn('Not on Celo Sepolia, current chain:', network.chainId);
      }
    } catch (err) {
      console.warn('Could not verify network:', err);
    }
  };

  const connectWallet = async (silent = false) => {
    if (typeof window === 'undefined') {
      setState(s => ({ ...s, error: 'Window not available' }));
      return;
    }

    const isMiniPay = isMiniPayBrowser();
    const ethereum = window.ethereum || window.miniPay || window.celo;
    
    if (!ethereum) {
      if (!silent) {
        setState(s => ({ 
          ...s, 
          error: isMiniPay 
            ? 'MiniPay not available. Please open in Opera MiniPay browser.' 
            : 'No wallet detected. Please install MetaMask or use Opera MiniPay.'
        }));
      }
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      // Request accounts
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts received');
      }

      // Ensure we're on Celo Sepolia (skip for MiniPay as it auto-switches)
      if (!isMiniPay) {
        await ensureCeloSepolia(ethereum);
      }

      // Get signer
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Save to localStorage
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('providerType', 'injected');

      setState({
        address,
        isConnected: true,
        isLoading: false,
        error: null,
        signer,
        isMiniPay,
      });

      console.log('Wallet connected:', { address, isMiniPay });

      return address;
    } catch (err: any) {
      console.error('Connection error:', err);
      
      let errorMessage = 'Connection failed';
      if (err.code === 4001) {
        errorMessage = 'Connection rejected';
      } else if (err.code === -32002) {
        errorMessage = 'Connection already pending. Check your wallet.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setState(s => ({ 
        ...s, 
        isLoading: false, 
        error: !silent ? errorMessage : null 
      }));
    }
  };

  const connectMetaMask = () => connectWallet(false);

  const connectMiniPay = async () => {
    // MiniPay should auto-connect, but we try anyway
    return connectWallet(true);
  };

  const disconnect = () => {
    if (typeof window === 'undefined') return;

    // Clean up any wallet connection
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('providerType');
    
    setState({
      address: null,
      isConnected: false,
      isLoading: false,
      error: null,
      signer: null,
      isMiniPay: false,
    });
  };

  // Listen for account changes
  useEffect(() => {
    const ethereum = window.ethereum || window.miniPay || window.celo;
    if (!ethereum || !state.isConnected) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        // User disconnected all accounts
        disconnect();
      } else if (accounts[0] !== state.address) {
        // Account changed
        setState(s => ({ ...s, address: accounts[0] }));
        localStorage.setItem('walletAddress', accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
      // Reload the page on network change
      window.location.reload();
    };

    // Add event listeners
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    // Cleanup
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.isConnected, state.address]);

  const signMessage = async (message: string): Promise<string | null> => {
    if (!state.signer || !state.address) {
      setState(s => ({ ...s, error: 'Wallet not connected' }));
      return null;
    }

    try {
      // Use personal_sign for better compatibility
      const ethereum = window.ethereum || window.miniPay || window.celo;
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, state.address],
      });
      
      return signature;
    } catch (err: any) {
      console.error('Sign failed:', err);
      setState(s => ({ 
        ...s, 
        error: err.message || 'Failed to sign message' 
      }));
      return null;
    }
  };

  // Auto-connect MiniPay on mount if detected
  useEffect(() => {
    if (isMiniPayBrowser() && !state.isConnected && !state.isLoading) {
      console.log('Auto-connecting MiniPay...');
      const timer = setTimeout(() => {
        connectMiniPay();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.isConnected, state.isLoading]);

  return {
    ...state,
    connectMetaMask,
    connectMiniPay,
    disconnect,
    signMessage,
  };
}