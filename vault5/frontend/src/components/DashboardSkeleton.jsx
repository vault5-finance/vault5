import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'linear-gradient(90deg, rgba(15,76,140,0.1) 25%, rgba(15,76,140,0.15) 50%, rgba(15,76,140,0.1) 75%)', backgroundSize: '200% 100%' }} />
);

const DashboardSkeleton = () => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Skeleton className="h-5 w-36 mb-3" />
          <Skeleton className="h-8 w-44" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Skeleton className="h-5 w-36 mb-3" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Skeleton className="h-5 w-40 mb-3" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Skeleton className="h-5 w-52 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <Skeleton className="h-5 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <Skeleton className="h-6 w-56 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;