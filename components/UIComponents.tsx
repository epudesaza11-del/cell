
import React, { useEffect, useState } from 'react';
import { CHARACTER_ASSETS } from '../constants';
import { CharacterId } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg border-b-4 border-blue-800",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg border-b-4 border-red-800",
    success: "bg-green-600 hover:bg-green-500 text-white shadow-lg border-b-4 border-green-800",
    outline: "bg-transparent border-2 border-white/50 text-white hover:bg-white/10"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />
  );
};

interface DialogueBoxProps {
  speaker: string;
  text: string;
  onClick: () => void;
  speakerId?: CharacterId | 'SYSTEM' | '???';
  showArrow?: boolean;
}

// 参照需求文档：暖黄色底色，圆角矩形，名字标签在左上角外部
export const DialogueBox: React.FC<DialogueBoxProps> = ({ speaker, text, onClick, speakerId, showArrow = true }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  const isSystem = speakerId === 'SYSTEM';
  
  // Custom Styles matching the doc
  // Dialogue Box: Warm Yellow (#fef9e3 approx), Rounded.
  // Name Tag: Dark Brown (#4a3b32), White Text.
  
  return (
    <div 
      onClick={onClick}
      className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-3xl z-30 cursor-pointer ${!showArrow ? 'cursor-default' : ''}`}
    >
      {/* Name Tag - Outside top left */}
      <div className="absolute -top-5 left-4 z-40">
         <span className={`inline-block px-6 py-1.5 rounded-lg text-lg font-bold shadow-md
            ${isSystem ? 'bg-black text-yellow-400' : 'bg-[#5c4033] text-white border-2 border-white/20'}`}>
           {speaker}
         </span>
      </div>

      {/* Main Box */}
      <div className={`
        relative rounded-3xl p-6 min-h-[140px] shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4
        ${isSystem 
          ? 'bg-gray-900/90 border-red-500 text-red-100' 
          : 'bg-[#fff8e1] border-[#d4a373] text-[#5c4033]'} 
      `}>
        <p className="text-xl leading-relaxed font-medium">
          {displayedText}
          {showArrow && displayedText.length === text.length && (
            <span className="animate-bounce inline-block ml-2 text-yellow-600">▼</span>
          )}
        </p>
      </div>
    </div>
  );
};

// 参照需求文档：一定要很正很正的正面！显示在屏幕中央（对话框上方）
export const CharacterPortrait: React.FC<{ id: CharacterId, isEnemy?: boolean }> = ({ id, isEnemy }) => {
  const asset = CHARACTER_ASSETS[id];
  if (!asset) return null;

  return (
    <div className={`
      relative z-10 
      h-[80vh] w-auto max-w-full
      flex items-end justify-center
      pointer-events-none
      transition-all duration-500 transform 
      ${isEnemy ? 'animate-bounce-slow' : 'animate-fade-in-up'}
    `}>
      <img 
        src={asset.avatar} 
        alt={asset.name} 
        className={`
          h-full w-auto object-contain object-bottom
          drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]
          ${isEnemy ? 'hue-rotate-90 grayscale-[0.2]' : ''}
        `}
      />
    </div>
  );
};
