import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { ScreenContainer, Header, RetroButton } from '../Shared';
import { ASSETS } from '../../constants';

const Shop: React.FC<{ balance: number }> = ({ balance }) => {
  const [selectedItem, setSelectedItem] = useState(0);
  const [dialRotation, setDialRotation] = useState(0);
  
  const items = [
    { id: 1, name: 'Cruiser Board', price: 0.05, img: ASSETS.SHOP_ITEM },
    { id: 2, name: 'Street King', price: 0.15, img: ASSETS.SHOP_ITEM },
    { id: 3, name: 'Golden Deck', price: 1.00, img: ASSETS.SHOP_ITEM },
  ];

  const handleDialClick = () => {
    setSelectedItem((prev) => (prev + 1) % items.length);
    setDialRotation((prev) => prev + 120);
  };

  return (
    <ScreenContainer className="bg-celo-yellow">
      <Header balance={balance} showBack title="SHOP" />
      
      <div className="p-4 flex flex-col items-center h-full pb-20">
        
        {/* Retro TV Container */}
        <div className="relative w-full max-w-2xl md:max-w-3xl shadow-2xl">
            {/* TV Frame Image */}
            <img src="/assets/shop_screen/television-selection-screen_left.png" alt="TV frame" className="w-full pointer-events-none select-none" />

            {/* TV Screen - overlayed on top of the TV frame */}
            <div className="absolute z-9 left-[44%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[73%] h-[85%] aspect-video bg-[#8899a6] rounded-[14px] border-4 border-black overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                {/* Screen Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center">
                         <h3 className="font-retro text-3xl md:text-4xl text-black mb-2">{items[selectedItem].name}</h3>
                         <div className="w-40 h-40 md:w-48 md:h-48 mx-auto border-4 border-dashed border-black/50 p-3 md:p-4 bg-white/20 rotate-3">
                            <img src={items[selectedItem].img} className="w-full h-full object-cover grayscale" />
                         </div>
                         <p className="mt-4 font-bold font-retro text-4xl md:text-5xl text-white drop-shadow-[2px_2px_0px_black]">
                            ${items[selectedItem].price.toFixed(2)} cUSD
                         </p>
                     </div>
                </div>
                
                {/* Screen Glare */}
                <div className="absolute top-4 left-4 w-1/3 h-1/2 bg-white/20 rounded-full blur-xl rotate-12"></div>
            </div>

            {/* TV Controls */}
            <div className="absolute left-[82%] right-[4%] top-[64%] w-[15%] -translate-y-1/2 flex flex-col gap-4 z-30">
                <div className="w-[80%] h-[60%] border-l-[2px] border-gray-600 flex flex-col justify-around items-center py-[5%] bg-transparent mx-auto">
                    {[0,1,2].map((i) => (
                        <div key={i} className="w-[70%] h-[8%] bg-black/50 rounded-full"></div>
                    ))}
                </div>
                <button 
                    onClick={handleDialClick}
                    className="w-[100%] aspect-square rounded-full flex items-center justify-center hover:brightness-110 active:scale-95 transition-transform"
                >
                    <img 
                        src="/assets/shop_screen/tv-dial.png" 
                        alt="TV dial" 
                        className="w-[100%] h-[100%] pointer-events-none select-none"
                        style={{ transform: `rotate(${dialRotation}deg)`, transition: 'transform 0.3s ease' }}
                    />
                </button>
            </div>
        </div>

        {/* Shelves / Grid below */}
        <div className="w-full max-w-2xl md:max-w-3xl mt-8 bg-[#7d4e31] border-4 border-black p-4 md:p-6 shadow-lg transform rotate-1">
             <div className="grid grid-cols-3 gap-2">
                {items.map((item, index) => (
                    <button 
                        key={item.id}
                        onClick={() => setSelectedItem(index)}
                        className={`aspect-square border-2 border-black ${selectedItem === index ? 'bg-celo-yellow' : 'bg-gray-300'} hover:bg-white transition-colors p-1`}
                    >
                        <div className="w-full h-full border border-dashed border-black/50 flex items-center justify-center">
                             <span className="font-retro text-xs text-black">{item.name.split(' ')[0]}</span>
                        </div>
                    </button>
                ))}
             </div>
        </div>

        <div className="fixed bottom-6 left-4 right-4 max-w-2xl md:max-w-3xl mx-auto">
            <RetroButton label="Purchase" variant="primary" className="w-full text-xl shadow-xl" />
        </div>

      </div>
    </ScreenContainer>
  );
};

export default Shop;