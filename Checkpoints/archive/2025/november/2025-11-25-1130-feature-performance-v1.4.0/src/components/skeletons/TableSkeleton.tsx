import { Skeleton } from '../ui/skeleton'

export function TableSkeleton() {
  return (
    <div className="w-full">
      {/* Mobile Card Skeleton (Visible only on mobile) */}
      <div className="lg:hidden space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <Skeleton className="h-3 w-10 mb-1" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Skeleton className="h-8 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block rounded-lg border-2 border-slate-200 bg-white overflow-hidden">
        <div className="border-b-2 border-slate-200 bg-slate-50 px-6 py-4 grid grid-cols-12 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              className={`h-4 ${i === 0 ? 'col-span-1' : i === 2 ? 'col-span-3' : 'col-span-1'}`}
            />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
              <Skeleton className="h-4 col-span-1" />
              <Skeleton className="h-4 col-span-2" />
              <Skeleton className="h-4 col-span-2" />
              <Skeleton className="h-4 col-span-2" />
              <Skeleton className="h-4 col-span-1" />
              <Skeleton className="h-4 col-span-1" />
              <Skeleton className="h-8 w-16 col-span-1 rounded" />
              <Skeleton className="h-6 w-16 col-span-1 rounded-full" />
              <div className="col-span-1 flex gap-2 justify-end">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
