import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import {
  Briefcase, FileText, CheckCircle, Clock,
  AlertCircle, ChevronRight, TrendingUp,
} from "lucide-react";
import { useCompanies } from "../../hooks/useCompanies";

export default function StudentHome() {
  const { user } = useAuth();
  const { companies } = useCompanies();
  const [applications, setApplications] = useState([]);

  // Live listener
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onValue(ref(db, `users/${user.uid}/applications`), (snap) => {
      if (snap.exists()) {
        setApplications(Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })));
      } else {
        setApplications([]);
      }
    });
    return () => unsub();
  }, [user?.uid]);

  const totalApplied = applications.length;
  const shortlisted  = applications.filter((a) => a.status === "Shortlisted" || a.status === "Offered").length;
  const pending      = applications.filter((a) => !["Offered", "Rejected", "Final Decision"].includes(a.status)).length;
  const recommendations = companies.slice(0, 3);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Shortlisted": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "Applied":     return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "Rejected":    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "Offered":     return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      default:            return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 transition-colors duration-200 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
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

            {/* Recommendations */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-slate-500 dark:text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recommended Drives</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendations.map((c) => (
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
                        <p>Matches Score: <span className="font-medium text-green-600 dark:text-green-400">{c.score}%</span></p>
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
          <div className="space-y-6">
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
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Recent Notices</h3>
              <div className="space-y-4">
                <div className="relative border-l-2 border-blue-500 pl-4">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Google Pre-placement Talk</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Tomorrow, 10:00 AM @ Auditorium</p>
                </div>
                <div className="relative border-l-2 border-slate-300 pl-4 dark:border-slate-600">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Resume Freeze</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Final deadline: Friday 5 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}