export default function AppLoading() {
  return (
    <div className="flex h-[calc(100vh-48px)] gap-0 px-10 py-6">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm animate-pulse">
        {/* Toolbar skeleton */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
            <div className="h-7 w-14 rounded-lg bg-slate-200/60" />
            <div className="h-7 w-16 rounded-lg bg-slate-100/40" />
            <div className="h-7 w-16 rounded-lg bg-slate-100/40" />
          </div>
          <div className="h-7 w-7 rounded-lg bg-slate-100" />
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-200" />

        {/* List items skeleton */}
        <div className="flex-1 px-3 py-2 space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-slate-100" />
                <div className="h-3 w-20 rounded bg-slate-50" />
              </div>
              <div className="space-y-2 text-right">
                <div className="ml-auto h-4 w-20 rounded bg-slate-100" />
                <div className="ml-auto h-3 w-16 rounded bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
