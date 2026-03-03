import React from 'react';

interface BrandNameProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const sizeMap = {
  'sm': 'text-sm',
  'md': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

export default function BrandName({ className = '', size = 'md' }: BrandNameProps) {
  return (
    <span className={`font-bold tracking-tight font-sans ${sizeMap[size]} ${className}`}>
      <span style={{ color: '#2b3859' }}>Paw</span>
      <span style={{ color: '#faa92e' }}>Mitra</span>
    </span>
  );
}
