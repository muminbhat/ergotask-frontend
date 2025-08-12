import React from 'react'

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-md disabled:opacity-50 transition-colors active:scale-[0.99]';
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-5 text-base',
  };
  const variants = {
    primary: 'text-black bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-emerald-400',
    outline: 'text-white border border-neutral-700 bg-transparent hover:bg-neutral-800',
    ghost: 'text-neutral-300 hover:bg-neutral-800',
  };
  const cls = `${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}


