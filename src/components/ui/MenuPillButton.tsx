import { useState } from 'react';
import { cn } from '@/lib/cn';

interface MenuPillButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
  label?: string;
}

export function MenuPillButton({ onClick, isOpen = false, className, label = 'MENU' }: MenuPillButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className={cn(
        'relative inline-flex h-9 min-w-[76px] items-center justify-center overflow-hidden rounded-full border px-3 text-[12px] font-extrabold tracking-wider transition-all duration-300 select-none shadow-xs',
        isOpen
          ? 'border-[#D81B60] bg-[#D81B60]/20 text-[#D81B60]'
          : isHovered
            ? 'border-[#D81B60]/60 bg-[#D81B60]/25 text-white shadow-[0_0_12px_rgba(216,27,96,0.35)]'
            : 'border-white/20 bg-white/10 text-white/90 hover:border-white/30',
        className
      )}
    >
      <div
        className="relative h-full w-full"
        style={{
          transform: isOpen ? 'translateY(-100%)' : 'translateY(0%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Open State (Displays MENU with slide-up hover animation) */}
        <div className="relative h-full w-full overflow-hidden">
          <div
            className="flex h-full w-full items-center justify-center font-bold"
            style={{
              transform: isHovered ? 'translateY(-100%)' : 'translateY(0%)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {label}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center font-extrabold text-[#FF4081]"
            style={{
              transform: isHovered ? 'translateY(0%)' : 'translateY(100%)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {label}
          </div>
        </div>

        {/* Closed State (Displays CLOSE with slide-up hover animation) */}
        <div className="relative h-full w-full overflow-hidden">
          <div
            className="flex h-full w-full items-center justify-center font-bold text-white"
            style={{
              transform: isHovered ? 'translateY(-100%)' : 'translateY(0%)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            CLOSE
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center font-extrabold text-[#D81B60]"
            style={{
              transform: isHovered ? 'translateY(0%)' : 'translateY(100%)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            CLOSE
          </div>
        </div>
      </div>
    </button>
  );
}
