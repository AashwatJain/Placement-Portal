import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Brain, Loader2, RefreshCw, Search, ArrowRight,
  ChevronRight, Trophy, Code2, GitBranch, Zap,
  TrendingUp, Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useCompanies } from "../../hooks/useCompanies";

/* ── Normalization (mirrors backend scoringUtil.js) ──────────────────────── */

const toScore = (val, cap) =>
  Math.round(Math.min(100, Math.max(0, (val / cap) * 100)) * 100) / 100;

const computeProfileVector = (platforms) => {
  const lc = platforms?.find((p) => p.id === "leetcode");
  const cf = platforms?.find((p) => p.id === "codeforces");
  const gh = platforms?.find((p) => p.id === "github");

  const dsaScore = toScore(typeof lc?.solved === "number" ? lc.solved : 0, 500);
  const devScore = toScore(typeof gh?.repos  === "number" ? gh.repos  : 0, 50);
  const cpScore  = toScore(typeof cf?.rating === "number" ? cf.rating : 0, 2400);

  return [dsaScore, devScore, cpScore];
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const chanceTag = (s) =>
  s >= 75 ? { label: "Strong",   cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" }
  : s >= 45 ? { label: "Moderate", cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" }
  : { label: "Low", cls: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" };

const barGradient = (s) =>
  s >= 75 ? "from-emerald-400 to-emerald-600" : s >= 45 ? "from-amber-400 to-amber-600" : "from-rose-400 to-rose-500";

const tipText = (s) =>
  s >= 75 ? "Your profile lines up well — focus on interview prep and resume polish."
  : s >= 45 ? "You're in the zone. Pushing your LeetCode or CF rating up a notch will help."
  : "Focus on your weakest area — more LC problems or CP contests can move the needle.";

/* ── Animated Score Ring ─────────────────────────────────────────────────── */

function ScoreRing({ value, size = 100, strokeWidth = 8, color, label, icon: Icon }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-100 dark:stroke-slate-800" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            strokeWidth={strokeWidth} stroke={color} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={18} style={{ color }} className="mb-0.5" />
          <span className="text-lg font-black tabular-nums" style={{ color }}>{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ── Rank Badge ──────────────────────────────────────────────────────────── */

function RankBadge({ rank }) {
  const colors = {
    1: "from-yellow-400 to-amber-500 text-amber-950 shadow-amber-300/30",
    2: "from-slate-300 to-slate-400 text-slate-800 shadow-slate-300/30",
    3: "from-amber-600 to-amber-700 text-amber-100 shadow-amber-500/20",
  };
  const cls = colors[rank] || "from-slate-200 to-slate-300 text-slate-700 dark:from-slate-700 dark:to-slate-600 dark:text-slate-300";

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br font-black text-sm shadow-md ${cls}`}>
      {rank}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ── Main Page Component ────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ── Known company names for autocomplete ────────────────────────────────── */

const COMPANY_NAMES = [
  "Google", "Microsoft", "Amazon", "Adobe", "Uber", "Directi",
  "DE Shaw", "Goldman Sachs", "JP Morgan Chase & Co.", "Morgan Stanley",
  "Arcesium", "Bajaj Finserv", "Flipkart", "PhonePe", "Paytm",
  "Oyo Rooms", "Swiggy", "Zomato", "TCS", "Infosys", "Wipro",
];

export default function PlacementInsights() {
  const { user } = useAuth();
  const { companies: allCompanies } = useCompanies();

  // Profile
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [scores, setScores] = useState({ dsa: 0, dev: 0, cp: 0 });

  // Recommendations
  const [mlRecommendations, setMlRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState(null);

  // Chances
  const [companyInput, setCompanyInput] = useState("");
  const [chance, setChance] = useState(null);
  const [isLoadingChance, setIsLoadingChance] = useState(false);
  const [chanceError, setChanceError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = companyInput.trim().length > 0
    ? COMPANY_NAMES.filter(name =>
        name.toLowerCase().includes(companyInput.trim().toLowerCase())
      )
    : [];

  /* ── Fetch real profile ────────────────────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingProfile(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/student/coding-stats/${user.uid}`);
      const data = await res.json();
      if (data.success && data.platforms) {
        const v = computeProfileVector(data.platforms);
        setStudentProfile(v);
        setScores({ dsa: v[0], dev: v[1], cp: v[2] });
      }
    } catch { setStudentProfile([50, 50, 50]); }
    finally  { setIsLoadingProfile(false); }
  }, [user?.uid]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── Fetch recommendations ─────────────────────────────────────────────── */
  const fetchRecs = useCallback(async (vec) => {
    if (!vec) return;
    setIsLoadingRecs(true); setRecsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/recommendations`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfile: vec }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.status);
      setMlRecommendations((await res.json()).recommendations || []);
    } catch (e) { setRecsError(e.message); }
    finally { setIsLoadingRecs(false); }
  }, []);

  useEffect(() => { if (studentProfile) fetchRecs(studentProfile); }, [studentProfile, fetchRecs]);

  /* ── Predict chance ────────────────────────────────────────────────────── */
  const predictChance = async () => {
    const name = companyInput.trim();
    if (!name || !studentProfile) return;
    setShowSuggestions(false);
    setIsLoadingChance(true); setChanceError(null); setChance(null); setSearched(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/company-chances`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfile, targetCompany: name }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.status);
      setChance((await res.json()).selectionChance ?? null);
    } catch (e) { setChanceError(e.message); }
    finally { setIsLoadingChance(false); }
  };

  /* ── Build top 5 recommendations ───────────────────────────────────────── */
  const top5 = (() => {
    if (mlRecommendations.length === 0) return [];

    const mlMap = {};
    mlRecommendations.forEach(r => {
      mlMap[r.placedCompany.toLowerCase()] = r.confidenceScore;
    });

    // Match ML recommendations with company details from DB
    const scored = allCompanies.map(c => ({
      ...c,
      matchScore: mlMap[c.name?.toLowerCase()] || 0,
    }));

    // Also include ML recommendations not found in DB companies
    mlRecommendations.forEach(r => {
      const exists = scored.some(s => s.name?.toLowerCase() === r.placedCompany.toLowerCase());
      if (!exists) {
        scored.push({
          id: r.placedCompany,
          name: r.placedCompany,
          matchScore: r.confidenceScore,
        });
      }
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.filter(c => c.matchScore > 0).slice(0, 5);
  })();

  const tag = chance !== null ? chanceTag(chance) : null;
  const isLoading = isLoadingProfile || isLoadingRecs;

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <Brain size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Placement Insights</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered placement analysis based on your coding profile</p>
          </div>
        </div>
        <button
          onClick={fetchProfile}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>


      {/* ── Profile Score Cards ──────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Your Profile Scores
          </h2>
        </div>

        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
            <span className="ml-2 text-sm text-slate-400">Analyzing your profile…</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            <ScoreRing value={scores.dsa} color="#6366f1" label="DSA" icon={Code2} />
            <ScoreRing value={scores.cp}  color="#f59e0b" label="Competitive" icon={Zap} />
            <ScoreRing value={scores.dev} color="#10b981" label="Development" icon={GitBranch} />
          </div>
        )}

        {!isLoadingProfile && studentProfile && (
          <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
            Scores normalized from your LeetCode, Codeforces, and GitHub activity
          </p>
        )}
      </section>


      {/* ── Top 5 Recommended Companies ──────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top 5 Recommended Companies</h2>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">ML Powered</span>
        </div>

        {recsError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400">
            {recsError}
            <button onClick={() => fetchRecs(studentProfile)}
              className="ml-3 font-semibold underline underline-offset-2 hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {isLoading && !recsError && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800 mb-3" />
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !recsError && top5.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top5.map((c, idx) => {
              const t = chanceTag(c.matchScore);
              return (
                <div key={c.id || c.name}
                  className="group relative rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-3 -left-2">
                    <RankBadge rank={idx + 1} />
                  </div>

                  {/* Company Info */}
                  <div className="ml-6 mb-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {c.name}
                      </h3>
                      <span className={`ml-2 shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${t.cls}`}>
                        {t.label}
                      </span>
                    </div>
                    {c.type && (
                      <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {c.type}
                      </span>
                    )}
                  </div>

                  {/* Score Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Match Score</span>
                      <span className="font-black text-slate-900 dark:text-white tabular-nums">{c.matchScore}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${barGradient(c.matchScore)} transition-all duration-1000 ease-out`}
                        style={{ width: `${c.matchScore}%` }} />
                    </div>
                  </div>

                  {/* CTA */}
                  {c.cgpaCutoff && (
                    <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
                      CGPA Cutoff: <span className="font-semibold text-slate-600 dark:text-slate-300">{c.cgpaCutoff}+</span>
                    </p>
                  )}

                  {c.id && typeof c.id === "string" && c.id !== c.name && (
                    <Link to={`/student/company/${c.id}`}
                      className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition">
                      View Details <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !recsError && top5.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <TrendingUp size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No recommendations yet</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Connect your coding profiles to get personalized placement recommendations
            </p>
            <Link to="/student/coding-profiles"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm">
              Connect Profiles <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </section>


      {/* ── Check My Chances (with Autocomplete) ─────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} className="text-slate-500 dark:text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Check My Chances</h2>
        </div>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Enter any company name to see your predicted selection chance based on past placement data.
        </p>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <input type="text" value={companyInput}
              onChange={(e) => { setCompanyInput(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && predictChance()}
              placeholder="Company name, e.g. Google"
              autoComplete="off"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 transition" />

            {/* ── Autocomplete dropdown ── */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                {suggestions.map((name) => {
                  const idx = name.toLowerCase().indexOf(companyInput.trim().toLowerCase());
                  const before = name.slice(0, idx);
                  const match  = name.slice(idx, idx + companyInput.trim().length);
                  const after  = name.slice(idx + companyInput.trim().length);
                  return (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setCompanyInput(name); setShowSuggestions(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <Search size={12} className="shrink-0 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {before}<span className="font-bold text-indigo-600 dark:text-indigo-400">{match}</span>{after}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button onClick={predictChance}
            disabled={isLoadingChance || !companyInput.trim() || !studentProfile}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
            {isLoadingChance ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Predict
          </button>
        </div>

        {chanceError && (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{chanceError}</p>
        )}

        {/* Result */}
        {!isLoadingChance && !chanceError && searched && chance !== null && (
          <div className="mt-5 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prediction for</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{companyInput.trim()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${tag.cls}`}>
                  {tag.label}
                </span>
                <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">
                  {chance}<span className="text-lg text-slate-400">%</span>
                </span>
              </div>
            </div>

            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${barGradient(chance)} transition-all duration-1000 ease-out`}
                style={{ width: `${chance}%` }} />
            </div>

            <p className="mt-4 rounded-lg bg-indigo-50 px-4 py-2.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400">
              💡 {tipText(chance)}
            </p>
          </div>
        )}

        {!searched && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Zap size={12} />
            <span>Uses KNN algorithm trained on historical placement data</span>
          </div>
        )}
      </section>

    </div>
  );
}
