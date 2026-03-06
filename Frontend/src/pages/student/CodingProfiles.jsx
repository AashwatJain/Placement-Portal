import React from "react";
import {
  Code, Github, Globe, RefreshCw, Trophy,
  TrendingUp, Activity, Loader2, Star, BarChart3
} from "lucide-react";
import { useCodingData } from "../../hooks/useCodingData";
import { ActivityCalendar } from "react-activity-calendar";

// Platform config with distinct gradient colors
const platformConfig = {
  leetcode: {
    icon: <Code size={22} />,
    gradient: "from-amber-500 to-orange-600",
    light: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    accent: "text-amber-500",
    ring: "ring-amber-500/20",
  },
  codeforces: {
    icon: <TrendingUp size={22} />,
    gradient: "from-blue-500 to-cyan-600",
    light: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    accent: "text-blue-500",
    ring: "ring-blue-500/20",
  },
  codechef: {
    icon: <Globe size={22} />,
    gradient: "from-orange-500 to-red-600",
    light: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    accent: "text-orange-500",
    ring: "ring-orange-500/20",
  },
  github: {
    icon: <Github size={22} />,
    gradient: "from-slate-600 to-slate-800",
    light: "bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-300",
    accent: "text-slate-600 dark:text-slate-300",
    ring: "ring-slate-500/20",
  },
};

const heatmapTheme = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
};

export default function CodingProfiles() {
  const { stats, platforms, heatmapData, loading, error, refreshData } = useCodingData();

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-indigo-600" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Syncing your coding profiles...
        </span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <div className="rounded-full bg-red-50 p-4 dark:bg-red-900/20">
          <Activity className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-red-500 font-medium">{error || "Failed to load dashboard data."}</p>
        <button onClick={refreshData} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95">
          Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Coding Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your unified competitive programming profile
          </p>
        </div>
        <button
          onClick={refreshData}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
        >
          <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-500" /> Sync Now
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassStatCard
          title="Total Solved"
          value={stats.totalSolved || 0}
          icon={<BarChart3 size={20} />}
          gradient="from-violet-500 to-purple-600"
        />
        <GlassStatCard
          title="Active Days"
          value={stats.activeDays || 0}
          icon={<Activity size={20} />}
          gradient="from-emerald-500 to-teal-600"
        />
        <GlassStatCard
          title="Contests"
          value={stats.totalContests}
          icon={<Trophy size={20} />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* HEATMAP */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 overflow-x-auto">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-slate-900 dark:text-white">Submission Activity</h3>
          <span className="ml-auto text-xs text-slate-400">Last 12 months</span>
        </div>
        <div className="flex justify-center w-full min-w-[700px] py-2 [&_text]:fill-slate-600 dark:[&_text]:fill-slate-300 [&_.react-activity-calendar__footer]:text-slate-500 dark:[&_.react-activity-calendar__footer]:text-slate-400">
          {heatmapData && heatmapData.length > 0 ? (
            <ActivityCalendar
              data={heatmapData}
              theme={heatmapTheme}
              colorScheme="dark"
              blockSize={13}
              blockRadius={3}
              blockMargin={4}
              fontSize={13}
              labels={{
                totalCount: `{{count}} submissions in the last year`
              }}
            />
          ) : (
            <p className="text-sm text-slate-400 text-center w-full py-8">No activity data yet. Add your handles in Profile to see stats.</p>
          )}
        </div>
      </div>

      {/* PLATFORMS + SIDEBAR */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* CONNECTED PLATFORMS */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star size={16} className="text-indigo-500" /> Connected Platforms
          </h3>
          {platforms && platforms.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {platforms.map((p) => {
                const config = platformConfig[p.id] || platformConfig.leetcode;
                return (
                  <div
                    key={p.id}
                    className={`group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/80 ring-1 ${config.ring}`}
                  >
                    {/* Top gradient line */}
                    <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${config.gradient} opacity-60`} />

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-md`}>
                        {config.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                          {p.title && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${config.gradient} text-white`}>
                              {p.title}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">@{p.handle}</p>
                      </div>
                    </div>

                    {p.id !== 'github' ? (
                      <div className="flex gap-3">
                        <div className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Rating</p>
                          <p className={`text-lg font-extrabold ${config.accent}`}>{p.rating}</p>
                        </div>
                        <div className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Solved</p>
                          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{p.solved}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Repos</p>
                          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{p.repos}</p>
                        </div>
                        <div className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Gists</p>
                          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{p.commits}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center dark:border-slate-700">
              <Code className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-sm text-slate-400">No platforms connected. Add your handles in Profile.</p>
            </div>
          )}
        </div>

        {/* SIDEBAR: Total + Ratings */}
        <div className="space-y-6">

          {/* DONUT CARD */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h3 className="mb-5 font-bold text-slate-900 dark:text-white text-center">Total Solved</h3>
            <div className="relative mx-auto mb-2 h-36 w-36">
              {/* Subtle outer ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 blur-sm" />
              {/* Background circle */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-800" />
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="12"
                  className="stroke-indigo-500"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min((stats.totalSolved || 0) / 20, 314)} 314`}
                  style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats.totalSolved || 0}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Problems</span>
              </div>
            </div>
          </div>

          {/* LIVE RATINGS */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h3 className="mb-5 font-bold text-slate-900 dark:text-white">Live Ratings</h3>
            <div className="space-y-3">
              <RatingBadge
                icon={<TrendingUp size={16} />}
                name="Codeforces"
                value={stats.contestRankings?.codeforces || "Unrated"}
                title={platforms?.find(p => p.id === 'codeforces')?.title}
                gradient="from-blue-500 to-cyan-500"
              />
              <RatingBadge
                icon={<Code size={16} />}
                name="LeetCode"
                value={stats.contestRankings?.leetcode || "Unrated"}
                title={platforms?.find(p => p.id === 'leetcode')?.title}
                gradient="from-amber-500 to-orange-500"
              />
              <RatingBadge
                icon={<Globe size={16} />}
                name="CodeChef"
                value={stats.contestRankings?.codechef || "Unrated"}
                title={platforms?.find(p => p.id === 'codechef')?.title}
                gradient="from-orange-500 to-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function GlassStatCard({ title, value, icon, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/80">
      {/* Gradient accent */}
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

function RatingBadge({ icon, name, value, title, gradient }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
      <span className="flex items-center gap-2.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}>
          {icon}
        </div>
        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{name}</span>
        {title && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
            {title}
          </span>
        )}
      </span>
      <span className="font-extrabold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}