
import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ className = "h-10", textClassName = "text-3xl", onClick }) => {
  return (
    <div 
      className={`flex items-center gap-3 cursor-pointer select-none ${className}`} 
      onClick={onClick}
    >
      <img
        src={logoImg}
        alt="AutoAuth"
        className="h-full w-auto object-contain flex-shrink-0"
      />
      <h1 
        className={`font-extrabold tracking-[-0.02em] ${textClassName} flex items-center pt-0.5`} 
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <span className="text-[#38A3A5]">Auto</span>
        <span className="text-[#1E293B]">Auth</span>
      </h1>
    </div>
  );
};

export default Logo;
