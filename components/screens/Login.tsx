import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../src/hooks/useWallet';

interface LoginProps {
  onLoginSuccess: (address: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { 
    address, 
    isConnected, 
    isLoading, 
    error, 
    isMiniPay, 
    connectMetaMask 
  } = useWallet();

  // Auto-login if already connected
  useEffect(() => {
    if (isConnected && address) {
      onLoginSuccess(address);
      navigate('/');
    }
  }, [isConnected, address, onLoginSuccess, navigate]);

  // Show loading state for MiniPay auto-connection
  if (isMiniPay && isLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: '"VT323", monospace',
        }}
      >
        <img
          src="/assets/atlas_brawler_logo_component.png"
          alt="Atlas Brawler"
          style={{ width: '300px', marginBottom: '40px', imageRendering: 'pixelated' }}
        />
        
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-celo-yellow mb-4"></div>
        <p style={{ fontSize: '24px', color: '#FFF600' }}>Connecting to MiniPay...</p>
        <p style={{ fontSize: '16px', color: '#aaa', marginTop: '20px' }}>
          Please check your MiniPay wallet
        </p>
      </div>
    );
  }

  // Hide login screen if already connected in MiniPay
  if (isMiniPay && isConnected) {
    return null;
  }

  const handleConnect = async () => {
    await connectMetaMask();
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: '"VT323", monospace',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <img
        src="/assets/atlas_brawler_logo_component.png"
        alt="Atlas Brawler"
        style={{ width: '300px', maxWidth: '80%', marginBottom: '40px', imageRendering: 'pixelated' }}
      />

      <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px', textShadow: '0 0 10px #FFF600' }}>
        {isMiniPay ? 'WELCOME SKATER' : 'LOGIN'}
      </h1>

      <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '40px', textAlign: 'center' }}>
        {isMiniPay
          ? 'Connected via MiniPay. Starting game...'
          : 'Connect wallet to enter the arena'}
      </p>

      {/* Only show button if NOT MiniPay (MiniPay connects automatically) */}
      {!isMiniPay && (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          style={{
            background: isLoading ? '#555' : 'linear-gradient(135deg, #f6851b 0%, #e2761b 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '18px 48px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(246, 133, 27, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            minWidth: '280px',
            justifyContent: 'center',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M21.5 12c0-5.24-4.26-9.5-9.5-9.5S2.5 6.76 2.5 12s4.26 9.5 9.5 9.5 9.5-4.26 9.5-9.5zm-11-5.5l3 3-3 3v-2H7v-2h3.5v-2zm3 11l-3-3 3-3v2h3.5v2H13.5v2z" />
          </svg>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}

      {error && (
        <p style={{ 
          marginTop: '20px', 
          color: '#ff6b6b', 
          background: 'rgba(255,107,107,0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {error}
        </p>
      )}

      {!isMiniPay && (
        <p style={{ marginTop: '50px', fontSize: '16px', color: '#666' }}>
          New here?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: '#FFF600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Create Account
          </span>
        </p>
      )}

      <div style={{ position: 'absolute', bottom: '20px', fontSize: '12px', color: '#444' }}>
        Celo Sepolia Testnet • {isMiniPay ? 'MiniPay Ready' : 'MetaMask Supported'}
      </div>
    </div>
  );
};

export default Login;