/**
 * Login Screen - MetaMask Web3 Authentication
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../src/hooks/useWallet';

interface LoginProps {
  onLoginSuccess: (address: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { connectWallet, isLoading, error } = useWallet();
  const [status, setStatus] = useState<string>('');

  const handleMetaMaskLogin = async () => {
    setStatus('Connecting to MetaMask...');

    const address = await connectWallet();

    if (address) {
      setStatus('Connected! Redirecting...');
      onLoginSuccess(address);
      setTimeout(() => navigate('/'), 500);
    } else {
      setStatus('Connection failed. Please try again.');
    }
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
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Logo */}
      <img
        src="/assets/atlas_brawler_logo_component.png"
        alt="Atlas Brawler"
        style={{
          width: '300px',
          maxWidth: '80%',
          marginBottom: '40px',
          imageRendering: 'pixelated',
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        LOGIN
      </h1>

      <p
        style={{
          fontSize: '16px',
          color: '#aaa',
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        Connect your MetaMask wallet to play
      </p>

      {/* MetaMask Button */}
      <button
        onClick={handleMetaMaskLogin}
        disabled={isLoading}
        style={{
          background: isLoading ? '#555' : 'linear-gradient(135deg, #f6851b 0%, #e2761b 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 40px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(246, 133, 27, 0.4)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(246, 133, 27, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(246, 133, 27, 0.4)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M21.5 12c0-5.24-4.26-9.5-9.5-9.5S2.5 6.76 2.5 12s4.26 9.5 9.5 9.5 9.5-4.26 9.5-9.5zm-11-5.5l3 3-3 3v-2H7v-2h3.5v-2zm3 11l-3-3 3-3v2h3.5v2H13.5v2z" />
        </svg>
        {isLoading ? 'Connecting...' : 'Connect MetaMask'}
      </button>

      {/* Status Message */}
      {status && (
        <p
          style={{
            marginTop: '20px',
            fontSize: '14px',
            color: error ? '#ff6b6b' : '#FFF600',
            textAlign: 'center',
          }}
        >
          {status}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          style={{
            marginTop: '10px',
            fontSize: '14px',
            color: '#ff6b6b',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            maxWidth: '400px',
          }}
        >
          {error}
        </p>
      )}

      {/* Sign Up Link */}
      <p
        style={{
          marginTop: '40px',
          fontSize: '14px',
          color: '#aaa',
        }}
      >
        Don't have an account?{' '}
        <span
          onClick={() => navigate('/signup')}
          style={{
            color: '#FFF600',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Sign Up
        </span>
      </p>

      {/* Network Info */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        <p>Celo Alfajores Testnet</p>
        <p>Chain ID: 44787</p>
      </div>
    </div>
  );
};

export default Login;
