import { motion } from 'framer-motion';

export function Skeleton({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div 
      className={`relative overflow-hidden rounded-md bg-white/5 ${className}`}
      style={style}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="glass-panel p-5 border-white/5 bg-surface/30 rounded-2xl">
      <Skeleton className="h-5 w-5 mb-4" />
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-2 w-24" />
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="glass-panel p-6 border-white/5 bg-surface/30 rounded-2xl w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full" 
            style={{ height: `\${Math.floor(Math.random() * 60) + 20}%` }} 
          />
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/5 px-4 animate-pulse">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-3 w-[25%]" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}
