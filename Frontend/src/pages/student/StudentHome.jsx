import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onUserApplications } from "../../services/firebaseDb";
import {
  fetchApprovedQuestions,
  fetchSolvedQuestions,
  toggleSolvedQuestion,
  fetchNotifications,
} from "../../services/studentApi";
import {
  Briefcase, FileText, CheckCircle, Clock,
  AlertCircle, ChevronRight, TrendingUp,
  Sparkles, ExternalLink, CheckCircle2, Loader2,
} from "lucide-react";
import { useCompanies } from "../../hooks/useCompanies";

import { API_BASE_URL } from "../../config/api";

// ── Mini Donut (for dashboard widget) ────────────────────────
function MiniDonut({ solved, total, size = 64, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 60 ? "#10b981" : percentage >= 30 ? "#6366f1" : "#94a3b8";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-slate-100 dark:stroke-slate-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} stroke={color} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black" style={{ color }}>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

// ── Difficulty badge color
const DIFF_COLORS = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function StudentHome() {
  const { user, token } = useAuth();
  const { companies } = useCompanies();
  const [applications, setApplications] = useState([]);

  // Practice data
  const [questions, setQuestions] = useState([]);
  const [solvedSet, setSolvedSet] = useState(new Set());
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  // Notices data
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  // Fetch user applications
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onUserApplications(user.uid, (apps) => {
      setApplications(apps || []);
    });
    return () => unsub();
  }, [user?.uid]);

  // Fetch recent notices
  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await fetchNotifications();
        setNotices(data.slice(0, 4));
      } catch (err) {
        console.error("Notices load error:", err);
      } finally {
        setNoticesLoading(false);
      }
    };
    loadNotices();
  }, []);

  // Fetch practice questions
  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const [qData, sData] = await Promise.all([
          fetchApprovedQuestions(),
          fetchSolvedQuestions(user.uid),
        ]);
        setQuestions(qData);
        setSolvedSet(new Set(sData));
      } catch (err) {
        console.error("Practice load error:", err);
      } finally {
        setPracticeLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  // Toggle solved from dashboard
  const handleToggle = async (questionId) => {
    if (!user?.uid) return;
    setToggling(questionId);
    const currently = solvedSet.has(questionId);
    const newSolved = !currently;

    setSolvedSet((prev) => {
      const next = new Set(prev);
      newSolved ? next.add(questionId) : next.delete(questionId);
      return next;
    });

    try {
      await toggleSolvedQuestion(user.uid, questionId, newSolved, token);
    } catch (err) {
      setSolvedSet((prev) => {
        const next = new Set(prev);
        !newSolved ? next.add(questionId) : next.delete(questionId);
        return next;
      });
    } finally {
      setToggling(null);
    }
  };

  const totalApplied = applications.length;
  const shortlisted = applications.filter((a) => a.status === "Shortlisted" || a.status === "Offered").length;
  const pending = applications.filter((a) => !["Offered", "Rejected", "Final Decision"].includes(a.status)).length;

  // ── ML-powered recommended companies sorting ──────────────────
  const [mlRecommendations, setMlRecommendations] = useState([]);

  const fetchMlRecommendations = useCallback(async () => {
    if (!user?.uid) return;
    try {
      // Fetch real coding stats
      const statsRes = await fetch(`${API_BASE_URL}/api/student/coding-stats/${user.uid}`);
      const statsData = await statsRes.json();
      if (!statsData.success || !statsData.platforms) return;

      const leetcode = statsData.platforms.find(p => p.id === "leetcode");
      const codeforces = statsData.platforms.find(p => p.id === "codeforces");
      const github = statsData.platforms.find(p => p.id === "github");

      const dsaScore = Math.min(100, ((typeof leetcode?.solved === "number" ? leetcode.solved : 0) / 500) * 100);
      const cpScore = Math.min(100, ((typeof codeforces?.rating === "number" ? codeforces.rating : 0) / 2400) * 100);
      const devScore = Math.min(100, ((typeof github?.repos === "number" ? github.repos : 0) / 50) * 100);

      // Fetch ML recommendations
      const mlRes = await fetch(`${API_BASE_URL}/api/student/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfile: [dsaScore, devScore, cpScore] }),
      });
      const mlData = await mlRes.json();
      setMlRecommendations(mlData.recommendations || []);
    } catch (err) {
      console.error("ML recommendations fetch error:", err);
    }
  }, [user?.uid]);

  useEffect(() => { fetchMlRecommendations(); }, [fetchMlRecommendations]);

  // Sort companies by ML confidence — matched ones first, then rest
  const sortedRecommendations = (() => {
    if (mlRecommendations.length === 0) return companies.slice(0, 3);

    const mlMap = {};
    mlRecommendations.forEach(r => {
      mlMap[r.placedCompany.toLowerCase()] = r.confidenceScore;
    });

    // Score each company: ML confidence if name matches, else 0
    const scored = companies.map(c => ({
      ...c,
      score: mlMap[c.name?.toLowerCase()] || 0,
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  })();

  // Build recommended questions based on applied companies
  const appliedCompanyNames = [...new Set(applications.map(a => a.company).filter(Boolean))];
  const recommendedQuestions = questions
    .filter(q => {
      const matchesCompany = appliedCompanyNames.some(
        name => (q.companyName || "").toLowerCase() === name.toLowerCase()
      );
      return matchesCompany && !solvedSet.has(q.id);
    })
    .slice(0, 5);

  const totalQuestions = questions.length;
  const totalSolved = questions.filter(q => solvedSet.has(q.id)).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Shortlisted": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "Applied": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "Offered": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    }
  };

  return (
    <div className="p-6 transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back! Track your applications and upcoming drives.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/student/profile" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition">Update Profile</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Applied</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalApplied}</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><Briefcase size={20} /></div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Shortlisted / Offered</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{shortlisted}</p>
            </div>
            <div className="rounded-full bg-green-50 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400"><CheckCircle size={20} /></div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{pending}</p>
            </div>
            <div className="rounded-full bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"><Clock size={20} /></div>
          </div>
        </div>

        {/* Content — 5-column grid: 3 left + 2 right */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-5">
            {/* Recent Applications */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 dark:text-slate-100">
                  <FileText size={18} className="text-slate-400 dark:text-slate-500" /> Application Status
                </h2>
                <Link to="/student/applications" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-3 font-medium uppercase text-xs">Company</th>
                      <th className="px-6 py-3 font-medium uppercase text-xs">Role</th>
                      <th className="px-6 py-3 font-medium uppercase text-xs">Status</th>
                      <th className="px-6 py-3 font-medium uppercase text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                          No applications yet. <Link to="/student/opportunities" className="text-indigo-500 hover:underline">Browse opportunities</Link>
                        </td>
                      </tr>
                    )}
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{app.company}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{app.role || "SDE"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusStyle(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{app.appliedOn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recommended Drives (ML-sorted) */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-slate-500 dark:text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recommended Drives</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedRecommendations.map((c) => (
                  <Link
                    key={c.id}
                    to={`/student/company/${c.id}`}
                    className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 dark:text-white">{c.name}</h3>
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">{c.type || "FTE"}</span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p>Match Score: <span className="font-medium text-green-600 dark:text-green-400">{c.score}%</span></p>
                        <p>CGPA Criteria: <span className="font-medium text-slate-700 dark:text-slate-300">{c.cgpaCutoff}+</span></p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700 dark:border-slate-700 dark:text-blue-400">
                      View Details <ChevronRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 space-y-5">
            {/* ── Practice Recommendations Widget ── */}
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white p-5 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles size={16} className="text-indigo-500" /> Practice
                </h3>
                <MiniDonut solved={totalSolved} total={totalQuestions} />
              </div>

              {practiceLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                </div>
              ) : recommendedQuestions.length > 0 ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">
                    Recommended for your companies
                  </p>
                  <div className="space-y-2">
                    {recommendedQuestions.map((q) => (
                      <div key={q.id} className="flex items-start gap-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-slate-900 p-2.5 transition-all hover:shadow-sm">
                        <button
                          onClick={() => handleToggle(q.id)}
                          disabled={toggling === q.id}
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-300 bg-white hover:border-indigo-400 dark:border-slate-600 dark:bg-slate-800 transition-all"
                        >
                          {toggling === q.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={10} className="text-slate-300" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                            {q.text}
                          </p>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex rounded px-1 py-0.5 text-[9px] font-bold ${DIFF_COLORS[q.difficulty] || DIFF_COLORS.Medium}`}>
                              {q.difficulty || "Medium"}
                            </span>
                            <span className="text-[9px] text-slate-400">{q.companyName}</span>
                            {q.link && (
                              <a href={q.link} target="_blank" rel="noopener noreferrer"
                                className="text-[9px] font-bold text-indigo-500 hover:underline flex items-center gap-0.5">
                                <ExternalLink size={8} /> Solve
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-3">
                  {totalQuestions > 0
                    ? "🎉 All recommended questions solved!"
                    : "No practice questions available yet."}
                </p>
              )}

              <Link
                to="/student/practice"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-sm"
              >
                View All Practice <ChevronRight size={14} />
              </Link>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/10">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-900 dark:text-amber-400">
                <AlertCircle size={16} /> Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/student/opportunities" className="block rounded-lg border border-amber-100 bg-white/80 p-3 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-slate-800 dark:text-amber-200 transition">
                    🎯 Browse Opportunities
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="block rounded-lg border border-amber-100 bg-white/80 p-3 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-slate-800 dark:text-amber-200 transition">
                    📅 View Calendar
                  </Link>
                </li>
                <li>
                  <a href="https://nitkkr.ac.in/wp-content/uploads/2025/04/Placement-Policy_F.pdf" target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-amber-100 bg-white/80 p-3 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-slate-800 dark:text-amber-200 transition">
                    📋 Placement Policy
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/training-and-placement-cell-nit-kurukshetra/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-amber-100 bg-white/80 p-3 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-slate-800 dark:text-amber-200 transition">
                    💼 T&P Cell LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            {/* Recent Notices */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Recent Notices</h3>
              <div className="space-y-4">
                {noticesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={18} className="animate-spin text-slate-400" />
                  </div>
                ) : notices.length > 0 ? (
                  notices.map((n, idx) => {
                    const borderColor = n.type === "deadline" ? "border-red-500" : n.type === "shortlist" ? "border-green-500" : n.type === "reminder" ? "border-amber-500" : "border-blue-500";
                    const relTime = n.createdAt?._seconds
                      ? (() => { const diff = Date.now() - n.createdAt._seconds * 1000; const mins = Math.floor(diff / 60000); if (mins < 1) return "just now"; if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; })()
                      : "";
                    return (
                      <div key={n.id || idx} className={`relative border-l-2 ${borderColor} pl-4`}>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{n.text}</p>
                        {relTime && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{relTime}</p>}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">No notices yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}