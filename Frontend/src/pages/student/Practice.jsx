import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchApprovedQuestions,
  fetchSolvedQuestions,
  toggleSolvedQuestion,
  fetchCompanies,
} from "../../services/studentApi";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Search,
  Loader2,
  BarChart3,
  Trophy,
  Target,
  ArrowLeft,
  Building2,
  Sparkles,
  X,
} from "lucide-react";

// ── Donut Chart Component ────────────────────────────────────
function DonutChart({ solved, total, size = 140, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return { stroke: "#10b981", text: "text-emerald-500" };
    if (percentage >= 50) return { stroke: "#6366f1", text: "text-indigo-500" };
    if (percentage >= 25) return { stroke: "#f59e0b", text: "text-amber-500" };
    return { stroke: "#94a3b8", text: "text-slate-400" };
  };
  const color = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          stroke={color.stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${color.text}`}>
          {Math.round(percentage)}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {solved}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Mini Bar Chart (for company cards) ───────────────────────
function MiniProgress({ solved, total }) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-500">{solved}/{total}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function Practice() {
  const { user, token } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [solvedSet, setSolvedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data on mount
  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      try {
        const [qData, cData, sData] = await Promise.all([
          fetchApprovedQuestions(),
          fetchCompanies(),
          fetchSolvedQuestions(user.uid),
        ]);
        setQuestions(qData);
        setCompanies(cData);
        setSolvedSet(new Set(sData));
      } catch (err) {
        console.error("Practice load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  // Toggle solved
  const handleToggle = async (questionId) => {
    if (!user?.uid) return;
    setToggling(questionId);
    const currently = solvedSet.has(questionId);
    const newSolved = !currently;

    // Optimistic update
    setSolvedSet((prev) => {
      const next = new Set(prev);
      newSolved ? next.add(questionId) : next.delete(questionId);
      return next;
    });

    try {
      await toggleSolvedQuestion(user.uid, questionId, newSolved, token);
    } catch (err) {
      console.error("Toggle error:", err);
      // Revert on failure
      setSolvedSet((prev) => {
        const next = new Set(prev);
        !newSolved ? next.add(questionId) : next.delete(questionId);
        return next;
      });
    } finally {
      setToggling(null);
    }
  };

  // Compute stats
  const companiesWithQuestions = companies
    .map((c) => {
      const companyQs = questions.filter(
        (q) => String(q.companyId) === String(c.id) || q.companyName === c.name
      );
      const solvedCount = companyQs.filter((q) => solvedSet.has(q.id)).length;
      return { ...c, questions: companyQs, solvedCount, totalCount: companyQs.length };
    })
    .filter((c) => c.totalCount > 0)
    .sort((a, b) => b.totalCount - a.totalCount);

  const totalQuestions = questions.length;
  const totalSolved = questions.filter((q) => solvedSet.has(q.id)).length;

  const filteredCompanies = companiesWithQuestions.filter((c) =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCompanyData = selectedCompany
    ? companiesWithQuestions.find((c) => String(c.id) === String(selectedCompany))
    : null;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-indigo-600" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Loading practice questions...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles size={24} className="text-indigo-500" />
            Practice Arena
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Company-wise questions • Track your progress • Ace the interviews
          </p>
        </div>

        {!selectedCompany && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white w-full sm:w-64"
            />
          </div>
        )}
      </div>

      {/* OVERALL STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Questions"
          value={totalQuestions}
          icon={<BookOpen size={20} />}
          gradient="from-indigo-500 to-violet-600"
        />
        <StatCard
          title="Solved"
          value={totalSolved}
          icon={<CheckCircle2 size={20} />}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Companies"
          value={companiesWithQuestions.length}
          icon={<Building2 size={20} />}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Accuracy"
          value={totalQuestions > 0 ? `${Math.round((totalSolved / totalQuestions) * 100)}%` : "—"}
          icon={<Target size={20} />}
          gradient="from-rose-500 to-pink-600"
        />
      </div>

      {/* ── COMPANY VIEW or QUESTION VIEW ── */}
      {!selectedCompany ? (
        /* ── COMPANY GRID ── */
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-600"
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 opacity-40 group-hover:opacity-80 transition-opacity" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-md">
                    {(company.name || "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {company.totalCount} question{company.totalCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {company.solvedCount === company.totalCount && company.totalCount > 0 && (
                    <Trophy size={18} className="text-amber-500 animate-bounce" />
                  )}
                </div>

                <MiniProgress solved={company.solvedCount} total={company.totalCount} />
              </button>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <BookOpen size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
              <p className="font-medium">No companies with questions found.</p>
              <p className="text-sm mt-1">Questions will appear once the admin adds them to the question bank.</p>
            </div>
          )}
        </>
      ) : (
        /* ── QUESTION DETAIL VIEW ── */
        <div className="grid gap-8 lg:grid-cols-3">

          {/* LEFT: questions list */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => setSelectedCompany(null)}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Companies
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-md">
                {(selectedCompanyData?.name || "?").charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCompanyData?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedCompanyData?.solvedCount || 0} of {selectedCompanyData?.totalCount || 0} solved
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(selectedCompanyData?.questions || []).map((q, idx) => {
                const isSolved = solvedSet.has(q.id);
                return (
                  <div
                    key={q.id}
                    className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
                      isSolved
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/10"
                        : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggle(q.id)}
                        disabled={toggling === q.id}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                          isSolved
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white hover:border-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-500"
                        } ${toggling === q.id ? "opacity-50" : ""}`}
                      >
                        {toggling === q.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isSolved ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-relaxed ${
                            isSolved
                              ? "text-slate-500 line-through dark:text-slate-400"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {q.text}
                        </p>

                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          {q.link && (
                            <a
                              href={q.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            >
                              <ExternalLink size={11} /> Solve on Platform
                            </a>
                          )}
                          {q.author && (
                            <span className="text-[10px] text-slate-400">
                              by {q.author}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {(selectedCompanyData?.questions || []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <BookOpen size={36} className="mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium">No questions yet for this company.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Donut chart & stats sidebar */}
          <div className="space-y-6">
            {/* Donut */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="mb-5 font-bold text-slate-900 dark:text-white text-center flex items-center justify-center gap-2">
                <BarChart3 size={16} className="text-indigo-500" /> Progress
              </h3>
              <div className="flex justify-center mb-4">
                <DonutChart
                  solved={selectedCompanyData?.solvedCount || 0}
                  total={selectedCompanyData?.totalCount || 0}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    Solved
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {selectedCompanyData?.solvedCount || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Remaining
                  </p>
                  <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                    {(selectedCompanyData?.totalCount || 0) - (selectedCompanyData?.solvedCount || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Summary Donut */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="mb-5 font-bold text-slate-900 dark:text-white text-center flex items-center justify-center gap-2">
                <Trophy size={16} className="text-amber-500" /> Overall
              </h3>
              <div className="flex justify-center mb-4">
                <DonutChart solved={totalSolved} total={totalQuestions} size={120} strokeWidth={12} />
              </div>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                {totalSolved} of {totalQuestions} total questions solved across all companies
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/80">
      <div className={`absolute top-0 right-0 h-16 w-16 rounded-full bg-gradient-to-br ${gradient} opacity-[0.05] -translate-y-10 translate-x-10 group-hover:opacity-[0.08] transition-opacity`} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}
