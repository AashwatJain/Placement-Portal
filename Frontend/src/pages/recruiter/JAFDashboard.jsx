import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchJafs } from "../../services/adminApi";
import { 
  Plus, Search, Briefcase, Clock, CheckCircle2, 
  XCircle, FileText, ChevronRight, Users, Eye, Loader2
} from "lucide-react";

const STATUS_CONFIG = {
  All:      { color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: <Briefcase size={14}/> },
  Active:   { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle2 size={14}/> },
  Pending:  { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Clock size={14}/> },
  Draft:    { color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: <FileText size={14}/> },
  Closed:   { color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", icon: <XCircle size={14}/> }
};

export default function JAFDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [jafs, setJafs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJafs() {
      try {
        const data = await fetchJafs(user?.companyName);
        // Map backend schema to what the frontend expects for the dashboard UI
        const mapped = data.map(j => ({
          ...j,
          title: j.roles || "Untitled Role",
          type: j.offerType || "-",
          status: j.status || "Draft",
          applicants: j.applicantsCount || 0,
          shortlisted: j.shortlistedCount || 0,
          deadline: j.lastDate || "TBA",
        }));
        setJafs(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJafs();
  }, [user]);

  const filteredJafs = jafs.filter(jaf => {
    const matchesTab = activeTab === "All" || jaf.status === activeTab;
    const matchesSearch = jaf.title.toLowerCase().includes(search.toLowerCase()) || jaf.id.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* ── HEADER & CTA ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Postings (JAFs)</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and manage your Job Announcement Forms.</p>
        </div>
        <Link to="/recruiter/jafs/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]">
          <Plus size={18} /> Create New JAF
        </Link>
      </div>

      {/* ── TABS & SEARCH ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["All", "Active", "Pending", "Draft", "Closed"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab 
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
              }`}
            >
              <div className={activeTab === tab ? STATUS_CONFIG[tab].color.split(' ')[1] : ""}>{STATUS_CONFIG[tab].icon}</div>
              {tab}
              <span className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === tab ? STATUS_CONFIG[tab].color : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {tab === "All" ? jafs.length : jafs.filter(j => j.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative shrink-0 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input 
            type="text" 
            placeholder="Search postings..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-900/40 transition-all"
          />
        </div>
      </div>

      {/* ── JOB CARDS GRID ── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredJafs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50">
            <Briefcase size={40} className="mb-3 text-slate-300 dark:text-slate-600"/>
            <p className="font-semibold text-lg text-slate-600 dark:text-slate-400">No postings found</p>
            <p className="text-sm mt-1 text-slate-400">Try adjusting your search or filters.</p>
            {activeTab !== "All" && <button onClick={() => setActiveTab("All")} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View All Postings</button>}
          </div>
        ) : (
          filteredJafs.map(jaf => (
            <Link key={jaf.id} to={`/recruiter/jafs/${jaf.id}`} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-800 transition-all">
              
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                      {(jaf.name || user?.companyName || "C")[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{jaf.name || user?.companyName || "Company"}</span>
                    <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${STATUS_CONFIG[jaf.status].color.replace('bg-','bg-white dark:bg-slate-800 border-').replace('text-','text-')}`}>
                      {STATUS_CONFIG[jaf.status].icon} {jaf.status}
                    </span>
                  </div>
                  <h3 className="truncate font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{jaf.title}</h3>
                  <div className="mt-1 flex items-center justify-between pr-2">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Briefcase size={12}/> {jaf.type}
                    </p>
                    <span className="text-[9px] font-medium text-slate-400 opacity-60 uppercase tracking-widest">ID: {jaf.id.slice(-6)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1"><Users size={12}/> Applied</span>
                  <span className="text-lg font-black text-slate-700 dark:text-slate-200">{jaf.applicants.toLocaleString()}</span>
                </div>
                {jaf.status === "Active" || jaf.status === "Closed" ? (
                  <div className="flex flex-col border-l border-slate-100 pl-3 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1"><CheckCircle2 size={12}/> Shortlisted</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{jaf.shortlisted.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex flex-col border-l border-slate-100 pl-3 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1"><Clock size={12}/> Deadline</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{jaf.deadline}</span>
                  </div>
                )}
              </div>

              {/* Hover Overlay Link Icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 hidden sm:block">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                  <ChevronRight size={18} />
                </div>
              </div>

            </Link>
          ))
        )}
      </div>

    </div>
  );
}
