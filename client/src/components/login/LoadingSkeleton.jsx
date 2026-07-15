import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="space-y-2.5">
      {[...Array(3)].map((_, idx) => (
        <div 
          key={idx}
          className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-white animate-pulse"
        >
          <div className="flex items-center gap-3.5 w-full">
            {/* Avatar Circle skeleton */}
            <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
            
            {/* Texts skeleton */}
            <div className="space-y-2 w-1/2">
              <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              <div className="h-2 bg-slate-100 rounded w-1/2" />
            </div>
          </div>

          {/* Badge skeleton */}
          <div className="h-5 bg-slate-100 rounded-full w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
