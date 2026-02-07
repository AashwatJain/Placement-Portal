import { 
  Code, 
  Github, 
  Globe, 
  RefreshCw, 
  Trophy,
  TrendingUp,
  Zap,
  Activity,
  Loader2 // Loading spinner
} from "lucide-react";
import { useCodingData } from "../../hooks/useCodingData"; // Hook import kiya

// Helper to get icon dynamically
const getIcon = (id) => {
  switch(id) {
    case 'codeforces': return <TrendingUp />;
    case 'leetcode': return <Code />;
    case 'codechef': return <Globe />;
    case 'github': return <Github />;
    default: return <Code />;
  }
};

const HEATMAP_MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

export default function CodingProfiles() {
  // Saara data hook se aa raha hai
  const { stats, platforms, loading } = useCodingData();

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-2 text-slate-500">Fetching coding profiles...</span>
      </div>
    );
  }

  // 2. Data Loaded View
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Coding Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Your unified competitive programming profile.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500">
           <RefreshCw size={16} /> Sync Now
        </button>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Questions" value={stats.totalQuestions} icon={<Code size={18} className="text-blue-500" />} />
        <StatCard title="Active Days" value={stats.activeDays} icon={<Activity size={18} className="text-green-500" />} />
        <StatCard title="Contests" value={stats.totalContests} icon={<Trophy size={18} className="text-amber-500" />} />
        <StatCard title="Max Streak" value={stats.maxStreak} icon={<Zap size={18} className="text-orange-500" />} />
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Heatmap (Visual Only for now) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-4 flex items-center justify-between">
               <h3 className="font-semibold text-slate-900 dark:text-white">Submission Activity</h3>
               <div className="text-xs text-slate-500">Last 6 Months</div>
            </div>
            <div className="flex justify-between gap-1 overflow-x-auto pb-2">
              {HEATMAP_MONTHS.map((month) => (
                <div key={month} className="flex flex-col gap-1">
                   <div className="grid grid-rows-7 grid-flow-col gap-1">
                      {Array.from({length: 28}).map((_, i) => (
                        <div key={i} className={`h-2.5 w-2.5 rounded-sm ${Math.random() > 0.7 ? "bg-green-500" : Math.random() > 0.4 ? "bg-green-500/50" : "bg-slate-100 dark:bg-slate-800"}`}></div>
                      ))}
                   </div>
                   <span className="text-[10px] text-slate-400 text-center mt-1">{month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms Grid - Dynamic from API */}
          <div className="grid gap-4 sm:grid-cols-2">
            {platforms.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.bg} ${p.color}`}>
                    {getIcon(p.id)}
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                     <p className="text-xs text-slate-500">@{p.handle}</p>
                  </div>
                </div>
                {p.id !== 'github' ? (
                  <div className="flex justify-between text-sm">
                    <div>
                       <p className="text-xs text-slate-500">Rating</p>
                       <p className={`font-bold ${p.color}`}>{p.rating}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-500 text-right">Solved</p>
                       <p className="font-bold text-slate-900 dark:text-white text-right">{p.solved}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <div>
                       <p className="text-xs text-slate-500">Repos</p>
                       <p className="font-bold text-slate-900 dark:text-white">{p.repos}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-500 text-right">Commits</p>
                       <p className="font-bold text-slate-900 dark:text-white text-right">{p.commits}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Problem Distribution */}
        <div className="space-y-6">
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="mb-6 font-semibold text-slate-900 dark:text-white">Problems Solved</h3>
              
              {/* Donut Chart Visual */}
              <div className="relative mx-auto mb-6 h-40 w-40">
                 <div className="absolute inset-0 rounded-full border-[12px] border-slate-100 dark:border-slate-800"></div>
                 <div className="absolute inset-0 rounded-full border-[12px] border-green-500 border-l-transparent border-b-transparent rotate-45"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalQuestions}</span>
                    <span className="text-xs text-slate-500">Total Solved</span>
                 </div>
              </div>

              {/* Stats List */}
              <div className="space-y-3">
                 <StatRow label="Easy" value={stats.problems.easy} color="text-green-700 dark:text-green-400" bg="bg-green-50 dark:bg-green-900/20" />
                 <StatRow label="Medium" value={stats.problems.medium} color="text-amber-700 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20" />
                 <StatRow label="Hard" value={stats.problems.hard} color="text-red-700 dark:text-red-400" bg="bg-red-50 dark:bg-red-900/20" />
              </div>
           </div>

           {/* Ratings List */}
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Live Ratings</h3>
              <ul className="space-y-4">
                 <RatingRow icon={<TrendingUp size={16} className="text-red-500"/>} name="Codeforces" value={stats.contestRankings.codeforces} />
                 <RatingRow icon={<Code size={16} className="text-amber-500"/>} name="LeetCode" value={stats.contestRankings.leetcode} />
                 <RatingRow icon={<Globe size={16} className="text-orange-500"/>} name="CodeChef" value={stats.contestRankings.codechef} />
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub Components for Cleaner Code ----

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function StatRow({ label, value, color, bg }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${bg}`}>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function RatingRow({ icon, name, value }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
         {icon} {name}
      </span>
      <span className="font-bold text-slate-900 dark:text-white">{value}</span>
    </li>
  );
}