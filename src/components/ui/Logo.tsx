// src/components/ui/Logo.tsx
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#logo-gradient)" />
      <path 
        d="M 30 40 Q 50 20 70 40" 
        stroke="white" 
        strokeWidth="4" 
        fill="none"
      />
      <circle cx="35" cy="55" r="3" fill="white" />
      <circle cx="50" cy="55" r="3" fill="white" />
      <circle cx="65" cy="55" r="3" fill="white" />
      <path 
        d="M 35 70 Q 50 80 65 70" 
        stroke="white" 
        strokeWidth="4" 
        fill="none"
      />
    </svg>
  );
};

export default Logo;