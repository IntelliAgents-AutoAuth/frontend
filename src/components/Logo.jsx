
import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ className = "h-10", textClassName = "text-3xl" }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-full flex items-center justify-center">
        <img
          src={logoImg}
          alt="AutoAuth"
          className="h-full w-auto object-contain block flex-shrink-0"
        />
      </div>

      <h1 className={`font-bold tracking-tighter text-slate-900 ${textClassName} leading-none flex items-center whitespace-nowrap`} style={{ fontFamily: "'Outfit', sans-serif", marginTop: '0.1em' }}>
        <span className="text-[#38A3A5]">Auto</span><span className="text-[#1E293B]">Auth</span>
      </h1>
    </div>
  );
};

export default Logo;
