import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { onUserApplications } from "../../services/firebaseDb";
import { buildGCalUrl } from "../../utils/calendarHelpers";
import { stepDotColor, getStatusStyle } from "../../utils/statusHelpers";
import TableSkeleton from "../../components/ui/TableSkeleton";
import {
  FileText, Search, X, CheckCircle, Clock, AlertCircle,
  Briefcase, ExternalLink, MapPin, IndianRupee,
} from "lucide-react";

// ── Timeline helpers ────────────────────────────────────────
const STEP_ICONS = {
  Applied: CheckCircle,
  Shortlisted: CheckCircle,
  "Online Assessment": FileText,
  "OA Result": CheckCircle,
  Interview: Briefcase,
  "Interview Result": CheckCircle,
  "Final Decision": AlertCircle,
};

// ══════════════════════════════════════════════════════════════
export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onUserApplications(user.uid, (apps) => {
      setApplications(apps);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (selectedApp) {
      const fresh = applications.find((a) => a.id === selectedApp.id);
      if (fresh) setSelectedApp(fresh);
    }
  }, [applications]);

  const filteredApps = applications.filter(
    (app) =>
      (app.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For a nice progress indicator
  const getProgress = (timeline) => {
    if (!timeline) return 0;
    const doneCount = timeline.filter((s) => s.done).length;
    return Math.round((doneCount / timeline.length) * 100);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
          <p className="text-slate-500 dark:text-slate-400">Track the selection process of each registration.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search company..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white w-full sm:w-64" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium uppercase text-xs">Company</th>
                <th className="px-6 py-4 font-medium uppercase text-xs">Role</th>
                <th className="px-6 py-4 font-medium uppercase text-xs">Applied On</th>
                <th className="px-6 py-4 font-medium uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-medium uppercase text-xs">Progress</th>
                <th className="px-6 py-4 font-medium uppercase text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && <TableSkeleton />}
              {!loading && filteredApps.map((app) => {
                const progress = getProgress(app.timeline);
                return (
                  <tr key={app.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow">
                          {(app.company || "?").charAt(0)}
                        </div>
                        <span className="font-semibold">{app.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{app.role || "SDE"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{app.appliedOn || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedApp(app)}
                        className="text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 font-medium text-xs">
                        View Timeline →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <FileText size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium">No applications yet.</p>
            <p className="text-sm mt-1">Register for opportunities to see them here.</p>
          </div>
        )}
      </div>

      {/* ══ DETAIL MODAL — READ-ONLY TIMELINE ══ */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow">
                  {(selectedApp.company || "?").charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedApp.company}</h2>
                  <p className="text-sm text-slate-500">{selectedApp.role} • {selectedApp.offerType || "Placement"}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto">

              {/* Info cards row */}
              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusStyle(selectedApp.status)}`}>{selectedApp.status}</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Applied</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{selectedApp.appliedOn}</p>
                </div>
                {selectedApp.ctc && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">CTC</p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">{selectedApp.ctc}</p>
                  </div>
                )}
                {selectedApp.location && (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Location</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{selectedApp.location}</p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Overall Progress</span>
                  <span className="text-xs font-bold text-indigo-600">{getProgress(selectedApp.timeline)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${getProgress(selectedApp.timeline)}%` }} />
                </div>
              </div>

              {/* TIMELINE — read-only, dates from backend */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Selection Timeline</h3>
              <div className="relative ml-3 space-y-1">
                {(selectedApp.timeline || [])
                  .filter((step) => step.done || step.date)
                  .map((step, idx, filteredArr) => {
                  const Icon = STEP_ICONS[step.step] || Clock;
                  const isLast = idx === filteredArr.length - 1;
                  return (
                    <div key={idx} className="relative flex items-start gap-4 pb-5">
                      {!isLast && (
                        <div className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-10px)] ${step.done ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                      )}
                      <div className={`relative z-10 shrink-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${stepDotColor(step, idx, filteredArr)}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-bold ${step.done ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>{step.step}</p>
                          {step.done && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">✓ Done</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          {step.date && (
                            <>
                              <span className="text-xs text-slate-500 font-medium">{step.date}</span>
                              <a href={buildGCalUrl(selectedApp.company, step)}
                                target="_blank" rel="noopener noreferrer"
                                className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5">
                                <ExternalLink size={9} /> Google Cal
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <button onClick={() => setSelectedApp(null)} className="rounded-lg px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}