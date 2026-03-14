import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

// ── Normalization (mirrors backend scoringUtil.js) ───────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

const chanceTag = (s) =>
  s >= 75 ? { label: "Strong", cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" }
  : s >= 45 ? { label: "Moderate", cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40" }
  : { label: "Low", cls: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40" };

const barColor = (s) =>
  s >= 75 ? "bg-emerald-500" : s >= 45 ? "bg-amber-500" : "bg-rose-400";

const tipText = (s) =>
  s >= 75 ? "Your profile lines up well — focus on interview prep and resume polish."
  : s >= 45 ? "You're in the zone. Pushing your LeetCode or CF rating up a notch will help."
  : "Focus on your weakest area — more LC problems or CP contests can move the needle.";

// ── Component ────────────────────────────────────────────────────────────────

export default function RecommendationsPanel() {
  const { user } = useAuth();

  // Profile
  const [studentProfile, setStudentProfile]       = useState(null);
  const [isLoadingProfile, setIsLoadingProfile]    = useState(true);
  const [scores, setScores]                        = useState({ dsa: 0, dev: 0, cp: 0 });

  // Recommendations
  const [companies, setCompanies]                  = useState([]);
  const [isLoadingRecs, setIsLoadingRecs]          = useState(false);
  const [recsError, setRecsError]                  = useState(null);

  // Chances
  const [companyInput, setCompanyInput]            = useState("");
  const [chance, setChance]                        = useState(null);
  const [isLoadingChance, setIsLoadingChance]      = useState(false);
  const [chanceError, setChanceError]              = useState(null);
  const [searched, setSearched]                    = useState(false);

  // ── Fetch real profile ─────────────────────────────────────────────────────
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

  // ── Fetch recommendations ──────────────────────────────────────────────────
  const fetchRecs = useCallback(async (vec) => {
    if (!vec) return;
    setIsLoadingRecs(true); setRecsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/recommendations`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfile: vec }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.status);
      setCompanies((await res.json()).recommendations || []);
    } catch (e) { setRecsError(e.message); }
    finally { setIsLoadingRecs(false); }
  }, []);

  useEffect(() => { if (studentProfile) fetchRecs(studentProfile); }, [studentProfile, fetchRecs]);

  // ── Predict chance ─────────────────────────────────────────────────────────
  const predictChance = async () => {
    const name = companyInput.trim();
    if (!name || !studentProfile) return;
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

  // ── Render ─────────────────────────────────────────────────────────────────

  const tag = chance !== null ? chanceTag(chance) : null;

  return (
    <div className="space-y-6">

      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Placement Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Based on your coding profile
          </p>
        </div>

        {!isLoadingProfile && studentProfile ? (
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              DSA <strong className="ml-1 text-slate-900 dark:text-white">{scores.dsa}</strong>
            </span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              CP <strong className="ml-1 text-slate-900 dark:text-white">{scores.cp}</strong>
            </span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Dev <strong className="ml-1 text-slate-900 dark:text-white">{scores.dev}</strong>
            </span>
            <button onClick={fetchProfile} title="Refresh"
              className="ml-1 rounded-md border border-slate-200 p-1.5 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition dark:border-slate-700 dark:hover:text-slate-200">
              <RefreshCw size={12} />
            </button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 size={12} className="animate-spin" /> Loading profile…
          </span>
        )}
      </div>

      {/* ── Company cards ────────────────────────────────────────────────────── */}
      {recsError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400">
          {recsError}
          <button onClick={() => fetchRecs(studentProfile)}
            className="ml-3 font-semibold underline underline-offset-2 hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {(isLoadingProfile || isLoadingRecs) && !recsError && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0,1,2].map(i => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
              <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800 mb-4" />
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {!isLoadingProfile && !isLoadingRecs && !recsError && companies.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => {
            const t = chanceTag(c.confidenceScore);
            return (
              <div key={c.placedCompany}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                    {c.placedCompany}
                  </h3>
                  <span className={`ml-2 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${t.cls}`}>
                    {t.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(c.confidenceScore)} transition-all duration-700`}
                      style={{ width: `${c.confidenceScore}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums w-8 text-right">
                    {c.confidenceScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoadingProfile && !isLoadingRecs && !recsError && companies.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-8">No recommendations yet.</p>
      )}

      {/* ── Chances predictor ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Check My Chances
        </h3>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && predictChance()}
              placeholder="Company name, e.g. Google"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500" />
          </div>
          <button onClick={predictChance}
            disabled={isLoadingChance || !companyInput.trim() || !studentProfile}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed dark:bg-indigo-600 dark:hover:bg-indigo-500">
            {isLoadingChance ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            Predict
          </button>
        </div>

        {chanceError && (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{chanceError}</p>
        )}

        {/* Result */}
        {!isLoadingChance && !chanceError && searched && chance !== null && (
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">{companyInput.trim()}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${tag.cls}`}>
                  {tag.label}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {chance}%
                </span>
              </div>
            </div>

            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full rounded-full ${barColor(chance)} transition-all duration-700`}
                style={{ width: `${chance}%` }} />
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {tipText(chance)}
            </p>
          </div>
        )}

        {!searched && (
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Enter any company name to see your predicted selection chance.
          </p>
        )}
      </div>

    </div>
  );
}
