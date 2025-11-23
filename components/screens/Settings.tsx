import React from 'react';
import { Volume2, Music, Vibrate, CreditCard } from 'lucide-react';
import { ScreenContainer, Header, RetroButton } from '../Shared';

const Settings: React.FC = () => {
  
  const SettingRow = ({ label, icon: Icon, enabled = true }: { label: string, icon: any, enabled?: boolean }) => (
    <div className="w-full bg-gray-200 border-4 border-black p-4 mb-4 flex items-center justify-between clip-jagged shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-4 text-black">
            <Icon size={24} />
            <span className="font-retro text-2xl uppercase">{label}</span>
        </div>
        <div className={`w-16 h-8 ${enabled ? 'bg-green-500' : 'bg-red-500'} border-2 border-black flex items-center px-1`}>
            <div className={`w-6 h-6 bg-white border-2 border-black transform transition-transform ${enabled ? 'translate-x-8' : 'translate-x-0'}`}></div>
        </div>
    </div>
  );

  return (
    <ScreenContainer className="bg-celo-yellow/80">
      <Header balance={0} showBack title="SETTINGS" />
      
      <div className="p-6 flex flex-col gap-2 max-w-md mx-auto mt-8">
         <SettingRow label="Sound FX" icon={Volume2} />
         <SettingRow label="Music" icon={Music} enabled={false} />
         <SettingRow label="Haptics" icon={Vibrate} />
         
         <div className="my-4 border-t-4 border-black border-dashed"></div>
         
         <RetroButton 
            label="Manage Wallet" 
            icon={<CreditCard />} 
            variant="secondary"
            className="w-full mb-4"
         />
         
         <div className="mt-8 p-4 bg-black text-white font-retro text-center border-4 border-white/20">
            <p>ATLAS BRAWLER v0.1.0</p>
            <p className="text-gray-500 text-sm">Built for Celo Africa DAO</p>
         </div>
      </div>
    </ScreenContainer>
  );
};

export default Settings;