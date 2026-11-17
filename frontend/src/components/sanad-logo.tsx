'use client';

import React from 'react';

interface SanadLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function SanadLogo({
  size = 'md',
  showText = true,
  orientation = 'horizontal',
  className = '',
}: SanadLogoProps) {
  const sizeMap = {
    sm: { icon: 32, textAr: 'text-lg', textEn: 'text-[9px]' },
    md: { icon: 42, textAr: 'text-2xl', textEn: 'text-[11px]' },
    lg: { icon: 56, textAr: 'text-3xl', textEn: 'text-xs' },
    xl: { icon: 76, textAr: 'text-4xl', textEn: 'text-sm' },
  };

  const { icon: iconSize, textAr, textEn } = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        orientation === 'vertical' ? 'flex-col text-center' : 'flex-row'
      } ${className}`}
    >
      {/* Official SANAD Icon Emblem */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="sanadPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B2C98" />
            <stop offset="100%" stopColor="#541B6B" />
          </linearGradient>
          <linearGradient id="sanadPeachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8566" />
            <stop offset="100%" stopColor="#F6A035" />
          </linearGradient>
        </defs>

        {/* Purple Silhouette Base Disc / Crescent */}
        <path
          d="M50 4C24.598 4 4 24.598 4 50c0 14.28 6.518 27.039 16.71 35.48C17.21 78.4 15 69.5 15 60c0-19.33 15.67-35 35-35 9.5 0 18.4 3.79 24.96 10.02C71.3 17.65 61.35 4 50 4z"
          fill="url(#sanadPurpleGrad)"
        />

        {/* Upper Woman Profile in Purple */}
        <circle cx="50" cy="50" r="46" fill="url(#sanadPurpleGrad)" />

        {/* Serene White Woman Profile Cutout */}
        <path
          d="M62 25c-8 0-14 6-14 14 0 4.2 1.8 8 4.7 10.7-3.2 2-7.7 5.3-10.7 10.3C37 68 39 77 41 83c4-6 10-12 18-15 1.5-.6 3.5-1.2 5.5-1.7-1.5-3.3-2.5-7-2.5-11 0-5.5 2.5-10.4 6.5-13.8 1.5-1.3 2.5-3.2 2.5-5.5 0-6.1-4.9-11-11-11z"
          fill="#FFFFFF"
        />

        {/* Gentle Supporting Caring Hands in Coral/Peach */}
        <path
          d="M26 62c6 9 16 16 27 18 12 2 24-1 33-8-4 5-11 10-19 12-14 3-29-2-38-11-2-2-4-5-5-7 1-1.5 2-3 2-4z"
          fill="url(#sanadPeachGrad)"
        />
        <path
          d="M34 74c8 7 19 11 30 9 9-2 18-7 24-15-5 5-12 9-20 10-12 2-25-1-34-8v4z"
          fill="url(#sanadPeachGrad)"
          opacity="0.85"
        />
      </svg>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold text-[#5B1E74] dark:text-[#E8D1F5] tracking-tight ${textAr}`}
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            سَنَد
          </span>
          <span
            className={`font-black text-[#5B1E74] dark:text-[#D4B3E6] tracking-[0.25em] mt-0.5 ${textEn}`}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            SANAD
          </span>
        </div>
      )}
    </div>
  );
}
