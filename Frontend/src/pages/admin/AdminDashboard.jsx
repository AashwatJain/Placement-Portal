import { useState, useEffect } from "react";
import {
  Users, Building2, CheckCircle, Clock,
  Target, TrendingUp, GraduationCap, Briefcase, Presentation
} from "lucide-react";
import PageLoader from "../../components/ui/PageLoader";
import { fetchPlacementOverview, fetchDashboardBranch } from "../../services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    placedStudents: 0,
    totalDrives: 0,
    placementPercentage: 0,
  });
  const [branchData, setBranchData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [overviewRes, branchRes] = await Promise.allSettled([
          fetchPlacementOverview(),
          fetchDashboardBranch(),
        ]);

        if (overviewRes.status === "fulfilled" && overviewRes.value.stats) {
          setStats(overviewRes.value.stats);
        }
        if (branchRes.status === "fulfilled") {
          setBranchData(branchRes.value || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "from-brand-amber-500/100 to-brand-amber-500",
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
      title: "Unplaced",
      value: stats.totalStudents - stats.placedStudents,
      icon: TrendingUp,
      color: "from-purple-500 to-fuchsia-600",
      description: "Yet to be placed"
    }
  ];

  // Find the max total for bar scaling
  const maxTotal = branchData.length > 0 ? Math.max(...branchData.map(b => b.total)) : 1;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white transition-colors flex items-center gap-2">
            <Presentation className="text-brand-amber-500 dark:text-brand-amber-500" /> Administrative Dashboard
        </h1>
        <p className="text-brand-brown-600 dark:text-brand-beige-400 mt-1 transition-colors">Overview of placement activities and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1A0F08] overflow-hidden rounded-2xl border border-brand-beige-200 dark:border-[#3E2315] shadow-sm transition-all hover:shadow-md group">
            <div className={`h-1.5 w-full bg-gradient-to-r ${card.color}`}></div>
            <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-inner`}>
                        <card.icon size={24} />
                    </div>
                </div>
                <div>
                    <h3 className="text-[13px] font-semibold text-brand-cream-500 dark:text-brand-beige-400 uppercase tracking-wider mb-1">{card.title}</h3>
                    <p className="text-3xl font-bold text-brand-brown-900 dark:text-white">{card.value}</p>
                </div>
                <div className="mt-auto pt-4 text-xs font-medium text-brand-cream-500 dark:text-brand-beige-400">
                    {card.description}
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-[#1A0F08] rounded-2xl border border-brand-beige-200 dark:border-[#3E2315] shadow-sm p-6 relative overflow-hidden">
            <h3 className="font-semibold text-brand-brown-900 dark:text-white mb-1 flex items-center gap-2">
                <Briefcase size={18} className="text-brand-amber-500/100" /> Branch Demographics
            </h3>
            <p className="text-xs text-brand-cream-500 dark:text-brand-beige-400 mb-5">Placement rate and student count by branch</p>

            {branchData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-brand-brown-400">
                    <Users size={36} className="mb-3 opacity-20" />
                    <p className="text-sm">No student data available yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {branchData.map((b) => {
                        const placedPct = b.total > 0 ? (b.placed / b.total) * 100 : 0;
                        const barWidth = (b.total / maxTotal) * 100;
                        return (
                            <div key={b.branch}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-semibold text-brand-brown-700 dark:text-brand-beige-300">{b.branch}</span>
                                    <div className="flex items-center gap-3 text-xs text-brand-cream-500 dark:text-brand-beige-400">
                                        <span>{b.total} students</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{b.placed} placed</span>
                                    </div>
                                </div>
                                <div className="relative h-6 bg-brand-beige-100 dark:bg-[#2A1810] rounded-full overflow-hidden" style={{ width: `${barWidth}%`, minWidth: '60px' }}>
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-amber-500/100 to-brand-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${placedPct}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
                                        {placedPct.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Placement Summary */}
        <div className="bg-white dark:bg-[#1A0F08] rounded-2xl border border-brand-beige-200 dark:border-[#3E2315] shadow-sm p-6 relative overflow-hidden">
            <h3 className="font-semibold text-brand-brown-900 dark:text-white mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" /> Placement Summary
            </h3>
            <p className="text-xs text-brand-cream-500 dark:text-brand-beige-400 mb-5">Overall placement progress</p>

            <div className="flex items-center justify-center py-4">
              {/* Donut-style progress */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    className="text-brand-beige-100 dark:text-brand-brown-800"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeDasharray={`${stats.placementPercentage}, 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-brand-brown-900 dark:text-white">{stats.placementPercentage}%</span>
                  <span className="text-xs text-brand-cream-500 dark:text-brand-beige-400">Placed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-brand-cream-50 dark:bg-[#2A1810]/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-brand-brown-900 dark:text-white">{stats.totalStudents}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-cream-500 dark:text-brand-beige-400">Total</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.placedStudents}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-cream-500 dark:text-brand-beige-400">Placed</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.totalStudents - stats.placedStudents}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-cream-500 dark:text-brand-beige-400">Unplaced</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
