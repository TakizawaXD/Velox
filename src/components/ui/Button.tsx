import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, asChild, children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primaryHover shadow-neon-blue border border-white/10 transition-shadow duration-300',
      secondary: 'bg-surface/60 backdrop-blur-md text-text hover:bg-surfaceHover border border-white/5 shadow-sm',
      outline: 'bg-transparent text-primary border border-primary/50 hover:bg-primary/10 hover:border-primary',
      ghost: 'bg-transparent text-textMuted hover:text-text hover:bg-white/5',
      danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white',
      success: 'bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white',
      premium: 'bg-premium-gradient text-white shadow-premium border border-white/20 hover:shadow-primary/40',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base font-bold',
      icon: 'p-3',
    };

    const combinedClassName = cn(
      "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
      variants[variant],
      sizes[size],
      className
    );

    const content = (
      <>
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]" />
        ) : null}
        {children}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      return (
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block"
        >
          {React.cloneElement(children as React.ReactElement<any>, {
            className: cn(combinedClassName, (children.props as any).className),
            ...props,
          })}
        </motion.div>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        ref={ref}
        disabled={isLoading || props.disabled}
        className={combinedClassName}
        {...(props as any)}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
