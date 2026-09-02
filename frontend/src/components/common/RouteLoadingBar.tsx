// Shown by the router's top-level Suspense boundary while a route's lazy
// chunk is downloading, so navigation gives visible feedback instead of a
// blank screen for however long the chunk takes to arrive.
export function RouteLoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 overflow-hidden bg-accent-rose-subtle">
      <div className="h-full w-1/3 bg-accent-rose animate-[route-loading_1s_ease-in-out_infinite]" />
      <style>{`
        @keyframes route-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
