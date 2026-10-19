import React from 'react';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  onClick?: () => void;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 'md',
  showBadge = false,
  badgeText,
  className = '',
  onClick,
}) => {
  const dimensions = {
    sm: {
      box: 'w-6 h-6 rounded-lg',
      iconSize: 14,
      title: 'text-sm font-bold',
      badge: 'text-[9px] px-1.5 py-0.2',
    },
    md: {
      box: 'w-8 h-8 rounded-xl',
      iconSize: 18,
      title: 'text-base font-extrabold',
      badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      box: 'w-10 h-10 rounded-2xl',
      iconSize: 24,
      title: 'text-2xl font-extrabold',
      badge: 'text-xs px-2.5 py-1',
    },
    xl: {
      box: 'w-14 h-14 md:w-16 md:h-16 rounded-3xl',
      iconSize: 34,
      title: 'text-3xl md:text-4xl font-black',
      badge: 'text-xs px-3 py-1',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 flex-shrink-0 select-none whitespace-nowrap ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      {/* Nova AI Celestial Pulsar Emblem */}
      <div
        className={`${dimensions.box} relative p-[1.5px] rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.35)] group`}
      >
        <div className="w-full h-full rounded-[inherit] bg-[#070d1a] flex items-center justify-center overflow-hidden relative">
          <svg
            width={dimensions.iconSize}
            height={dimensions.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
          >
            {/* Primary Four-Point Pulsar Star */}
            <path
              d="M12 2L13.8 8.8C14.3 10.7 15.8 12.2 17.7 12.7L22 14L17.7 15.3C15.8 15.8 14.3 17.3 13.8 19.2L12 22L10.2 19.2C9.7 17.3 8.2 15.8 6.3 15.3L2 14L6.3 12.7C8.2 12.2 9.7 10.7 10.2 8.8L12 2Z"
              fill="url(#nova-pulsar-grad)"
            />
            {/* Core Bright Light Dot */}
            <circle cx="12" cy="14" r="1.8" fill="#FFFFFF" />
            <defs>
              <linearGradient id="nova-pulsar-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#67e8f9" />
                <stop offset="0.5" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typography: NOVA AI */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className={`tracking-wider text-slate-100 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] ${dimensions.title}`}>
          NOVA
        </span>
        <span className={`tracking-tight text-cyan-400 font-['Plus_Jakarta_Sans',sans-serif] ${dimensions.title} drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]`}>
          AI
        </span>

        {showBadge && (
          <span
            className={`ml-1 rounded-md bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 font-mono font-medium flex-shrink-0 ${dimensions.badge}`}
          >
            {badgeText || 'PRO'}
          </span>
        )}
      </div>
    </div>
  );
};

// Backward-compatible alias
export const GeminiLogo = NovaLogo;
