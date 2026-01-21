import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false }) => {
  const baseStyles = 'bg-white rounded-2xl border border-slate-100/50 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300';
  const hoverStyles = hoverable ? 'hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
