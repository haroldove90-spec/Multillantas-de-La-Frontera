import React, { useState } from 'react';
import { ShieldCheck, Disc } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

const PRIMARY_LOGO_URL = 'https://appdesign.appdesignproyectos.com/multillantas.png';

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = 'h-10 w-auto',
  showSubtitle = false
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-black border border-brand-red/40 flex items-center justify-center text-brand-gold shadow-lg shadow-brand-red/20 shrink-0">
          <Disc className="animate-spin-slow text-brand-gold" size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="font-black italic tracking-tighter text-white text-base uppercase">
              MULTI<span className="text-brand-red">LLANTAS</span>
            </span>
            <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 px-1 py-0.5 rounded border border-brand-gold/20 uppercase tracking-widest">
              FRONTERA
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
              Centro • Norte • Frontera
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src={PRIMARY_LOGO_URL}
        alt="Multillantas de la Frontera"
        className={`${className} object-contain`}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
