import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { ScreenContainer, Header, RetroButton } from '../Shared';
import { ASSETS } from '../../constants';

const Shop: React.FC<{ balance: number }> = ({ balance }) => {
  const [selectedItem, setSelectedItem] = useState(0);
  
  const items = [
    { id: 1, name: 'Cruiser Board', price: 0.05, img: ASSETS.SHOP_ITEM },
    { id: 2, name: 'Street King', price: 0.15, img: ASSETS.SHOP_ITEM },
    { id: 3, name: 'Golden Deck', price: 1.00, img: ASSETS.SHOP_ITEM },
  ];

  return (
    <ScreenContainer className="bg-celo-yellow">
      <Header balance={balance} showBack title="SHOP" />
      
      <div className="p-4 flex flex-col items-center h-full pb-20">
        
        {/* Retro TV Container */}
        <div className="relative w-full max-w-md bg-gray-800 rounded-3xl p-6 shadow-2xl border-b-8 border-r-8 border-black/20">
            
            {/* TV Screen */}
            <div className="w-full aspect-video bg-[#8899a6] rounded-[50px/20px] border-4 border-black relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center">
                         <h3 className="font-retro text-2xl text-black mb-2">{items[selectedItem].name}</h3>
                         <div className="w-32 h-32 mx-auto border-4 border-dashed border-black/50 p-2 bg-white/20 rotate-3">
                            <img src={items[selectedItem].img} className="w-full h-full object-cover grayscale" />
                         </div>
                         <p className="mt-4 font-bold font-retro text-3xl text-white drop-shadow-[2px_2px_0px_black]">
                            ${items[selectedItem].price.toFixed(2)} cUSD
                         </p>
                     </div>
                </div>
                
                {/* Screen Glare */}
                <div className="absolute top-4 left-4 w-1/3 h-1/2 bg-white/20 rounded-full blur-xl rotate-12"></div>
            </div>

            {/* TV Controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                <div className="w-12 h-24 border-l-2 border-gray-600 flex flex-col justify-around items-center py-2">
                    {[0,1,2].map((i) => (
                        <div key={i} className="w-8 h-1 bg-black/50 rounded-full"></div>
                    ))}
                </div>
                <button 
                    onClick={() => setSelectedItem((prev) => (prev + 1) % items.length)}
                    className="w-12 h-12 rounded-full bg-black border-b-4 border-gray-600 active:translate-y-1 flex items-center justify-center"
                >
                    <div className="w-1 h-6 bg-white/50 rotate-45"></div>
                </button>
            </div>
        </div>

        {/* Shelves / Grid below */}
        <div className="w-full max-w-md mt-8 bg-[#7d4e31] border-4 border-black p-4 shadow-lg transform rotate-1">
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

        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto">
            <RetroButton label="Purchase" variant="primary" className="w-full text-xl shadow-xl" />
        </div>

      </div>
    </ScreenContainer>
  );
};

export default Shop;