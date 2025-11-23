import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Settings, Play, Wallet } from 'lucide-react';
import { RetroButton, Header, ScreenContainer } from '../Shared';
import { ASSETS } from '../../constants';

const Home: React.FC<{ balance: number }> = ({ balance }) => {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <Header balance={balance} />
      
      <div className="flex flex-col h-[calc(100vh-64px)] relative">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/brick-wall.png')]"></div>
        
        {/* Character Preview Area */}
        <div className="flex-1 flex items-center justify-center relative p-8">
          <div className="absolute w-64 h-64 bg-white/5 rounded-full blur-xl animate-pulse"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-48 border-4 border-black bg-gray-800 overflow-hidden shadow-[8px_8px_0px_0px_#FFF600] transform -rotate-2">
               <img 
                  src={ASSETS.SKATER_IDLE} 
                  alt="Character" 
                  className="w-full h-full object-cover grayscale contrast-125"
               />
            </div>
            <div className="w-40 h-4 bg-black/50 blur-md mt-4 rounded-full"></div>
          </div>
          
          {/* Floating Objects */}
          <div className="absolute top-10 right-4 w-16 h-16 bg-celo-yellow border-2 border-black rotate-12 flex items-center justify-center shadow-lg animate-bounce-slight">
            <span className="font-retro text-2xl font-bold text-black">!</span>
          </div>
        </div>

        {/* Action Menu */}
        <div className="p-4 pb-8 flex flex-col gap-4 z-20">
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
                        className="w-full font-black text-2xl"
                    />
                 </div>
            </div>
            
             <div className="bg-black/40 p-2 border border-white/20 mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-retro uppercase">
                    <Wallet size={12} />
                    <span>Network: Celo Alfajores</span>
                </div>
            </div>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default Home;