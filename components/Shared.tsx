import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface RetroButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({ label, onClick, variant = 'primary', className = '', icon }) => {
  const baseStyle = "relative font-retro text-xl tracking-wider uppercase transform transition-transform active:scale-95 active:rotate-1";
  
  const styles = {
    primary: "bg-white text-black border-b-4 border-r-4 border-black hover:bg-gray-100",
    secondary: "bg-celo-yellow text-black border-b-4 border-r-4 border-black hover:brightness-110",
    danger: "bg-red-500 text-white border-b-4 border-r-4 border-black hover:bg-red-600"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyle} ${styles[variant]} ${className} clip-jagged py-3 px-6 flex items-center justify-center gap-2`}
    >
      {icon}
      {label}
    </button>
  );
};

export const Header: React.FC<{ balance: number; showBack?: boolean; title?: string }> = ({ balance, showBack = false, title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full bg-celo-yellow border-b-4 border-black p-2 sticky top-0 z-50 shadow-lg">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 border-2 border-black bg-white active:translate-y-1">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="font-retro text-2xl leading-none font-black italic transform -skew-x-12 text-black">
               {title || "ATLAS BRAWLER"} 
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-black opacity-80">CELO AFRICA DAO</span>
          </div>
        </div>
        
        <div className="bg-white border-2 border-black px-2 py-1 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-3 h-3 rounded-full bg-celo-yellow border border-black animate-pulse"></div>
          <span className="font-retro text-lg font-bold">${balance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export const ScreenContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-[#1A1A1A] text-white relative overflow-hidden ${className}`}>
      {/* CRT Scanline effect overlay */}
      <div className="scanline pointer-events-none fixed inset-0 z-50 opacity-30"></div>
      {children}
    </div>
  );
};
