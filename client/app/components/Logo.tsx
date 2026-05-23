import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-[#FF4F21]/20">
        A
      </div>
      <span className="font-extrabold tracking-widest text-lg text-white">ATHLIXIR</span>
    </div>
  );
};

export default Logo;
