import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  animated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, animated = false, children, ...props }, ref) => {
    const Component = animated ? motion.div : 'div';
    
    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/5 bg-surface/50 p-6 shadow-sm",
          glass && "backdrop-blur-glass bg-surface/30",
          className
        )}
        {...(animated ? {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: "easeOut" }
        } : {})}
        {...(props as any)}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";
