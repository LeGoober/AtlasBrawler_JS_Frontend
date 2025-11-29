/**
 * Signup Screen - Register new player with MetaMask
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../src/hooks/useWallet';
import { registerPlayer } from '../../src/services/api';

interface SignupProps {
  onSignupSuccess: (address: string, username: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const { connectWallet, signMessage, address, isLoading } = useWallet();
  const [username, setUsername] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'connect' | 'username' | 'sign'>('connect');

  const handleConnectWallet = async () => {
    setStatus('Connecting to MetaMask...');
    setError('');

    const walletAddress = await connectWallet();

    if (walletAddress) {
      setStatus('Wallet connected!');
      setStep('username');
    } else {
      setError('Failed to connect wallet');
      setStatus('');
    }
  };

  const handleSubmitUsername = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setError('');
    setStep('sign');
  };

  const handleSignAndRegister = async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setStatus('Please sign the message in MetaMask...');
    setError('');

    const message = `Welcome to Atlas Brawler!\n\nSign this message to create your account.\n\nUsername: ${username}\nWallet: ${address}\nTimestamp: ${Date.now()}`;

    const signature = await signMessage(message);

    if (!signature) {
      setError('Signature failed. Please try again.');
      setStatus('');
      return;
    }

    setStatus('Registering player...');

    try {
      const response = await registerPlayer(address, username, signature, message);
      setStatus('Registration successful! Redirecting...');
      onSignupSuccess(address, username);
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setStatus('');
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
        SIGN UP
      </h1>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '30px',
        }}
      >
        {['connect', 'username', 'sign'].map((s, i) => (
          <div
            key={s}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: step === s ? '#FFF600' : '#444',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Step 1: Connect Wallet */}
      {step === 'connect' && (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ fontSize: '16px', color: '#aaa', marginBottom: '30px' }}>
            Connect your MetaMask wallet to get started
          </p>
          <button
            onClick={handleConnectWallet}
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
            }}
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      )}

      {/* Step 2: Enter Username */}
      {step === 'username' && (
        <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <p style={{ fontSize: '16px', color: '#aaa', marginBottom: '20px' }}>
            Choose a username for your skater
          </p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            maxLength={20}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #333',
              background: '#1a1a2e',
              color: 'white',
              marginBottom: '20px',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleSubmitUsername}
            style={{
              background: 'linear-gradient(135deg, #FFF600 0%, #FFD700 100%)',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 246, 0, 0.4)',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Sign Message */}
      {step === 'sign' && (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ fontSize: '16px', color: '#aaa', marginBottom: '30px' }}>
            Sign a message to complete registration
          </p>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#ccc',
            }}
          >
            <p>Username: {username}</p>
            <p style={{ fontSize: '12px', marginTop: '8px', wordBreak: 'break-all' }}>
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </p>
          </div>
          <button
            onClick={handleSignAndRegister}
            style={{
              background: 'linear-gradient(135deg, #FFF600 0%, #FFD700 100%)',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 246, 0, 0.4)',
            }}
          >
            Sign & Register
          </button>
        </div>
      )}

      {/* Status & Error Messages */}
      {status && (
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#FFF600' }}>
          {status}
        </p>
      )}
      {error && (
        <p
          style={{
            marginTop: '10px',
            fontSize: '14px',
            color: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            padding: '12px',
            borderRadius: '8px',
          }}
        >
          {error}
        </p>
      )}

      {/* Login Link */}
      <p style={{ marginTop: '40px', fontSize: '14px', color: '#aaa' }}>
        Already have an account?{' '}
        <span
          onClick={() => navigate('/login')}
          style={{
            color: '#FFF600',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Signup;
