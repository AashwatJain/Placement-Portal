// src/utils/statusHelpers.js
// ─────────────────────────────────────────────────────────────
// Badge / status styling helpers, deadline label, etc.
// Consolidated from Opportunities, Applications, StudentHome.
// ─────────────────────────────────────────────────────────────

/**
 * Offer-type badge classes (Placement / Internship / Intern+PPO).
 * Used in Opportunities cards.
 */
export function offerBadge(type) {
  if (type === "Placement")
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
  if (type === "Internship")
    return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
  return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
}

/**
 * Deadline urgency indicator.
 * Returns { text, color, urgent } or null if no lastDate.
 */
export function deadlineLabel(lastDate) {
  if (!lastDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(lastDate + "T00:00:00");
  const diff = Math.ceil((dl - today) / 86400000);
  if (diff < 0)
    return { text: "Deadline passed", color: "text-red-600 dark:text-red-400", urgent: true };
  if (diff === 0)
    return { text: "Last day!", color: "text-red-600 dark:text-red-400 font-bold", urgent: true };
  if (diff <= 3)
    return { text: `${diff} day${diff > 1 ? "s" : ""} left`, color: "text-amber-600 dark:text-amber-400 font-semibold", urgent: true };
  return { text: `${diff} days left`, color: "text-slate-600 dark:text-slate-400", urgent: false };
}

/**
 * Application status badge style (used in Applications table + StudentHome).
 */
export function getStatusStyle(status) {
  switch (status) {
    case "Offered":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case "Shortlisted":
    case "Shortlist Result":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    case "Interview":
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
    case "Online Assessment":
    case "OA Result":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    case "Rejected":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    case "Resume Shortlisting":
      return "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800";
    case "Applied":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  }
}

/**
 * Timeline step dot colour (used in Applications modal).
 */
export function stepDotColor(step, idx, timeline) {
  if (step.done && step.result === "Rejected")
    return "bg-red-500 border-red-500 text-white";
  if (step.done) return "bg-green-500 border-green-500 text-white";
  const currentIdx = timeline.findIndex((s) => !s.done);
  if (idx === currentIdx)
    return "bg-amber-400 border-amber-400 text-white animate-pulse";
  return "bg-slate-200 border-slate-200 text-slate-400 dark:bg-slate-700 dark:border-slate-700";
}
