import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-white/5", className)} />
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-white/[0.05]">
       <Skeleton className="w-12 h-12 rounded-xl" />
       <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/2" />
       </div>
       <Skeleton className="h-4 w-20" />
       <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] space-y-4">
       <Skeleton className="w-10 h-10 rounded-xl" />
       <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
       </div>
    </div>
  );
}
