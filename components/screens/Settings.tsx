import React, { useState, useEffect } from 'react';
import { Volume2, Music, Vibrate, CreditCard, Save, HelpCircle } from 'lucide-react';
import { ScreenContainer, Header, RetroButton } from '../Shared';
import { getGameSettings, saveGameSettings, GameSettings } from '../../src/utils/gameSettings';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<GameSettings>(getGameSettings());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(getGameSettings());
  }, []);

  const handleToggle = (key: keyof GameSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveGameSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const SettingRow = ({ label, icon: Icon, value, onToggle }: { 
    label: string; 
    icon: any; 
    value: boolean; 
    onToggle: () => void;
  }) => (
    <div className="w-full bg-gray-200 border-4 border-black p-4 mb-4 flex items-center justify-between clip-jagged shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-4 text-black">
        <Icon size={24} />
        <span className="font-retro text-2xl uppercase">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`w-16 h-8 ${value ? 'bg-green-500' : 'bg-red-500'} border-2 border-black flex items-center px-1 cursor-pointer active:scale-95`}
      >
        <div className={`w-6 h-6 bg-white border-2 border-black transform transition-transform ${value ? 'translate-x-8' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );

  return (
    <ScreenContainer className="bg-celo-yellow/80">
      <Header balance={0} showBack title="SETTINGS" />
      
      <div className="p-6 flex flex-col gap-2 max-w-md mx-auto mt-8">
        <SettingRow 
          label="Sound FX" 
          icon={Volume2} 
          value={settings.audioEnabled} 
          onToggle={() => handleToggle('audioEnabled')} 
        />
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-retro text-black">Audio Volume</span>
            <span className="font-retro text-black">{Math.round(settings.audioVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.audioVolume}
            onChange={(e) => setSettings(prev => ({ ...prev, audioVolume: parseFloat(e.target.value) }))}
            className="w-full h-4 bg-black border-2 border-black rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <SettingRow 
          label="Background Music" 
          icon={Music} 
          value={settings.audioEnabled} 
          onToggle={() => handleToggle('audioEnabled')} 
        />
        
        <SettingRow 
          label="Haptic Feedback" 
          icon={Vibrate} 
          value={settings.hapticFeedback} 
          onToggle={() => handleToggle('hapticFeedback')} 
        />
        
        <SettingRow 
          label="Show Tutorial" 
          icon={HelpCircle} 
          value={settings.showTutorial} 
          onToggle={() => handleToggle('showTutorial')} 
        />
        
        <div className="my-4 border-t-4 border-black border-dashed"></div>
        
        <RetroButton 
          label={isSaved ? "Saved!" : "Save Settings"} 
          icon={isSaved ? null : <Save />} 
          variant="secondary"
          className="w-full mb-4"
          onClick={handleSave}
        />
        
        <RetroButton 
          label="Manage Wallet" 
          icon={<CreditCard />} 
          variant="primary"
          className="w-full mb-4"
          onClick={() => {
            if (window.ethereum) {
              window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
            }
          }}
        />
        
        <div className="mt-8 p-4 bg-black text-white font-retro text-center border-4 border-white/20">
          <p>ATLAS BRAWLER v0.1.0</p>
          <p className="text-gray-500 text-sm">Built for Celo Africa DAO</p>
          <p className="text-xs text-gray-600 mt-2">
            Settings saved locally in your browser
          </p>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default Settings;