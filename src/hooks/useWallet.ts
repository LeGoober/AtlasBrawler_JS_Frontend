import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { WalletConnection } from '../types';
import { updateLastWalletAddress } from '../utils/gameSettings';

declare global {
  interface Window {
    ethereum?: any;
    celo?: any;
    miniPay?: any;
  }
}

const CELO_MAINNET = {
  chainId: '0xa4ec',
  chainName: 'Celo Mainnet',
  nativeCurrency: { 
    name: 'CELO', 
    symbol: 'CELO', 
    decimals: 18 
  },
  rpcUrls: ['https://forno.celo.org'],
  blockExplorerUrls: ['https://celoscan.io/'],
};

// Testnet config (for development)
// const CELO_SEPOLIA = {
//   chainId: '0xaef3',
//   chainName: 'Celo Sepolia',
//   nativeCurrency: { 
//     name: 'CELO', 
//     symbol: 'CELO', 
//     decimals: 18 
//   },
//   rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
//   blockExplorerUrls: ['https://alfajores.celoscan.io/'],
// };

export function useWallet() {
  const [state, setState] = useState<WalletConnection>({
    address: null,
    isConnected: false,
    isLoading: false,
    error: null,
    isMiniPay: false,
  });

  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const isMiniPayBrowser = (): boolean => {
    const win = window as Window;
    return !!(win.miniPay || 
              win.celo || 
              navigator.userAgent.includes('MiniPay') || 
              (win.ethereum && win.ethereum.isMiniPay));
  };

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
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            console.log('Found existing connection:', accounts[0]);
            
            await ensureCeloMainnet(ethereum);
            
            const provider = new BrowserProvider(ethereum);
            const signerInstance = await provider.getSigner();
            const address = await signerInstance.getAddress();
            
            setState({
              address,
              isConnected: true,
              isLoading: false,
              error: null,
              isMiniPay,
            });
            
            setSigner(signerInstance);

            localStorage.setItem('walletAddress', address);
            localStorage.setItem('providerType', 'injected');
            updateLastWalletAddress(address);
          }
        } catch (err) {
          console.log('No existing connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  const ensureCeloMainnet = async (rawProvider: any) => {
    try {
      await rawProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_MAINNET.chainId }],
      });
    } catch (error: any) {
      console.log('Switch error:', error);
      
      if (error.code === 4902 || error.code === -32603) {
        try {
          await rawProvider.request({
            method: 'wallet_addEthereumChain',
            params: [CELO_MAINNET],
          });
        } catch (addError) {
          console.warn('Failed to add Celo network:', addError);
          throw new Error('Please add Celo Mainnet network to your wallet');
        }
      } else {
        throw error;
      }
    }

    try {
      const provider = new BrowserProvider(rawProvider);
      const network = await provider.getNetwork();
      console.log('Current network:', Number(network.chainId));
      
      if (Number(network.chainId) !== 42220) {
        console.warn('Not on Celo Mainnet, current chain:', network.chainId);
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
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts received');
      }

      if (!isMiniPay) {
        await ensureCeloMainnet(ethereum);
      }

      const provider = new BrowserProvider(ethereum);
      const signerInstance = await provider.getSigner();
      const address = await signerInstance.getAddress();

      localStorage.setItem('walletAddress', address);
      localStorage.setItem('providerType', 'injected');
      updateLastWalletAddress(address);

      setState({
        address,
        isConnected: true,
        isLoading: false,
        error: null,
        isMiniPay,
      });
      
      setSigner(signerInstance);

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
    return connectWallet(true);
  };

  const disconnect = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('walletAddress');
    localStorage.removeItem('providerType');
    
    setState({
      address: null,
      isConnected: false,
      isLoading: false,
      error: null,
      isMiniPay: false,
    });
    
    setSigner(null);
  };

  useEffect(() => {
    const ethereum = window.ethereum || window.miniPay || window.celo;
    if (!ethereum || !state.isConnected) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.address) {
        setState(s => ({ ...s, address: accounts[0] }));
        localStorage.setItem('walletAddress', accounts[0]);
        updateLastWalletAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.isConnected, state.address]);

  const signMessage = async (message: string): Promise<string | null> => {
    if (!signer || !state.address) {
      setState(s => ({ ...s, error: 'Wallet not connected' }));
      return null;
    }

    try {
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
    signer,
    connectMetaMask,
    connectMiniPay,
    disconnect,
    signMessage,
  };
}