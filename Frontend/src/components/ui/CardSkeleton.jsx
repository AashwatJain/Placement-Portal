/**
 * Reusable card skeleton for loading states.
 * Extracted from Opportunities.jsx and Company.jsx.
 */
export default function CardSkeleton() {
  return (
    <div className="rounded-xl border border-brand-beige-200 bg-white p-5 shadow-sm dark:border-[#3E2315] dark:bg-[#1A0F08] animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-brand-beige-200 dark:bg-brand-brown-700" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-brand-beige-200 dark:bg-brand-brown-700" />
            <div className="h-3 w-16 rounded bg-brand-beige-200 dark:bg-brand-brown-700" />
          </div>
        </div>
        <div className="h-8 w-12 rounded bg-brand-beige-200 dark:bg-brand-brown-700" />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="h-10 rounded-lg bg-brand-beige-100 dark:bg-[#2A1810]" />
        <div className="h-10 rounded-lg bg-brand-beige-100 dark:bg-[#2A1810]" />
      </div>
      <div className="h-4 w-full rounded bg-brand-beige-100 dark:bg-[#2A1810]" />
    </div>
  );
}
