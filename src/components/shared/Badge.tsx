import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  className = '' 
}) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-100/60',
    error: 'bg-rose-50 text-rose-700 border-rose-100/60',
    neutral: 'bg-slate-50 text-slate-700 border-slate-100/60',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border tracking-tight uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
