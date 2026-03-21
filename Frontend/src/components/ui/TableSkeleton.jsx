/**
 * Reusable table skeleton for loading states.
 * Extracted from Applications.jsx.
 */
export default function TableSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-brand-beige-200 dark:bg-brand-brown-700" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-brand-beige-200 dark:bg-brand-brown-700" /></td>
      <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-brand-beige-200 dark:bg-brand-brown-700" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-brand-beige-200 dark:bg-brand-brown-700" /></td>
      <td className="px-6 py-4 text-right"><div className="h-4 w-16 rounded bg-brand-beige-200 dark:bg-brand-brown-700 ml-auto" /></td>
    </tr>
  ));
}
