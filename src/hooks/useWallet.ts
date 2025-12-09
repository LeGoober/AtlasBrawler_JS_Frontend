import { useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CELO_SEPOLIA = {
  chainId: '0xAA36A7',
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedAddress = localStorage.getItem('walletAddress');
    const providerType = localStorage.getItem('providerType');
    const ethereum = window.ethereum;

    if (savedAddress && providerType === 'injected' && ethereum) {
      reconnectInjected(savedAddress);
    } else if (ethereum && ethereum.isMiniPay) {
      connectInjected(true);
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
    if (typeof window === 'undefined') return;

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

      if (typeof window !== 'undefined') {
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('providerType', 'injected');
      }

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

  const connectMetaMask = () => connectInjected(false);

  const connectMiniPay = () => connectInjected(true);

  const reconnectInjected = async (savedAddress: string) => {
    if (typeof window === 'undefined') return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.includes(savedAddress)) {
        await connectInjected(true);
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
    if (typeof window === 'undefined') return;

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ethereum = window.ethereum;
    if (!ethereum || !state.isConnected) return;

    const handleChange = () => {
      if (window.ethereum.isMiniPay) {
        connectInjected(true);
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
    connectMiniPay,
    disconnect,
    signMessage,
  };
}
