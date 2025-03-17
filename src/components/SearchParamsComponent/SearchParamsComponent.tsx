'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SearchParamsComponent() {
  const searchParams = useSearchParams();
  return (
    <div>
    
    </div>
  );
}

// Main 404 component
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsComponent />
      </Suspense>
    </div>
  );
}