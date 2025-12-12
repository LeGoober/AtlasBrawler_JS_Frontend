// src/components/screens/Signup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useSignMessage } from 'wagmi';
import {useWallet} from '../../src/hooks/useWallet.ts'
import { registerPlayer } from '../../src/services/api';

interface SignupProps {
    onSignupSuccess: (address: string, username: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
    const navigate = useNavigate();
    const { open } = useWeb3Modal();
    const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    
    const {
        address: legacyAddress,
        isConnected: legacyConnected,
        isLoading,
        error,
        isMiniPay,
        connectMetaMask,
        signMessage: legacySignMessage,
    } = useWallet();

    // Use WalletConnect address if available, otherwise legacy
    const address = wagmiAddress || legacyAddress;
    const isConnected = wagmiConnected || legacyConnected;

    const [username, setUsername] = useState('');
    const [status, setStatus] = useState('');
    const [localError, setLocalError] = useState('');

    // Auto-connect in MiniPay on mount
    useEffect(() => {
        if (isMiniPay && !isConnected) {
            connectMetaMask(); // Silent connect
        }
    }, [isMiniPay, isConnected, connectMetaMask]);

    // Auto-redirect if already connected (user exists or just signed up)
    useEffect(() => {
        if (isConnected && address) {
            // Optional: check if user exists in backend → for now just go home
            onSignupSuccess(address, username || 'Skater');
            setTimeout(() => navigate('/'), 800);
        }
    }, [isConnected, address, username, onSignupSuccess, navigate]);

    const handleRegister = async () => {
        if (!address) return;

        // Validate username
        const trimmed = username.trim();
        if (!trimmed || trimmed.length < 3 || trimmed.length > 20) {
            setLocalError('Username must be 3–20 characters');
            return;
        }

        setStatus('Sign message in wallet...');
        setLocalError('');

        const message = `Atlas Brawler Registration\n\nUsername: ${trimmed}\nAddress: ${address}\nTime: ${Date.now()}`;

        try {
            // Try WalletConnect signature first, fallback to legacy
            let signature: string;
            if (wagmiConnected) {
                signature = await signMessageAsync({ message });
            } else {
                const sig = await legacySignMessage(message);
                if (!sig) {
                    setLocalError('Signature rejected');
                    setStatus('');
                    return;
                }
                signature = sig;
            }

            setStatus('Creating your skater...');

            await registerPlayer(address, trimmed, signature, message);
            setStatus('Welcome to the streets!');
            onSignupSuccess(address, trimmed);
            setTimeout(() => navigate('/'), 1200);
        } catch (err: any) {
            setLocalError(err.message || 'Registration failed — try again');
            setStatus('');
        }
    };

    // MiniPay: Super clean flow — just ask for username
    if (isMiniPay) {
        return (
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF600',
                    fontFamily: '"VT323", monospace',
                    textAlign: 'center',
                    padding: '20px',
                    boxSizing: 'border-box',
                }}
            >
                <img
                    src="/assets/atlas_brawler_logo_component.png"
                    alt="Atlas Brawler"
                    style={{ width: '260px', marginBottom: '40px', imageRendering: 'pixelated' }}
                />

                <h1 style={{ fontSize: '48px', marginBottom: '20px', textShadow: '0 0 20px #FFF600' }}>
                    CHOOSE YOUR TAG
                </h1>

                <p style={{ fontSize: '20px', color: '#aaa', marginBottom: '40px' }}>
                    Connected via MiniPay
                </p>

                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    placeholder="Enter username"
                    autoFocus
                    style={{
                        width: '320px',
                        maxWidth: '90%',
                        padding: '18px',
                        fontSize: '24px',
                        background: '#16213E',
                        border: '4px solid #FFF600',
                        borderRadius: '16px',
                        color: '#FFF600',
                        textAlign: 'center',
                        fontFamily: 'inherit',
                        marginBottom: '30px',
                    }}
                />

                <button
                    onClick={handleRegister}
                    disabled={!username.trim() || username.length < 3}
                    style={{
                        padding: '18px 60px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        background: username.trim().length >= 3
                            ? 'linear-gradient(135deg, #FFF600, #FFD700)'
                            : '#444',
                        color: '#000',
                        border: 'none',
                        borderRadius: '16px',
                        cursor: username.trim().length >= 3 ? 'pointer' : 'not-allowed',
                        boxShadow: '0 8px 30px rgba(255,246,0,0.4)',
                    }}
                >
                    {status || 'LOCK IT IN'}
                </button>

                {(localError || error) && (
                    <p style={{ marginTop: '20px', color: '#ff6b6b', fontSize: '18px' }}>
                        {localError || error}
                    </p>
                )}

                <div style={{ position: 'absolute', bottom: '30px', color: '#666', fontSize: '14px' }}>
                    Celo Mainnet • MiniPay Native
                </div>
            </div>
        );
    }

    // Regular browser flow (MetaMask)
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: '"VT323", monospace',
                padding: '20px',
            }}
        >
            <img
                src="/assets/atlas_brawler_logo_component.png"
                alt="Atlas Brawler"
                style={{ width: '300px', marginBottom: '40px', imageRendering: 'pixelated' }}
            />

            <h1 style={{ fontSize: '48px', marginBottom: '30px', textShadow: '0 0 15px #FFF600' }}>
                SIGN UP
            </h1>

            {!isConnected ? (
                <>
                    <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '20px' }}>
                        Connect your MiniPay wallet
                    </p>
                    <p style={{ color: '#888', marginBottom: '40px', fontSize: '16px', maxWidth: '400px' }}>
                        Click below to show QR code. Scan with MiniPay app.
                    </p>
                    <button
                        onClick={() => open()}
                        disabled={isLoading}
                        style={{
                            padding: '18px 60px',
                            fontSize: '22px',
                            background: 'linear-gradient(135deg, #FFF600, #FFD700)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 8px 30px rgba(255,246,0,0.3)',
                            marginBottom: '20px',
                        }}
                    >
                        {isLoading ? 'Connecting...' : 'Connect MiniPay'}
                    </button>
                    <p style={{ color: '#666', fontSize: '14px' }}>or</p>
                    <button
                        onClick={connectMetaMask}
                        disabled={isLoading}
                        style={{
                            padding: '14px 40px',
                            fontSize: '18px',
                            background: 'transparent',
                            color: '#FFF600',
                            border: '2px solid #FFF600',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            marginTop: '10px',
                        }}
                    >
                        Connect MetaMask
                    </button>
                </>
            ) : (
                <>
                    <p style={{ color: '#aaa', marginBottom: '20px' }}>Wallet connected!</p>

                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                        placeholder="Choose your username"
                        style={{
                            padding: '16px',
                            fontSize: '20px',
                            width: '320px',
                            background: '#16213E',
                            border: '3px solid #FFF600',
                            borderRadius: '12px',
                            color: '#FFF600',
                            textAlign: 'center',
                            marginBottom: '30px',
                        }}
                    />

                    <button
                        onClick={handleRegister}
                        disabled={!username.trim() || username.length < 3}
                        style={{
                            padding: '18px 60px',
                            fontSize: '24px',
                            background: username.trim().length >= 3
                                ? 'linear-gradient(135deg, #FFF600, #FFD700)'
                                : '#555',
                            color: username.trim().length >= 3 ? '#000' : '#aaa',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            cursor: username.trim().length >= 3 ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {status || 'Sign & Join'}
                    </button>
                </>
            )}

            {(error || localError) && (
                <p style={{ marginTop: '20px', color: '#ff6b6b', fontSize: '18px' }}>
                    {error || localError}
                </p>
            )}

            <p style={{ marginTop: '50px', color: '#666' }}>
                Have an account?{' '}
                <span
                    onClick={() => navigate('/login')}
                    style={{ color: '#FFF600', cursor: 'pointer', textDecoration: 'underline' }}
                >
          Login
        </span>
            </p>
        </div>
    );
};

export default Signup;
