import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { onUserApplications } from "../../services/firebaseDb";
import {
  fetchApprovedQuestions,
  fetchSolvedQuestions,
  toggleSolvedQuestion,
  fetchOpportunities,
} from "../../services/studentApi";
import {
  Briefcase, FileText, CheckCircle, Clock,
  ChevronRight, Sparkles, ExternalLink, CheckCircle2, Loader2,
  CalendarDays, MapPin, Building2, ArrowUpRight,
} from "lucide-react";

// ── Difficulty badge color
const DIFF_COLORS = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// ── Mini Donut
function MiniDonut({ solved, total, size = 56, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 60 ? "#10b981" : percentage >= 30 ? "#6366f1" : "#94a3b8";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-brand-beige-100 dark:stroke-brand-brown-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} stroke={color} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default function StudentHome() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);

  // Practice
  const [questions, setQuestions] = useState([]);
  const [solvedSet, setSolvedSet] = useState(new Set());
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [toggling, setToggling] = useState(null);



  // Upcoming drives
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [drivesLoading, setDrivesLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onUserApplications(user.uid, (apps) => setApplications(apps || []));
    return () => unsub();
  }, [user?.uid]);



  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const [qData, sData] = await Promise.all([
          fetchApprovedQuestions(),
          fetchSolvedQuestions(user.uid),
        ]);
        setQuestions(qData);
        setSolvedSet(new Set(sData));
      } catch { /* ignore */ } finally { setPracticeLoading(false); }
    })();
  }, [user?.uid]);

  // Fetch upcoming drives
  useEffect(() => {
    (async () => {
      try {
        const opps = await fetchOpportunities();
        const today = new Date().toISOString().slice(0, 10);

        const dateFields = [
          { key: "deadline",            label: "Deadline" },
          { key: "oaDate",              label: "OA" },
          { key: "resumeShortlistDate", label: "Shortlist" },
          { key: "interviewDate",       label: "Interview" },
          { key: "offerDate",           label: "Decision" },
          { key: "joiningDate",         label: "Final" },
        ];

        const drives = opps
          .map(opp => {
            // Collect all upcoming events from top-level fields + rounds
            const upcoming = [];
            for (const { key, label } of dateFields) {
              if (opp[key] && opp[key] >= today) {
                upcoming.push({ name: label, date: opp[key] });
              }
            }
            for (const r of (opp.rounds || [])) {
              if (r.date && r.date >= today) {
                upcoming.push({ name: r.name || "Round", date: r.date });
              }
            }
            upcoming.sort((a, b) => a.date.localeCompare(b.date));

            return {
              id: opp.id,
              name: opp.name || opp.company || "Unknown",
              roles: opp.roles || "",
              type: opp.type || "On-campus",
              cgpaCutoff: opp.cgpaCutoff || "",
              nextRound: upcoming[0] || null,
            };
          })
          .filter(d => d.nextRound)
          .sort((a, b) => a.nextRound.date.localeCompare(b.nextRound.date))
          .slice(0, 4);
        setUpcomingDrives(drives);
      } catch { /* ignore */ } finally { setDrivesLoading(false); }
    })();
  }, []);

  const handleToggle = async (questionId) => {
    if (!user?.uid) return;
    setToggling(questionId);
    const currently = solvedSet.has(questionId);
    const newSolved = !currently;
    setSolvedSet(prev => { const next = new Set(prev); newSolved ? next.add(questionId) : next.delete(questionId); return next; });
    try { await toggleSolvedQuestion(user.uid, questionId, newSolved, token); }
    catch { setSolvedSet(prev => { const next = new Set(prev); !newSolved ? next.add(questionId) : next.delete(questionId); return next; }); }
    finally { setToggling(null); }
  };

  const totalApplied = applications.length;
  const shortlisted = applications.filter(a => a.status === "Shortlisted" || a.status === "Offered").length;
  const pending = applications.filter(a => !["Offered", "Rejected", "Final Decision"].includes(a.status)).length;

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
      case "Applied": return "bg-brand-amber-500/20 text-brand-amber-600 border-brand-amber-500/30 dark:bg-blue-900/30 dark:text-brand-amber-500 dark:border-brand-amber-700";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "Offered": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      default: return "bg-brand-beige-100 text-brand-brown-700 border-brand-beige-200 dark:bg-brand-brown-700 dark:text-brand-beige-300 dark:border-[#7A543A]";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white">
            Welcome back, {user?.fullName?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-sm text-brand-brown-600 dark:text-brand-beige-400">
            Here's what's happening with your placement journey.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/student/profile" className="rounded-lg bg-brand-brown-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-brown-800 dark:bg-brand-amber-500 dark:hover:bg-[#E89B60] transition shadow-sm">
            Update Profile
          </Link>
          <Link to="/student/opportunities" className="rounded-lg border border-brand-beige-200 bg-white px-4 py-2 text-sm font-medium text-brand-brown-800 hover:bg-brand-beige-50 dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-brand-beige-300 dark:hover:bg-[#3E2315] transition shadow-sm">
            Browse Drives
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Applied", value: totalApplied, icon: Briefcase, iconBg: "bg-brand-beige-100 dark:bg-[#3E2315]", iconColor: "text-brand-brown-800 dark:text-brand-beige-200" },
          { label: "Shortlisted / Offered", value: shortlisted, icon: CheckCircle, iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconColor: "text-emerald-500" },
          { label: "In Progress", value: pending, icon: Clock, iconBg: "bg-brand-amber-500/10 dark:bg-[#C07840]/20", iconColor: "text-brand-amber-500" },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="group relative overflow-hidden rounded-xl border border-brand-beige-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#5A3D2B] dark:bg-[#1A0F08]">
            {/* Dashed inner border effect from mockup */}
            <div className="absolute inset-1 rounded-lg border border-dashed border-brand-beige-300/50 dark:border-[#5A3D2B]/50 pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-brown-600 dark:text-brand-beige-400">{label}</p>
                <p className="mt-2 text-3xl font-black text-brand-brown-900 dark:text-white">{value}</p>
              </div>
              <div className={`rounded-xl p-3 ${iconBg}`}>
                <Icon size={22} className={iconColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid — 3 + 2 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* ── Left Column ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Application Status */}
          <section className="rounded-xl border border-brand-beige-200 bg-white shadow-sm overflow-hidden dark:border-[#5A3D2B] dark:bg-[#1A0F08]">
            <div className="border-b border-brand-beige-100 px-5 py-4 flex items-center justify-between dark:border-[#3E2315]">
              <h2 className="font-semibold text-brand-brown-900 flex items-center gap-2 dark:text-brand-beige-100">
                <FileText size={16} className="text-brand-brown-600" /> Recent Applications
              </h2>
              <Link to="/student/applications" className="text-xs font-bold text-brand-amber-500 hover:text-[#E89B60] dark:text-brand-amber-500 flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-cream-50 text-brand-brown-600 dark:bg-[#2A1810] dark:text-brand-beige-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wider">Company</th>
                    <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wider">Role</th>
                    <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wider">Status</th>
                    <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wider">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-beige-100 dark:divide-[#3E2315]">
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center">
                        <Briefcase size={32} className="mx-auto mb-2 text-brand-beige-200 dark:text-brand-brown-700" />
                        <p className="text-sm text-brand-brown-400">No applications yet.</p>
                        <Link to="/student/opportunities" className="mt-1 inline-flex items-center text-xs font-bold text-brand-amber-500/100 hover:underline">
                          Browse opportunities <ArrowUpRight size={12} className="ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  )}
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-brand-cream-50 transition-colors dark:hover:bg-[#2A1810]">
                      <td className="px-5 py-3.5 font-semibold text-brand-brown-900 dark:text-brand-beige-100">{app.company}</td>
                      <td className="px-5 py-3.5 text-brand-brown-700 dark:text-brand-beige-300">{app.role || "SDE"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-brand-brown-600 dark:text-brand-beige-400">{app.appliedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Upcoming Drives */}
          <section className="rounded-xl border border-brand-beige-200 bg-white shadow-sm dark:border-[#5A3D2B] dark:bg-[#1A0F08]">
            <div className="border-b border-brand-beige-100 px-5 py-4 flex items-center justify-between dark:border-[#3E2315]">
              <h2 className="font-semibold text-brand-brown-900 flex items-center gap-2 dark:text-brand-beige-100">
                <CalendarDays size={16} className="text-brand-brown-600" /> Upcoming Drives
              </h2>
              <Link to="/student/opportunities" className="text-xs font-bold text-brand-amber-500 hover:text-[#E89B60] dark:text-brand-amber-500 flex items-center gap-1">
                All Drives <ChevronRight size={14} />
              </Link>
            </div>
            <div className="p-4">
              {drivesLoading ? (
                <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-brand-amber-500" /></div>
              ) : upcomingDrives.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {upcomingDrives.map(drive => (
                    <div key={drive.id} className="group rounded-lg border border-brand-beige-200 bg-brand-cream-50 p-4 transition-all hover:border-brand-amber-500/50 hover:bg-brand-beige-100 dark:border-[#3E2315] dark:bg-[#2A1810] dark:hover:border-[#C07840]/50 dark:hover:bg-[#3E2315]">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-beige-200 dark:bg-[#3E2315]">
                            <Building2 size={16} className="text-brand-brown-800 dark:text-brand-beige-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-brand-brown-900 dark:text-white">{drive.name}</p>
                            <p className="text-[10px] text-brand-brown-600 dark:text-brand-beige-400">{drive.roles}</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-white border border-brand-beige-200 px-1.5 py-0.5 text-[9px] font-bold text-brand-brown-600 dark:bg-[#1A0F08] dark:border-[#3E2315] dark:text-brand-beige-400">
                          {drive.type}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-[10px] text-brand-brown-700 dark:text-brand-beige-300">
                        {drive.nextRound && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={10} />{drive.nextRound.name}: {formatDate(drive.nextRound.date)}
                          </span>
                        )}
                        {drive.cgpaCutoff && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />CGPA: {drive.cgpaCutoff}+
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarDays size={28} className="mx-auto mb-2 text-brand-beige-200 dark:text-brand-brown-700" />
                  <p className="text-sm text-brand-brown-400">No upcoming drives scheduled.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Practice */}
          <div className="rounded-xl border border-brand-beige-200 bg-white p-5 shadow-sm dark:border-[#5A3D2B] dark:bg-[#1A0F08]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-brown-900 dark:text-brand-beige-100">
                <Sparkles size={14} className="text-brand-amber-500" /> Practice
              </h3>
              <MiniDonut solved={totalSolved} total={totalQuestions} color="#C07840" />
            </div>

            {practiceLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-brand-amber-500" /></div>
            ) : recommendedQuestions.length > 0 ? (
              <>
                <p className="text-[9px] font-bold uppercase tracking-wider text-brand-amber-500 dark:text-brand-beige-400 mb-2">
                  Recommended for your companies
                </p>
                <div className="space-y-2">
                  {recommendedQuestions.map((q) => (
                    <div key={q.id} className="flex items-start gap-2 rounded-lg border border-brand-beige-100 dark:border-[#3E2315] bg-brand-cream-50 dark:bg-[#2A1810] p-2.5 transition-all hover:shadow-sm">
                      <button onClick={() => handleToggle(q.id)} disabled={toggling === q.id}
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-brand-beige-300 bg-white hover:border-brand-amber-500 dark:border-[#5A3D2B] dark:bg-[#1A0F08] transition-all">
                        {toggling === q.id ? <Loader2 size={8} className="animate-spin" /> : <CheckCircle2 size={8} className="text-brand-beige-200 dark:text-[#3E2315]" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-brand-brown-900 dark:text-brand-beige-100 leading-snug line-clamp-2">{q.text}</p>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex rounded px-1 py-0.5 text-[8px] font-bold ${DIFF_COLORS[q.difficulty] || DIFF_COLORS.Medium}`}>
                            {q.difficulty || "Medium"}
                          </span>
                          <span className="text-[9px] text-brand-brown-600 dark:text-brand-beige-400">{q.companyName}</span>
                          {q.link && (
                            <a href={q.link} target="_blank" rel="noopener noreferrer"
                              className="text-[9px] font-bold text-brand-amber-500 hover:underline flex items-center gap-0.5">
                              <ExternalLink size={7} /> Solve
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-brand-brown-600 dark:text-brand-beige-400 text-center py-3">
                {totalQuestions > 0 ? "🎉 All recommended questions solved!" : "No practice questions available yet."}
              </p>
            )}
            <Link to="/student/practice"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-brand-beige-200 bg-brand-cream-50 px-4 py-2 text-xs font-bold text-brand-brown-900 hover:bg-brand-beige-100 dark:border-[#3E2315] dark:bg-[#2A1810] dark:text-brand-beige-100 dark:hover:bg-[#3E2315] transition-all shadow-sm">
              View All Practice <ChevronRight size={14} />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-brand-amber-500/20 bg-brand-amber-500/5 p-4 shadow-sm dark:border-[#C07840]/20 dark:bg-[#C07840]/10">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-amber-500">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: "/student/opportunities", label: "🎯 Opportunities", external: false },
                { to: "/calendar", label: "📅 Calendar", external: false },
                { to: "https://nitkkr.ac.in/wp-content/uploads/2025/04/Placement-Policy_F.pdf", label: "📋 Policy", external: true },
                { to: "https://www.linkedin.com/company/training-and-placement-cell-nit-kurukshetra/", label: "💼 T&P LinkedIn", external: true },
              ].map(link => link.external ? (
                <a key={link.label} href={link.to} target="_blank" rel="noopener noreferrer"
                  className="rounded-lg border border-brand-beige-200 bg-white px-3 py-2 text-xs font-medium text-brand-brown-900 hover:bg-brand-beige-50 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-brand-beige-100 transition text-center">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.to}
                  className="rounded-lg border border-brand-beige-200 bg-white px-3 py-2 text-xs font-medium text-brand-brown-900 hover:bg-brand-beige-50 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-brand-beige-100 transition text-center">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}