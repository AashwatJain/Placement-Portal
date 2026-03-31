import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  fetchApprovedQuestions,
  fetchSolvedQuestions,
  toggleSolvedQuestion,
  fetchCompanies,
  fetchUserApplications,
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
  Star,
  Filter,
} from "lucide-react";

const DIFF_CONFIG = {
  Easy:   { color: "#10b981", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  Medium: { color: "#f59e0b", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  Hard:   { color: "#ef4444", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
};
const getDiff = (d) => DIFF_CONFIG[d] || DIFF_CONFIG.Medium;

function DonutChart({ solved, total, size = 140, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return { stroke: "#10b981", text: "text-emerald-500" };
    if (percentage >= 50) return { stroke: "#6366f1", text: "text-brand-amber-500/100" };
    if (percentage >= 25) return { stroke: "#f59e0b", text: "text-amber-500" };
    return { stroke: "#94a3b8", text: "text-brand-brown-400" };
  };
  const color = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className="stroke-brand-beige-100 dark:stroke-brand-brown-800"
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
        <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-brown-400">
          {solved}/{total}
        </span>
      </div>
    </div>
  );
}

function PieChart({ easy, medium, hard, size = 120 }) {
  const total = easy + medium + hard;
  if (total === 0) return null;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;

  const slices = [
    { count: easy, color: "#10b981", label: "Easy" },
    { count: medium, color: "#f59e0b", label: "Medium" },
    { count: hard, color: "#ef4444", label: "Hard" },
  ].filter(s => s.count > 0);

  let cumAngle = -90;
  const paths = slices.map((slice) => {
    const angle = (slice.count / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={slice.label} d={d} fill={slice.color} opacity={0.85} />;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="drop-shadow-sm">
        {paths}
        <circle cx={cx} cy={cy} r={r * 0.45} className="fill-white dark:fill-brand-brown-900" />
      </svg>
      <div className="space-y-1.5">
        {[
          { label: "Easy", count: easy, color: "bg-emerald-500" },
          { label: "Medium", count: medium, color: "bg-amber-500" },
          { label: "Hard", count: hard, color: "bg-red-500" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
            <span className="font-medium text-brand-brown-600 dark:text-brand-beige-300">{s.label}</span>
            <span className="font-bold text-brand-brown-900 dark:text-white">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyBarChart({ companies, maxBars = 6 }) {
  const top = companies.slice(0, maxBars);
  if (top.length === 0) return null;
  const maxCount = Math.max(...top.map(c => c.totalCount), 1);

  return (
    <div className="space-y-2.5">
      {top.map((c) => (
        <div key={c.id} className="group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-brand-brown-700 dark:text-brand-beige-300 truncate max-w-[120px]">{c.name}</span>
            <span className="text-[10px] font-bold text-brand-cream-500">{c.solvedCount}/{c.totalCount}</span>
          </div>
          <div className="h-2 rounded-full bg-brand-beige-100 dark:bg-[#2A1810] overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${(c.totalCount / maxCount) * 100}%`,
                background: `linear-gradient(to right, #6366f1 ${c.totalCount > 0 ? (c.solvedCount / c.totalCount) * 100 : 0}%, #e2e8f0 ${c.totalCount > 0 ? (c.solvedCount / c.totalCount) * 100 : 0}%)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniProgress({ solved, total }) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-brand-beige-100 dark:bg-[#2A1810] overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-brand-amber-500/100 to-violet-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-brand-cream-500">{solved}/{total}</span>
    </div>
  );
}

export default function Practice() {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [solvedSet, setSolvedSet] = useState(new Set());
  const [appliedCompanies, setAppliedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");

  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      try {
        const [qData, cData, sData, appData] = await Promise.all([
          fetchApprovedQuestions(),
          fetchCompanies(),
          fetchSolvedQuestions(user.uid),
          fetchUserApplications(user.uid).catch(() => []),
        ]);
        setQuestions(qData);
        setCompanies(cData);
        setSolvedSet(new Set(sData));
        const appliedNames = [...new Set(appData.map(a => a.company).filter(Boolean))];
        setAppliedCompanies(appliedNames);
      } catch (err) {
        console.error("Practice load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

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
      const freshSolved = await fetchSolvedQuestions(user.uid);
      setSolvedSet(new Set(freshSolved));
    } catch (err) {
      console.error("Toggle error:", err);
      setSolvedSet((prev) => {
        const next = new Set(prev);
        !newSolved ? next.add(questionId) : next.delete(questionId);
        return next;
      });
      showToast({ type: "error", title: "Error", message: "Failed to update question status. Please try again." });
    } finally {
      setToggling(null);
    }
  };

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

  const easyCount = questions.filter(q => (q.difficulty || "Medium") === "Easy").length;
  const mediumCount = questions.filter(q => (q.difficulty || "Medium") === "Medium").length;
  const hardCount = questions.filter(q => (q.difficulty || "Medium") === "Hard").length;

  const recommendedCompanies = companiesWithQuestions.filter(c =>
    appliedCompanies.some(name => c.name?.toLowerCase() === name?.toLowerCase())
  );

  const filteredCompanies = companiesWithQuestions.filter((c) =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCompanyData = selectedCompany
    ? companiesWithQuestions.find((c) => String(c.id) === String(selectedCompany))
    : null;

  const filteredQuestions = selectedCompanyData
    ? (selectedCompanyData.questions || []).filter(q =>
        diffFilter === "All" ? true : (q.difficulty || "Medium") === diffFilter
      )
    : [];

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-brand-amber-500/20 dark:border-brand-amber-800/50" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-brand-amber-500" />
        </div>
        <span className="text-sm font-medium text-brand-cream-500 dark:text-brand-beige-400 animate-pulse">
          Loading practice questions...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-brown-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles size={24} className="text-brand-amber-500/100" />
            Practice Arena
          </h1>
          <p className="text-sm text-brand-cream-500 dark:text-brand-beige-400 mt-1">
            Company-wise questions • Track your progress • Ace the interviews
          </p>
        </div>

        {!selectedCompany && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-brown-400" />
            <input
              type="text"
              placeholder="Search company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border border-brand-beige-200 bg-white pl-9 pr-4 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white w-full sm:w-64"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-3 lg:col-span-1">
          <StatCard title="Total" value={totalQuestions} icon={<BookOpen size={18} />} gradient="from-brand-amber-500/100 to-violet-600" />
          <StatCard title="Solved" value={totalSolved} icon={<CheckCircle2 size={18} />} gradient="from-emerald-500 to-teal-600" />
          <StatCard title="Companies" value={companiesWithQuestions.length} icon={<Building2 size={18} />} gradient="from-amber-500 to-orange-600" />
          <StatCard title="Accuracy" value={totalQuestions > 0 ? `${Math.round((totalSolved / totalQuestions) * 100)}%` : "—"} icon={<Target size={18} />} gradient="from-rose-500 to-pink-600" />
        </div>

        <div className="rounded-2xl border border-brand-beige-200/80 bg-white p-5 shadow-sm dark:border-[#3E2315] dark:bg-[#1A0F08]/80 flex flex-col items-center justify-center">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-cream-500 flex items-center gap-1.5">
            <BarChart3 size={14} className="text-brand-amber-500/100" /> Difficulty Distribution
          </h3>
          <PieChart easy={easyCount} medium={mediumCount} hard={hardCount} />
        </div>

        <div className="rounded-2xl border border-brand-beige-200/80 bg-white p-5 shadow-sm dark:border-[#3E2315] dark:bg-[#1A0F08]/80">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-cream-500 flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500" /> Company Progress
          </h3>
          <CompanyBarChart companies={companiesWithQuestions} />
        </div>
      </div>

      {!selectedCompany && recommendedCompanies.length > 0 && (
        <div className="rounded-2xl border-2 border-dashed border-brand-amber-500/40 dark:border-brand-amber-600 bg-brand-amber-500/10/50 dark:bg-brand-amber-900/20 p-5">
          <h3 className="mb-3 text-sm font-bold text-brand-amber-800 dark:text-brand-amber-500/40 flex items-center gap-2">
            <Star size={16} className="text-brand-amber-500/100" /> Recommended for You
            <span className="text-[10px] font-medium text-brand-amber-500/100 dark:text-brand-amber-500 ml-1">Based on your applications</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className="group flex items-center gap-3 rounded-xl border border-brand-amber-500/30 dark:border-brand-amber-700 bg-white dark:bg-[#1A0F08] p-3 text-left transition-all hover:shadow-md hover:border-brand-amber-500 dark:hover:border-brand-amber-500"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-sm font-bold text-white shadow">
                  {(company.name || "?").charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-brand-brown-900 dark:text-white truncate">{company.name}</p>
                  <p className="text-[10px] text-brand-cream-500">
                    {company.totalCount - company.solvedCount} unsolved • {company.totalCount} total
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedCompany ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company.id)}
                className="group relative flex flex-col justify-between rounded-2xl border border-brand-beige-200/80 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-amber-500 dark:border-[#3E2315] dark:bg-[#1A0F08]/80 dark:hover:border-brand-amber-500"
              >
                <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-brand-amber-500/100 to-violet-500 opacity-40 group-hover:opacity-80 transition-opacity" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-xl font-bold text-white shadow-md">
                    {(company.name || "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-brand-brown-900 dark:text-white truncate group-hover:text-brand-amber-500 dark:group-hover:text-brand-amber-500 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-brand-brown-400">
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
            <div className="flex flex-col items-center justify-center py-16 text-brand-cream-500">
              <BookOpen size={48} className="mb-4 text-brand-beige-300 dark:text-brand-brown-600" />
              <p className="font-medium">No companies with questions found.</p>
              <p className="text-sm mt-1">Questions will appear once the admin adds them to the question bank.</p>
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setSelectedCompany(null); setDiffFilter("All"); }}
                className="flex items-center gap-2 text-sm font-medium text-brand-amber-500 hover:text-brand-amber-600 dark:text-brand-amber-500 dark:hover:text-brand-amber-500/40 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Companies
              </button>

              <div className="flex items-center gap-1 bg-brand-beige-100 dark:bg-[#2A1810] rounded-lg p-0.5">
                <Filter size={12} className="ml-2 text-brand-brown-400" />
                {["All", "Easy", "Medium", "Hard"].map(d => (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                      diffFilter === d
                        ? "bg-white dark:bg-brand-brown-700 text-brand-brown-900 dark:text-white shadow-sm"
                        : "text-brand-cream-500 hover:text-brand-brown-700 dark:hover:text-brand-beige-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-xl font-bold text-white shadow-md">
                {(selectedCompanyData?.name || "?").charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-brown-900 dark:text-white">
                  {selectedCompanyData?.name}
                </h2>
                <p className="text-xs text-brand-cream-500">
                  {selectedCompanyData?.solvedCount || 0} of {selectedCompanyData?.totalCount || 0} solved
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => {
                const isSolved = solvedSet.has(q.id);
                const diff = getDiff(q.difficulty || "Medium");
                return (
                  <div
                    key={q.id}
                    className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
                      isSolved
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/10"
                        : "border-brand-beige-200 bg-white hover:border-brand-amber-500/30 dark:border-[#3E2315] dark:bg-[#1A0F08]/80 dark:hover:border-brand-amber-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggle(q.id)}
                        disabled={toggling === q.id}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                          isSolved
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-brand-beige-300 bg-white hover:border-brand-amber-500 dark:border-[#7A543A] dark:bg-[#2A1810] dark:hover:border-brand-amber-500/100"
                        } ${toggling === q.id ? "opacity-50" : ""}`}
                      >
                        {toggling === q.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isSolved ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <span className="text-[10px] font-bold text-brand-brown-400">{idx + 1}</span>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${diff.bg} ${diff.text} ${diff.border}`}>
                            {q.difficulty || "Medium"}
                          </span>
                          {(q.tags || []).map(tag => (
                            <span key={tag} className="inline-flex items-center rounded-md bg-brand-beige-100 dark:bg-[#2A1810] px-1.5 py-0.5 text-[10px] font-medium text-brand-brown-600 dark:text-brand-beige-400">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p
                          className={`text-sm leading-relaxed ${
                            isSolved
                              ? "text-brand-cream-500 line-through dark:text-brand-beige-400"
                              : "text-brand-brown-800 dark:text-brand-beige-200"
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
                              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-amber-500/10 dark:bg-brand-amber-800/20 px-3 py-1.5 text-[11px] font-bold text-brand-amber-500 hover:bg-brand-amber-500/20 dark:text-brand-amber-500 dark:hover:bg-brand-amber-800/40 transition-colors border border-brand-amber-500/30 dark:border-brand-amber-700"
                            >
                              <ExternalLink size={12} /> Solve on Platform
                            </a>
                          )}
                          {q.author && (
                            <span className="text-[10px] text-brand-brown-400">
                              by {q.author}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-brand-cream-500">
                  <BookOpen size={36} className="mb-3 text-brand-beige-300 dark:text-brand-brown-600" />
                  <p className="text-sm font-medium">
                    {diffFilter !== "All"
                      ? `No ${diffFilter} questions for this company.`
                      : "No questions yet for this company."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-brand-beige-200/80 bg-white p-6 shadow-sm dark:border-[#3E2315] dark:bg-[#1A0F08]/80">
              <h3 className="mb-5 font-bold text-brand-brown-900 dark:text-white text-center flex items-center justify-center gap-2">
                <BarChart3 size={16} className="text-brand-amber-500/100" /> Progress
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
                <div className="rounded-xl bg-brand-cream-50 dark:bg-[#2A1810]/50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-cream-500 mb-1">
                    Remaining
                  </p>
                  <p className="text-2xl font-black text-brand-brown-700 dark:text-brand-beige-300">
                    {(selectedCompanyData?.totalCount || 0) - (selectedCompanyData?.solvedCount || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-beige-200/80 bg-white p-6 shadow-sm dark:border-[#3E2315] dark:bg-[#1A0F08]/80">
              <h3 className="mb-4 font-bold text-brand-brown-900 dark:text-white text-center text-sm">Difficulty Breakdown</h3>
              <PieChart
                easy={(selectedCompanyData?.questions || []).filter(q => (q.difficulty || "Medium") === "Easy").length}
                medium={(selectedCompanyData?.questions || []).filter(q => (q.difficulty || "Medium") === "Medium").length}
                hard={(selectedCompanyData?.questions || []).filter(q => (q.difficulty || "Medium") === "Hard").length}
                size={100}
              />
            </div>

            <div className="rounded-2xl border border-brand-beige-200/80 bg-white p-6 shadow-sm dark:border-[#3E2315] dark:bg-[#1A0F08]/80">
              <h3 className="mb-5 font-bold text-brand-brown-900 dark:text-white text-center flex items-center justify-center gap-2">
                <Trophy size={16} className="text-amber-500" /> Overall
              </h3>
              <div className="flex justify-center mb-4">
                <DonutChart solved={totalSolved} total={totalQuestions} size={120} strokeWidth={12} />
              </div>
              <p className="text-center text-xs text-brand-cream-500 dark:text-brand-beige-400">
                {totalSolved} of {totalQuestions} total questions solved across all companies
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-beige-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-[#3E2315] dark:bg-[#1A0F08]/80">
      <div className={`absolute top-0 right-0 h-16 w-16 rounded-full bg-gradient-to-br ${gradient} opacity-[0.05] -translate-y-10 translate-x-10 group-hover:opacity-[0.08] transition-opacity`} />
      <div className="relative">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-400">{title}</span>
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}>
            {icon}
          </div>
        </div>
        <div className="text-2xl font-black text-brand-brown-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}
