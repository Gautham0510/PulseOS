import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-[#2a2f45] rounded', className)} />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4', className)}>
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4', className)}>
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#1e2130] border border-[#2a2f45] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#2a2f45]">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y divide-[#2a2f45]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20 ml-auto" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
