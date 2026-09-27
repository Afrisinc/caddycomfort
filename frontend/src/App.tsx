import { Suspense } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { RouteLoadingBar } from '@/components/common/RouteLoadingBar';
import { Seo } from '@/components/common/Seo';

export interface RouteSeo {
  title?: string;
  description?: string;
  noindex?: boolean;
  /** The page renders its own <Seo> from loaded data (e.g. product pages). */
  dynamic?: boolean;
}

function RouteSeoTags() {
  const matches = useMatches();
  const seo = (matches[matches.length - 1]?.handle ?? {}) as RouteSeo;
  if (seo.dynamic) return null;
  return <Seo title={seo.title} description={seo.description} noindex={seo.noindex} />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RouteSeoTags />
      <Suspense fallback={<RouteLoadingBar />}>
        <Outlet />
      </Suspense>
      <Toaster position="top-right" richColors />
    </>
  );
}
