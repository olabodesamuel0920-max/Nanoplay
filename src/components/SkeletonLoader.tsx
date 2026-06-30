// src/components/SkeletonLoader.tsx
import React from "react";

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-[#0b0b0e] border border-[#1a1a1a] p-4">
      <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-[#1a1a1a] rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-[#1a1a1a] rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-[#0b0b0e] border border-[#1a1a1a] rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}
