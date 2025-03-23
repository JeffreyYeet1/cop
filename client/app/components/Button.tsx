import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  rounded = false,
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  // Tailwind classes based on variant
  const variantClasses = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
    secondary: 'bg-sky-50 text-violet-600 hover:bg-sky-100 active:bg-sky-200',
    outline: 'bg-transparent border border-violet-600 text-violet-600 hover:bg-violet-50 active:bg-violet-100',
    text: 'bg-transparent text-violet-600 hover:text-violet-700 active:text-violet-800',
  };

  // Tailwind classes based on size
  const sizeClasses = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-6',
  };

  // Combine all classes
  const buttonClasses = [
    'font-semibold transition-colors duration-150 ease-in-out focus:outline-none',
    variantClasses[variant],
    sizeClasses[size],
    rounded ? 'rounded-full' : 'rounded-lg',
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;