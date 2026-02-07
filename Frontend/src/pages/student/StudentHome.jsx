import { Link } from "react-router-dom";
import { 
  Briefcase, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  // Bell // Removed
} from "lucide-react";
import { MOCK_APPLICATIONS, MOCK_COMPANIES } from "../../data/mockData";

export default function StudentHome() {
  const totalApplied = MOCK_APPLICATIONS.length;
  const shortlisted = MOCK_APPLICATIONS.filter(app => app.status === "Shortlisted").length;
  const recommendations = MOCK_COMPANIES.slice(0, 3);

  // Helper for Status Badge Styling (Light + Dark Mode support)
  const getStatusStyle = (status) => {
    switch (status) {
      case "Shortlisted": 
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "Applied": 
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "Rejected": 
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: 
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    }
  };

  return (
    // Main Container with transition for smooth toggle
    <div className="min-h-screen bg-slate-50/50 p-6 transition-colors duration-200 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back! Track your applications and upcoming drives.</p>
          </div>
          <div className="flex gap-3">
             {/* Notices Button Removed */}
            <Link to="/student/profile" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition">
              Update Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Applied</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalApplied}</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Briefcase size={20} />
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Shortlisted</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{shortlisted}</p>
            </div>
            <div className="rounded-full bg-green-50 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle size={20} />
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Actions</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
            <div className="rounded-full bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Clock size={20} />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ATS Section */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 dark:text-slate-100">
                  <FileText size={18} className="text-slate-400 dark:text-slate-500"/> Application Status
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
                    {MOCK_APPLICATIONS.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{app.company}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{app.role || "SDE Intern"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusStyle(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{app.date}</td>
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
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {c.type || "FTE"}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p>Matches Score: <span className="font-medium text-green-600 dark:text-green-400">{c.score}%</span></p>
                        <p>CGPA Criteria: <span className="font-medium text-slate-700 dark:text-slate-300">{c.cgpaCutoff}+</span></p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700 dark:border-slate-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                      View Details <ChevronRight size={16} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            
            {/* Action Items Widget */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/10">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-900 dark:text-amber-400">
                <AlertCircle size={16} /> Action Items
              </h3>
              <ul className="space-y-2">
                <li className="rounded-lg border border-amber-100 bg-white/80 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-slate-800 dark:text-amber-200">
                  <span className="mr-2 font-bold text-amber-500">•</span>
                  Add <strong>Codolio/LeetCode</strong> links to profile.
                </li>
                <li className="rounded-lg border border-amber-100 bg-white/80 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-slate-800 dark:text-amber-200">
                  <span className="mr-2 font-bold text-amber-500">•</span>
                  Resume missing: <strong>Project Deployment</strong> links.
                </li>
              </ul>
              <button className="mt-3 w-full rounded-lg bg-amber-100 py-2 text-xs font-bold uppercase text-amber-800 hover:bg-amber-200 transition dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60">
                Fix Resume
              </button>
            </div>

            {/* Quick Notices */}
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