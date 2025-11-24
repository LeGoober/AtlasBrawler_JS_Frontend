import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Settings, Play, Wallet } from 'lucide-react';
import { RetroButton, Header, ScreenContainer } from '../Shared';
import { ASSETS, COLORS } from '../../constants';

const Home: React.FC<{ balance: number }> = ({ balance }) => {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <Header balance={balance} />

      <div className="flex flex-col h-[calc(100vh-64px)] relative">
        {/* Background Elements (use CELO yellow from constants) */}
        <div className="absolute inset-0" style={{ backgroundColor: COLORS.CELO_YELLOW }}></div>

        {/* Character Preview Area */}
        <div className="flex-1 flex items-center justify-center relative p-4 md:p-8">
          {/* Pulse background - centered on mobile, offset on md+ */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] h-[22rem] bg-white/5 rounded-full blur-xl animate-pulse md:left-28 md:-translate-x-0 md:w-[36rem] md:h-[36rem]"></div>

          {/* Centered stack: logo above the character frame (mobile-first) */}
          <div className="z-20 flex flex-col items-center justify-center w-full">
            <img
              src="assets/atlas_brawler_logo_component.png"
              alt="Atlas Brawler Logo"
            />

            <div className="w-[86vw] max-w-[32rem] md:max-w-[28rem] border-4 border-black shadow-[0px_10px_0px_0px_#FFF600] transform -rotate-2 overflow-hidden bg-gray-800">
              <img
                src={ASSETS.SKATER_IDLE}
                alt="Character"
                className="w-full h-180 object-contain"
                style={{ display: 'block', height: '100%' }}
              />
            </div>

            <div className="w-36 md:w-56 h-4 md:h-5 bg-black/50 blur-md mt-3 rounded-full"></div>
          </div>

          {/* Floating Objects (badge) - keep away from logo on mobile */}
          <div className="absolute top-4 right-4 md:top-10 md:right-4 w-12 h-12 md:w-16 md:h-16 bg-celo-yellow border-2 border-black rotate-12 flex items-center justify-center shadow-lg animate-bounce-slight">
            <span className="font-retro text-xl md:text-2xl font-bold text-black">!</span>
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
            <div className="flex items-center gap-2 text-xs text-gray-400 font-retro uppercase">
              <Wallet size={12} />
              <span>Network: Celo Sepolia</span>
            </div>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default Home;