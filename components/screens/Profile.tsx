import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Trophy, TrendingUp, RefreshCw } from 'lucide-react';
import { ScreenContainer, Header } from '../Shared';
import { getPlayerBalance } from '../../src/services/api';

interface ProfileProps {
  balance: number;
  walletAddress: string;
}

const Profile: React.FC<ProfileProps> = ({ balance, walletAddress }) => {
  const [playerData, setPlayerData] = useState({
    username: 'Skater',
    wins: 0,
    gamesPlayed: 0,
    highScore: 0,
    softTokenBalance: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (walletAddress) {
        try {
          const player = await getPlayerBalance(walletAddress);
          if (!player) {
            setPlayerData({ 
              username: 'Skater', 
              wins: 0, 
              gamesPlayed: 0, 
              highScore: 0,
              softTokenBalance: balance 
            });
            return;
          }
          setPlayerData({
            username: player.username || 'Skater',
            wins: player.totalWins || 0,
            gamesPlayed: player.totalGamesPlayed || 0,
            highScore: player.highScore || 0,
            softTokenBalance: player.softTokenBalance || balance,
          });
        } catch (err) {
          console.error('Failed to fetch player data:', err);
        }
      }
    };

    fetchProfileData();
    
    const intervalId = setInterval(fetchProfileData, 15000);
    
    return () => clearInterval(intervalId);
  }, [walletAddress, balance]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const winRate = playerData.gamesPlayed > 0 
    ? ((playerData.wins / playerData.gamesPlayed) * 100).toFixed(1)
    : '0.0';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const player = await getPlayerBalance(walletAddress);
      if (player) {
        setPlayerData({
          username: player.username || 'Skater',
          wins: player.totalWins || 0,
          gamesPlayed: player.totalGamesPlayed || 0,
          highScore: player.highScore || 0,
          softTokenBalance: player.softTokenBalance || balance,
        });
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ScreenContainer className="bg-[#87CEEB]">
      <Header balance={playerData.softTokenBalance} showBack title="PROFILE" />
      
      <div className="relative h-full flex flex-col items-center p-6 overflow-hidden">
         
         {/* Background Clouds */}
         <div className="absolute top-20 left-[-50px] w-40 h-20 bg-white rounded-full blur-md opacity-80"></div>
         <div className="absolute top-40 right-[-20px] w-60 h-32 bg-white rounded-full blur-xl opacity-60"></div>
         
         {/* Main Profile Card */}
         <div className="relative z-10 w-full max-w-md mt-8">
             <div className="bg-white border-4 border-black p-8 rounded-[3rem] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                
                {/* Avatar and Refresh */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-celo-yellow border-4 border-black rounded-full flex items-center justify-center overflow-hidden">
                    <div className="w-16 h-16 bg-black rounded-full opacity-20 animate-pulse"></div>
                    <button 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="absolute bottom-1 right-1 bg-black/80 text-white p-1 rounded-full"
                    >
                      <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="mt-10 text-center">
                    <h2 className="font-retro text-3xl text-black mb-1">{playerData.username}</h2>
                    <div className="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg border border-dashed border-gray-400">
                        <span className="font-mono text-xs text-gray-600 truncate max-w-[150px]">
                          {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'N/A'}
                        </span>
                        <button onClick={copyAddress} className="text-gray-500 hover:text-black">
                          {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                    </div>
                    {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 p-3 border-2 border-black text-center">
                        <span className="block font-retro text-2xl text-blue-600">{playerData.wins}</span>
                        <span className="text-xs font-bold uppercase text-gray-500">Wins</span>
                    </div>
                    <div className="bg-red-50 p-3 border-2 border-black text-center">
                        <span className="block font-retro text-2xl text-red-600">{playerData.gamesPlayed - playerData.wins}</span>
                        <span className="text-xs font-bold uppercase text-gray-500">Losses</span>
                    </div>
                    <div className="bg-green-50 p-3 border-2 border-black text-center">
                        <span className="block font-retro text-2xl text-green-600">{playerData.gamesPlayed}</span>
                        <span className="text-xs font-bold uppercase text-gray-500">Total</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-yellow-50 p-3 border-2 border-black text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp size={16} className="text-purple-600" />
                          <span className="font-retro text-xl text-purple-600">{winRate}%</span>
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-500">Win Rate</span>
                    </div>
                    <div className="bg-purple-50 p-3 border-2 border-black text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy size={16} className="text-yellow-600" />
                          <span className="font-retro text-xl text-yellow-600">{playerData.highScore}</span>
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-500">High Score</span>
                    </div>
                </div>
             </div>
         </div>

         {/* Friends / Add Section */}
         <div className="w-full max-w-md mt-6 relative z-10">
            <div className="bg-[#e0b0ff] border-4 border-black border-dashed p-4 transform rotate-1">
                 <h3 className="font-retro text-xl text-black mb-4 uppercase flex items-center gap-2">
                    <CheckCircle size={20} /> 
                    Add Friend
                 </h3>
                 <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Paste Wallet Address..." 
                        className="w-full p-3 font-mono text-sm border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-celo-yellow"
                    />
                    <button className="w-full bg-black text-white font-retro text-lg py-2 border-2 border-transparent hover:bg-gray-800 active:scale-95 transition-all">
                        SEND INVITE
                    </button>
                 </div>
            </div>
            <p className="mt-4 text-center font-mono text-xs text-black/60 max-w-xs mx-auto">
                Add friends' addresses to claim tokens and collect their tags in the streets.
            </p>
         </div>

      </div>
    </ScreenContainer>
  );
};

export default Profile;