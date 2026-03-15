import { useState, useEffect } from "react";
import { Users, Building2, Briefcase, GraduationCap, TrendingUp, Presentation, Loader2 } from "lucide-react";
import { fetchPlacementOverview } from "../../services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    placedStudents: 0,
    totalDrives: 0,
    placementPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchPlacementOverview();
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      description: "Registered for placements"
    },
    {
      title: "Students Placed",
      value: stats.placedStudents,
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-600",
      description: `${stats.placementPercentage}% of total students`
    },
    {
      title: "Active Drives",
      value: stats.totalDrives,
      icon: Building2,
      color: "from-amber-500 to-orange-600",
      description: "Ongoing & upcoming"
    },
    {
      title: "Avg Package",
      value: "Coming Soon", // Placeholder until CTC tracking is fully added
      icon: TrendingUp,
      color: "from-purple-500 to-fuchsia-600",
      description: "Overall tracking"
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors flex items-center gap-2">
            <Presentation className="text-indigo-600 dark:text-indigo-400" /> Administrative Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors">Overview of placement activities and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
            <div className={`h-1.5 w-full bg-gradient-to-r ${card.color}`}></div>
            <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-inner`}>
                        <card.icon size={24} />
                    </div>
                </div>
                <div>
                    <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{card.title}</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                </div>
                <div className="mt-auto pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {card.description}
                </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 min-h-[300px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/20 z-0"></div>
            <div className="relative z-10 text-center space-y-3">
                <Briefcase size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Detailed Branch Demographics</p>
                <p className="text-sm text-slate-500">Coming in Phase 3</p>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 min-h-[300px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/20 z-0"></div>
            <div className="relative z-10 text-center space-y-3">
                <TrendingUp size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Year-over-Year Placement Trends</p>
                <p className="text-sm text-slate-500">Coming in Phase 3</p>
            </div>
        </div>
      </div>
    </div>
  );
}
