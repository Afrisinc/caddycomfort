import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <Toaster position="top-right" richColors />
    </>
  );
}
