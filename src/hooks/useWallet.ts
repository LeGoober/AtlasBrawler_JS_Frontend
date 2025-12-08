// src/hooks/useWallet.ts
import { useState, useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any; // Injected provider (MetaMask, MiniPay, etc.)
  }
}

const CELO_SEPOLIA = {
  chainId: '0xAA36A7', // 11155111 in hex
  chainName: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: ['https://forno.sepolia.celo.org'],
  blockExplorerUrls: ['https://sepolia.celoscan.io'],
};

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  signer: JsonRpcSigner | null;
  isMiniPay: boolean; // New: Detect MiniPay for auto-connect/hide buttons
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

  // Auto-reconnect on mount (from localStorage or injected provider)
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    const providerType = localStorage.getItem('providerType');
    const ethereum = window.ethereum;

    if (savedAddress && providerType === 'injected' && ethereum) {
      // Reconnect injected (MetaMask or MiniPay)
      reconnectInjected(savedAddress);
    } else if (savedAddress && providerType === 'walletconnect') {
      // Reconnect WalletConnect (fallback)
      reconnectWalletConnect();
    } else if (ethereum && ethereum.isMiniPay) {
      // Auto-detect and connect MiniPay (implicit connection)
      connectInjected(true); // Silent connect
    }
  }, []);

  const ensureCeloSepolia = async (rawProvider: any) => {
    try {
      await rawProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_SEPOLIA.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902 || error.code === -32603) {
        await rawProvider.request({
          method: 'wallet_addEthereumChain',
          params: [CELO_SEPOLIA],
        });
      } else {
        throw error;
      }
    }

    const provider = new BrowserProvider(rawProvider);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== 11155111) {
      throw new Error('Please switch to Celo Sepolia network');
    }
  };

  const connectInjected = async (silent = false) => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      if (!silent) setState(s => ({ ...s, error: 'No injected wallet detected (MetaMask/MiniPay)' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      if (!silent) {
        await ethereum.request({ method: 'eth_requestAccounts' });
      }
      await ensureCeloSepolia(ethereum);

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const isMiniPay = !!ethereum.isMiniPay;

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

      return address;
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message || 'Injected wallet connection failed' }));
    }
  };

  const connectMetaMask = () => connectInjected(false); // Prompt for MetaMask

  const connectMiniPay = () => connectInjected(true); // Silent for MiniPay (but call if not auto-detected)

  const reconnectWalletConnect = async () => {
    const wc = new WalletConnectProvider({
      rpc: { 11155111: 'https://forno.sepolia.celo.org' },
      bridge: 'https://bridge.walletconnect.org',
    });

    try {
      await wc.enable();
      await ensureCeloSepolia(wc);

      const provider = new BrowserProvider(wc);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      localStorage.setItem('walletAddress', address);
      localStorage.setItem('providerType', 'walletconnect');

      setState({
        address,
        isConnected: true,
        isLoading: false,
        error: null,
        signer,
        isMiniPay: false,
      });
    } catch (err: any) {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('providerType');
      console.error('WalletConnect reconnect failed:', err);
    }
  };

  const reconnectInjected = async (savedAddress: string) => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.includes(savedAddress)) {
        await connectInjected(true); // Silent reconnect
      } else {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('providerType');
      }
    } catch (err) {
      console.error('Injected reconnect failed:', err);
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('providerType');
    }
  };

  const disconnect = () => {
    if (state.signer?.provider && typeof (state.signer.provider as any).disconnect === 'function') {
      (state.signer.provider as any).disconnect();
    }
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

  // Event listeners for chain/account changes
  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum || !state.isConnected) return;

    const handleChange = () => {
      if (window.ethereum.isMiniPay) {
        connectInjected(true); // Reconnect on MiniPay
      } else {
        connectInjected(false);
      }
    };

    ethereum.on('accountsChanged', handleChange);
    ethereum.on('chainChanged', handleChange);

    return () => {
      ethereum.removeListener('accountsChanged', handleChange);
      ethereum.removeListener('chainChanged', handleChange);
    };
  }, [state.isConnected]);

  const signMessage = async (message: string): Promise<string | null> => {
    if (!state.signer) return null;
    try {
      return await state.signer.signMessage(message);
    } catch (err) {
      console.error('Sign failed:', err);
      return null;
    }
  };

  return {
    ...state,
    connectMetaMask,
    connectMiniPay, // Use this in components, but auto-triggers for MiniPay
    reconnectWalletConnect,
    disconnect,
    signMessage,
  };
}