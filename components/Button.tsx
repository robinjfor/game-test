import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  className = '', 
  variant = 'primary' 
}) => {
  const baseStyle = "px-8 py-3 rounded-full font-bold text-lg transition-transform active:scale-95 shadow-lg select-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 border-2 border-orange-300",
    secondary: "bg-white text-slate-800 hover:bg-gray-100 border-2 border-slate-200",
    danger: "bg-red-500 text-white hover:bg-red-600 border-2 border-red-400",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};