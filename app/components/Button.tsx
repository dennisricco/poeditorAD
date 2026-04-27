'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'yellow' | 'blue' | 'pink' | 'green' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const variantMap = {
  yellow: 'bg-poe-yellow hover:bg-opacity-90',
  blue: 'bg-poe-blue text-white hover:bg-opacity-90',
  pink: 'bg-poe-pink hover:bg-opacity-90',
  green: 'bg-poe-green hover:bg-opacity-90',
  white: 'bg-white hover:bg-gray-50',
};

const sizeMap = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
};

export default function Button({
  children,
  onClick,
  variant = 'yellow',
  size = 'md',
  className = '',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        ${variantMap[variant]}
        ${sizeMap[size]}
        border-4 border-poe-black rounded-2xl cartoon-shadow
        font-black 
        transition-cartoon btn-press
        hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000]
        active:translate-y-1 active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000000]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </button>
  );
}
