import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { RouteLoadingBar } from '@/components/common/RouteLoadingBar';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoadingBar />}>
        <Outlet />
      </Suspense>
      <Toaster position="top-right" richColors />
    </>
  );
}
