import React from 'react';

interface OfficialLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { imgClass: 'h-11 w-auto max-w-[44px]', titleClass: 'text-sm font-bold' },
    md: { imgClass: 'h-14 sm:h-16 w-auto max-w-[64px]', titleClass: 'text-base sm:text-lg font-extrabold' },
    lg: { imgClass: 'h-20 sm:h-24 w-auto max-w-[96px]', titleClass: 'text-lg sm:text-xl font-extrabold' },
    xl: { imgClass: 'h-28 sm:h-32 w-auto max-w-[128px]', titleClass: 'text-xl sm:text-2xl font-black' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {/* Official SDN Sumur Welut III/440 Logo Image */}
      <div className="relative shrink-0 flex items-center justify-center bg-white p-1 rounded-2xl shadow-xs border border-sky-100">
        <img
          src="/assets/aistudio/IMG-20260521-WA0011_8c13b067.jpg"
          alt="Logo Resmi SDN Sumur Welut III/440 Surabaya"
          className={`${dim.imgClass} object-contain select-none drop-shadow-sm`}
          loading="eager"
        />
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] md:text-xs font-semibold tracking-wider uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
            Dinas Pendidikan Kota Surabaya
          </span>
          <span className="text-[10px] md:text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Puskesmas Bangkingan
          </span>
        </div>
        <h1 className={`${dim.titleClass} text-[#0F2B5C] tracking-tight leading-snug mt-1`}>
          SDN SUMUR WELUT III/440
        </h1>
        {showSubtitle && (
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Kecamatan Lakarsantri, Kota Surabaya - Jawa Timur
          </p>
        )}
      </div>
    </div>
  );
};
