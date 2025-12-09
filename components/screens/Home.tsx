import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Settings, Play, Wallet, RefreshCw } from 'lucide-react';
import { RetroButton, Header, ScreenContainer } from '../Shared';
import { ASSETS, COLORS } from '../../src/constants';
import { getPlayerBalance } from '../../src/services/api';

interface HomeProps {
  balance: number;
  walletAddress: string;
  onRefreshBalance: () => Promise<void>; // Changed to Promise<void>
}

const Home: React.FC<HomeProps> = ({ balance, walletAddress, onRefreshBalance }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [playerStats, setPlayerStats] = useState({
    totalWins: 0,
    totalGames: 0,
    username: 'Skater'
  });

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      // Call the parent's refresh function (returns Promise<void>)
      await onRefreshBalance();
      
      // Also fetch latest player stats separately
      if (walletAddress) {
        try {
          const player = await getPlayerBalance(walletAddress);
          if (player) {
            setPlayerStats({
              totalWins: player.totalWins || 0,
              totalGames: player.totalGamesPlayed || 0,
              username: player.username || 'Skater'
            });
          }
        } catch (err) {
          console.log('Failed to fetch player stats:', err);
        }
      }
      
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.log('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const updateTimestamp = () => {
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTimestamp();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        onRefreshBalance();
        updateTimestamp();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [onRefreshBalance]);

  useEffect(() => {
    if (walletAddress) {
      getPlayerBalance(walletAddress)
        .then((player) => {
          if (player) {
            setPlayerStats({
              totalWins: player.totalWins || 0,
              totalGames: player.totalGamesPlayed || 0,
              username: player.username || 'Skater'
            });
          }
        })
        .catch((err) => console.log('Failed to fetch player stats:', err));
    }
  }, [walletAddress]);

  const winRate = playerStats.totalGames > 0 
    ? ((playerStats.totalWins / playerStats.totalGames) * 100).toFixed(1)
    : '0.0';

  return (
    <ScreenContainer>
      <Header balance={balance} />

      <div className="flex flex-col h-[calc(100vh-64px)] relative">
        {/* Background Elements */}
        <div className="absolute inset-0" style={{ backgroundColor: COLORS.CELO_YELLOW }}></div>

        {/* Balance Refresh Button */}
        <div className="absolute top-15 right-4 z-10">
          <button
            onClick={handleRefreshBalance}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full text-white text-sm font-retro hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
          {lastUpdated && (
            <p className="text-xs text-white/60 mt-1 text-center">
              Updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Player Stats */}
        <div className="absolute top-15 left-4 z-10 bg-black/40 backdrop-blur-sm border border-white/20 p-2 rounded-lg">
          <div className="text-white text-sm font-retro">
            <div className="text-xs text-gray-300">@{playerStats.username}</div>
            <div className="flex gap-4 mt-1">
              <div className="text-center">
                <div className="text-green-400">{playerStats.totalWins}</div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400">{winRate}%</div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Character Preview Area */}
        <div className="flex-1 flex items-center justify-center relative p-4 md:p-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] h-[22rem] bg-white/5 rounded-full blur-xl animate-pulse md:left-28 md:-translate-x-0 md:w-[36rem] md:h-[36rem]"></div>

          <div className="z-20 flex flex-col items-center justify-center w-full">
            <img
              src="assets/atlas_brawler_logo_component.png"
              alt="Atlas Brawler Logo"
              className="w-64 h-auto"
            />

            <div className="w-[86vw] max-w-[32rem] md:max-w-[42rem] border-4 border-black shadow-[0px_10px_0px_0px_#FFF600] transform -rotate-2 overflow-hidden bg-gray-800 mt-4">
              <img
                src={ASSETS.SKATER_IDLE}
                alt="Character"
                className="w-full h-180 object-contain"
                style={{ display: 'block', height: '100%' }}
              />
            </div>

            {/* Balance Indicator */}
            <div className="mt-4 bg-black/40 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-celo-yellow" />
                <span className="font-retro text-white">
                  {balance.toFixed(2)} ATLAS
                </span>
                <span className="text-xs text-gray-300">
                  (${(balance * 0.1).toFixed(2)} cUSD)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="p-3 pb-6 sm:p-4 sm:pb-8 flex flex-col gap-3 sm:gap-4 z-20">
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <RetroButton
                label="Settings"
                icon={<Settings size={16} />}
                variant="primary"
                onClick={() => navigate('/settings')}
                className="w-full text-sm"
              />
            </div>
            <div className="w-16">
              <RetroButton
                label=""
                icon={<User size={20} />}
                variant="primary"
                onClick={() => navigate('/profile')}
                className="w-full flex justify-center"
              />
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <RetroButton
                label="Market"
                icon={<ShoppingBag size={16} />}
                variant="primary"
                onClick={() => navigate('/shop')}
                className="w-full text-sm"
              />
            </div>
            <div className="flex-2 w-full">
              <RetroButton
                label="Play" 
                icon={<Play size={20} fill="currentColor" />} 
                variant="secondary" 
                onClick={() => navigate('/game')}
                className="w-full font-black text-xl sm:text-2xl"
              />
            </div>
          </div>

          <div className="bg-black/40 p-2 border border-white/20 mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-retro uppercase">
              <div className="flex items-center gap-2">
                <Wallet size={12} />
                <span>Network: Celo Sepolia</span>
                <span className="text-celo-yellow">● Live</span>
              </div>
              <div className="text-xs text-gray-500">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not Connected'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default Home;