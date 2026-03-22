'use client';

interface NongYingAvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  size?: number;
  className?: string;
}

export function NongYingAvatar({
  isSpeaking = false,
  isListening = false,
  size = 80,
  className = '',
}: NongYingAvatarProps) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow behind */}
        {(isSpeaking || isListening) && (
          <circle cx="60" cy="60" r="58" fill="none" stroke={isListening ? '#EF4444' : '#F97316'} strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="55;58;55" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Hair back */}
        <ellipse cx="60" cy="52" rx="42" ry="44" fill="#1a1a2e" />

        {/* Face */}
        <ellipse cx="60" cy="58" rx="34" ry="36" fill="#FDDCB5" />

        {/* Hair front - bangs */}
        <path d="M26 45 C30 25, 55 18, 60 20 C65 18, 90 25, 94 45 C88 35, 75 30, 60 32 C45 30, 32 35, 26 45Z" fill="#1a1a2e" />

        {/* Hair side left */}
        <path d="M26 45 C22 50, 20 65, 22 80 C24 75, 26 55, 30 48Z" fill="#1a1a2e" />

        {/* Hair side right */}
        <path d="M94 45 C98 50, 100 65, 98 80 C96 75, 94 55, 90 48Z" fill="#1a1a2e" />

        {/* Pigtail left */}
        <ellipse cx="20" cy="55" rx="8" ry="12" fill="#1a1a2e" />
        <circle cx="20" cy="42" r="5" fill="#F97316" />

        {/* Pigtail right */}
        <ellipse cx="100" cy="55" rx="8" ry="12" fill="#1a1a2e" />
        <circle cx="100" cy="42" r="5" fill="#2563EB" />

        {/* Blush left */}
        <ellipse cx="40" cy="68" rx="7" ry="4" fill="#FFB5B5" opacity="0.5" />

        {/* Blush right */}
        <ellipse cx="80" cy="68" rx="7" ry="4" fill="#FFB5B5" opacity="0.5" />

        {/* Eyes - left */}
        <ellipse cx="47" cy="58" rx="5" ry="6" fill="#2D1B69" />
        <circle cx="48.5" cy="56.5" r="2" fill="white" />
        {/* Eye blink when speaking */}
        {isSpeaking && (
          <ellipse cx="47" cy="58" rx="5" ry="6" fill="#FDDCB5">
            <animate attributeName="ry" values="6;1;6" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* Eyes - right */}
        <ellipse cx="73" cy="58" rx="5" ry="6" fill="#2D1B69" />
        <circle cx="74.5" cy="56.5" r="2" fill="white" />
        {isSpeaking && (
          <ellipse cx="73" cy="58" rx="5" ry="6" fill="#FDDCB5">
            <animate attributeName="ry" values="6;1;6" dur="3s" repeatCount="indefinite" begin="0.1s" />
          </ellipse>
        )}

        {/* Eyebrows */}
        <path d="M40 50 Q47 47, 54 50" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M66 50 Q73 47, 80 50" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />

        {/* Nose */}
        <circle cx="60" cy="65" r="1.5" fill="#E8C9A4" />

        {/* Mouth - animated when speaking */}
        {isSpeaking ? (
          // Speaking mouth - open/close animation
          <ellipse cx="60" cy="75" rx="6" ry="4" fill="#E8546D">
            <animate attributeName="ry" values="2;5;3;5;2" dur="0.4s" repeatCount="indefinite" />
            <animate attributeName="rx" values="5;6;7;6;5" dur="0.4s" repeatCount="indefinite" />
          </ellipse>
        ) : isListening ? (
          // Listening - small 'o' shape
          <ellipse cx="60" cy="75" rx="4" ry="4" fill="#E8546D" />
        ) : (
          // Default - cute smile
          <path d="M52 73 Q56 79, 60 79 Q64 79, 68 73" fill="none" stroke="#E8546D" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Body hint */}
        <path d="M38 92 Q45 88, 60 88 Q75 88, 82 92 L85 105 Q60 100, 35 105Z" fill="#F97316" />

        {/* Collar */}
        <path d="M45 90 L60 96 L75 90" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* Status indicator */}
      {isListening && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse border-2 border-slate-900">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
      {isSpeaking && !isListening && (
        <div className="absolute -bottom-1 -right-1 flex gap-0.5 items-end bg-slate-900 rounded-full px-1.5 py-1 border border-orange-500/30">
          <div className="w-1 h-2 bg-orange-400 rounded-full animate-bounce" />
          <div className="w-1 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-1 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      )}
    </div>
  );
}
