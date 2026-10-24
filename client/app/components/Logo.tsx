import React from 'react';

interface LogoProps {
  light?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ light = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#FF4F21] to-[#FFA233] flex items-center justify-center font-black text-sm text-white shadow-sm shadow-[#FF4F21]/25">
        A
      </div>
      <span
        style={{ fontFamily: "'Agale DEMO', 'Mazzard', sans-serif" }}
        className={`font-agale font-extrabold tracking-widest text-xl transition-colors ${
          light ? 'text-white' : 'text-[#FF4F21]'
        }`}
      >
        ATHLIXIR
      </span>
    </div>
  );
};

export default Logo;
