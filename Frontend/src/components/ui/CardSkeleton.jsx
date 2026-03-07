/**
 * Reusable card skeleton for loading states.
 * Extracted from Opportunities.jsx and Company.jsx.
 */
export default function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="h-8 w-12 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}
