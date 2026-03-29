import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';
  animated?: boolean;
}

export function Badge({ className, variant = 'default', animated = false, children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    warning: 'bg-warning/10 text-warning border-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    danger: 'bg-danger/10 text-danger border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    info: 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    primary: 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    default: 'bg-surfaceHover text-textMuted border-border',
  };

  const Component = animated ? motion.div : 'div';

  return (
    <Component
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...(animated ? {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
      } : {})}
      {...(props as any)}
    >
      {children}
    </Component>
  );
}
