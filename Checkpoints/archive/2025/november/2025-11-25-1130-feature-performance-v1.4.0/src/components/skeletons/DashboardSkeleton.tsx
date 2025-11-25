import { Skeleton } from '../ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 overflow-x-hidden max-w-full pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b-2 border-dashed border-slate-300 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-10 w-48 rounded-none" />
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white border-2 border-slate-200 rounded-none p-5 h-32 flex flex-col justify-between"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Section Row 1: Trend & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart Skeleton */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-none h-[400px]">
          <div className="p-4 border-b border-slate-100">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6 flex items-end justify-between h-[340px] gap-2">
            {[...Array(12)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-full"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
        </div>

        {/* Category Pie Chart Skeleton */}
        <div className="bg-white border-2 border-slate-200 rounded-none h-[400px]">
          <div className="p-4 border-b border-slate-100">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="p-6 flex items-center justify-center h-[340px]">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </div>
      </div>

      {/* Charts Section Row 2: OPD & Top Retribusi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* OPD Performance Skeleton */}
        <div className="bg-white border-2 border-slate-200 rounded-none h-[450px]">
          <div className="p-4 border-b border-slate-100">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Retribusi Skeleton */}
        <div className="bg-white border-2 border-slate-200 rounded-none h-[450px]">
          <div className="p-4 border-b border-slate-100">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6 flex items-end justify-between h-[390px] gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-full"
                style={{ height: `${Math.random() * 60 + 30}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports Skeleton */}
      <div className="bg-white border-2 border-slate-200 rounded-none">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-10 w-10 rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-24 ml-auto" />
                <Skeleton className="h-5 w-16 ml-auto rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
