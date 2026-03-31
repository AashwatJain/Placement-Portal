import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import PageLoader from "../../components/ui/PageLoader";
import { useAuth } from "../../context/AuthContext";

import { fetchAllStudents } from "../../services/adminApi";
import { API_BASE_URL } from "../../config/api";
import {
  fetchCandidateStatuses,
  fetchCandidateNotes,
} from "../../services/recruiterApi";
import {
  Search, X, FileText, ExternalLink, Code2, Award,
  ArrowUpDown, ArrowUp, ArrowDown, Loader2,
  Star, ChevronDown, ChevronUp, Download, Mail,
  Users, TrendingUp, GraduationCap, BarChart3,
  Github, SlidersHorizontal, MapPin, Phone,
  BookOpen, Calendar, Linkedin, Eye,
  Hash, AlertTriangle, UserCircle,
  StickyNote,
} from "lucide-react";



const PIPELINE_STAGES = [
  { value: "",            label: "— None —",        color: "bg-brand-beige-100 text-brand-brown-600 dark:bg-[#2A1810] dark:text-brand-beige-400" },
  { value: "screening",   label: "Screening",       color: "bg-brand-amber-500/20 text-brand-amber-600 dark:bg-blue-900/30 dark:text-brand-amber-500" },
  { value: "tech1",       label: "Tech Round 1",    color: "bg-brand-amber-500/20 text-brand-amber-600 dark:bg-brand-amber-800/30 dark:text-brand-amber-500" },
  { value: "tech2",       label: "Tech Round 2",    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  { value: "hr",          label: "HR Round",        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "selected",    label: "Selected",        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "rejected",    label: "Rejected",        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

const PLACEMENT_TAG = {
  unplaced:   { label: "Available",            color: "bg-brand-beige-100 text-brand-brown-600 border-brand-beige-200 dark:bg-[#2A1810] dark:text-brand-beige-400 dark:border-[#5A3D2B]" },
  dream:      { label: "Placed (Dream)",      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" },
  superDream: { label: "Placed (Super Dream)",color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
};

const formatName = (name) => {
  if (!name) return "Unknown";
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

function getPlacementTag(s) {
  if (s.placementStatus === "superDream") return PLACEMENT_TAG.superDream;
  if (s.placementStatus === "dream")      return PLACEMENT_TAG.dream;
  return PLACEMENT_TAG.unplaced;
}

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("jobId") || "";

  const [students, setStudents]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState(initialSearch);
  const [branch, setBranch]               = useState("All");
  const [year, setYear]                   = useState("All");
  const [gender, setGender]               = useState("All");
  const [minCgpa, setMinCgpa]             = useState("");
  const [min10th, setMin10th]             = useState("");
  const [min12th, setMin12th]             = useState("");
  const [maxBacklogs, setMaxBacklogs]     = useState("");
  const [sortConfig, setSortConfig]       = useState({ key: "cgpa", direction: "desc" });
  const [expandedId, setExpandedId]       = useState(null);
  const [showFilters, setShowFilters]     = useState(false);
  const [statuses, setStatuses]           = useState({});
  const [notes, setNotes]                 = useState({});
  const [previewUrl, setPreviewUrl]       = useState(null);

  useEffect(() => {
    const uid = user?.uid;
    (async () => {
      try {
        const [studentData, savedStatuses, savedNotes] = await Promise.all([
          fetchAllStudents(),
          uid ? fetchCandidateStatuses(uid).catch(() => ({})) : {},
          uid ? fetchCandidateNotes(uid).catch(() => ({}))    : {},
        ]);
        setStudents(studentData);
        setStatuses(savedStatuses);
        setNotes(savedNotes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc" }));
  };



  const allBranches = useMemo(() => [...new Set(students.map(s => s.branch ? s.branch.toUpperCase() : null).filter(Boolean))].sort(), [students]);
  const allYears    = useMemo(() => [...new Set(students.map(s => String(s.year)).filter(y => y && y !== "undefined"))].sort(), [students]);

  const filteredAndSorted = useMemo(() => {
    let list = [...students];
    if (search) { const q = search.toLowerCase(); list = list.filter(s => (s.fullName||"").toLowerCase().includes(q) || (s.branch||"").toLowerCase().includes(q) || (s.email||"").toLowerCase().includes(q)); }
    if (branch !== "All") list = list.filter(s => s.branch && s.branch.toUpperCase() === branch);
    if (year   !== "All") list = list.filter(s => String(s.year) === year);
    if (gender !== "All") list = list.filter(s => s.gender === gender);
    if (minCgpa)     list = list.filter(s => parseFloat(s.cgpa) >= parseFloat(minCgpa));
    if (min10th)     list = list.filter(s => parseFloat(s.marks10th) >= parseFloat(min10th));
    if (min12th)     list = list.filter(s => parseFloat(s.marks12th) >= parseFloat(min12th));
    if (maxBacklogs) list = list.filter(s => parseInt(s.activeBacklogs || "0") <= parseInt(maxBacklogs));

    if (sortConfig.key) {
      list.sort((a, b) => {
        let aV, bV;
        if (sortConfig.key === "name") { aV = (a.fullName||"").toLowerCase(); bV = (b.fullName||"").toLowerCase(); }
        else { aV = parseFloat(a[sortConfig.key]) || 0; bV = parseFloat(b[sortConfig.key]) || 0; }
        if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
        if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [students, search, branch, year, gender, minCgpa, min10th, min12th, maxBacklogs, sortConfig]);

  const total   = filteredAndSorted.length;
  const validCgpas = filteredAndSorted.map(s => parseFloat(s.cgpa)).filter(val => !isNaN(val));
  const avgCgpa = validCgpas.length > 0
    ? (validCgpas.reduce((s, x) => s + x, 0) / validCgpas.length).toFixed(2)
    : "—";
  const branchCounts = {}; filteredAndSorted.forEach(s => { if (s.branch) { const b = s.branch.toUpperCase(); branchCounts[b] = (branchCounts[b]||0)+1; } });
  const topBranch = Object.entries(branchCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";
  const valid10ths = filteredAndSorted.map(s => parseFloat(s.marks10th)).filter(v => !isNaN(v));
  const avg10th = valid10ths.length > 0 ? (valid10ths.reduce((s, x) => s + x, 0) / valid10ths.length).toFixed(1) + "%" : "—";

  const exportCSV = () => {
    const h = ["Name","Branch","Year","CGPA","10th%","12th%","Backlogs","Gender","Email","Phone","GitHub","LinkedIn","LeetCode","Codeforces","CodeChef"];
    const rows = filteredAndSorted.map(s => [
      formatName(s.fullName), s.branch ? s.branch.toUpperCase() : "", s.year||"", s.cgpa||"", s.marks10th||"", s.marks12th||"",
      s.activeBacklogs||"0", s.gender||"", s.email||"", s.phone||"", s.github||"", s.linkedin||"",
      s.leetcode||"", s.codeforces||"", s.codechef||""
    ]);
    const csv = [h.join(","), ...rows.map(r => r.map(v=>`"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `candidates_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const SortBtn = ({ label, columnKey }) => (
    <button onClick={() => handleSort(columnKey)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${sortConfig.key === columnKey ? "bg-brand-amber-500/20 text-brand-amber-600 dark:bg-brand-amber-800/40 dark:text-brand-amber-500 shadow-sm" : "text-brand-cream-500 hover:bg-brand-beige-100 dark:hover:bg-brand-brown-800 dark:text-brand-beige-400"}`}>
      {label}
      {sortConfig.key === columnKey ? (sortConfig.direction === "asc" ? <ArrowUp size={12}/> : <ArrowDown size={12}/>) : <ArrowUpDown size={12} className="opacity-40"/>}
    </button>
  );



  return (
    <div className="space-y-6 pb-10">
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <div className="relative w-[90vw] max-w-4xl h-[85vh] bg-white dark:bg-[#1A0F08] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-brand-beige-200 dark:border-[#5A3D2B] bg-brand-cream-50 dark:bg-[#2A1810]">
              <h3 className="text-sm font-bold text-brand-brown-700 dark:text-brand-beige-200">Resume Preview</h3>
              <div className="flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-brand-amber-500 hover:text-brand-amber-600 dark:text-brand-amber-500"><Download size={14}/> Download</a>
                <button onClick={() => setPreviewUrl(null)} className="rounded-lg p-1.5 text-brand-cream-500 hover:bg-brand-beige-200 dark:hover:bg-brand-brown-700 transition"><X size={18}/></button>
              </div>
            </div>
            <iframe src={previewUrl} className="w-full h-[calc(100%-52px)]" title="Resume Preview" />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white">Candidate Search</h1>
          {initialSearch ? (
            <p className="mt-1 text-sm font-medium text-brand-amber-500 dark:text-brand-amber-500 bg-brand-amber-500/10 dark:bg-brand-amber-800/30 px-3 py-1 rounded-lg inline-block border border-brand-amber-500/20 dark:border-brand-amber-700">
              Filtering applicants for job: <strong>{initialSearch}</strong>
            </p>
          ) : (
            <p className="mt-1 text-sm text-brand-cream-500 dark:text-brand-beige-400">Filter, shortlist, and export candidates for your hiring pipeline.</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-brand-beige-200 bg-white px-3.5 py-2 text-xs font-bold text-brand-brown-700 shadow-sm hover:bg-brand-cream-50 dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-brand-beige-300 dark:hover:bg-brand-brown-700 transition-all">
            <Download size={14}/> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Total Candidates", v: total,    ic: <Users size={18}/>, g: "from-brand-amber-500/100 to-violet-600" },
          { l: "Avg CGPA",         v: avgCgpa,  ic: <TrendingUp size={18}/>, g: "from-emerald-500 to-teal-600" },
          { l: "Top Branch",       v: topBranch, ic: <GraduationCap size={18}/>, g: "from-amber-500 to-orange-600" },
          { l: "Avg 10th %",       v: avg10th,   ic: <Award size={18}/>, g: "from-rose-500 to-pink-600" },
        ].map(stat => (
          <div key={stat.l} className="group relative overflow-hidden rounded-xl border border-brand-beige-200/80 bg-white p-4 shadow-sm hover:shadow-md dark:border-[#3E2315] dark:bg-[#1A0F08]/80 transition-all">
            <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${stat.g} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`}/>
            <div className="relative"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-400">{stat.l}</span><div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.g} text-white shadow-sm`}>{stat.ic}</div></div><p className="text-2xl font-black text-brand-brown-900 dark:text-white">{stat.v}</p></div>
          </div>
        ))}
      </div>

      {Object.keys(branchCounts).length > 1 && (
        <div className="rounded-xl border border-brand-beige-200 bg-white p-5 shadow-sm dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-brown-400 flex items-center gap-1.5"><BarChart3 size={14} className="text-brand-amber-500/100"/> Branch Distribution</h3>
          <div className="space-y-2.5">
            {Object.entries(branchCounts).sort((a,b)=>b[1]-a[1]).map(([br,count]) => { const max = Math.max(...Object.values(branchCounts)); return (
              <div key={br} className="flex items-center gap-3">
                <span className="w-12 text-xs font-bold text-brand-brown-700 dark:text-brand-beige-300">{br}</span>
                <div className="flex-1 h-2.5 rounded-full bg-brand-beige-100 dark:bg-brand-brown-700 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-brand-amber-500/100 to-violet-500 transition-all duration-700" style={{ width: `${(count/max)*100}%` }}/></div>
                <span className="text-[11px] font-bold text-brand-cream-500 w-16 text-right">{count} ({Math.round(count/total*100)}%)</span>
              </div>
            ); })}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-brand-beige-200 bg-white shadow-sm dark:border-[#5A3D2B] dark:bg-[#2A1810]/50 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-brand-beige-100 dark:border-[#5A3D2B]/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-400" size={16}/>
            <input type="text" placeholder="Search by name, branch, or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-brand-beige-200 bg-brand-cream-50 pl-9 pr-4 py-2.5 text-sm placeholder:text-brand-brown-400 focus:border-brand-amber-500 focus:outline-none focus:ring-2 focus:ring-brand-amber-500/20 dark:border-[#7A543A] dark:bg-[#1A0F08]/50 dark:text-white dark:focus:ring-brand-amber-800/40"/>
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown-400 hover:text-brand-brown-600"><X size={14}/></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-bold transition-all ${showFilters ? "bg-brand-amber-500/20 text-brand-amber-600 dark:bg-brand-amber-800/40 dark:text-brand-amber-500" : "border border-brand-beige-200 text-brand-brown-600 hover:bg-brand-cream-50 dark:border-[#7A543A] dark:text-brand-beige-400 dark:hover:bg-brand-brown-700"}`}>
            <SlidersHorizontal size={14}/> Filters {showFilters ? "▲" : "▼"}
          </button>
        </div>
        {showFilters && (
          <div className="p-4 bg-brand-cream-50/50 dark:bg-[#1A0F08]/30 space-y-4 animate-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <FilterSelect label="Branch" value={branch} onChange={setBranch} options={["All", ...allBranches]}/>
              <FilterSelect label="Year" value={year} onChange={setYear} options={["All", ...allYears]}/>
              <FilterSelect label="Gender" value={gender} onChange={setGender} options={["All","Male","Female","Non-Binary"]}/>
              <FilterInput label="Min CGPA" value={minCgpa} onChange={setMinCgpa} placeholder="e.g. 7.5"/>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <FilterInput label="Min 10th (%)" value={min10th} onChange={setMin10th} placeholder="e.g. 85"/>
              <FilterInput label="Min 12th (%)" value={min12th} onChange={setMin12th} placeholder="e.g. 80"/>
              <FilterInput label="Max Active Backlogs" value={maxBacklogs} onChange={setMaxBacklogs} placeholder="e.g. 0"/>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-brand-brown-400 font-medium mr-1">Sort:</span>
        <SortBtn label="Name" columnKey="name"/>
        <SortBtn label="CGPA" columnKey="cgpa"/>
        <div className="ml-auto text-xs font-medium text-brand-brown-400">{total} candidate{total !== 1 ? "s" : ""}</div>
      </div>

      {loading && <PageLoader message="Loading candidates..." />}

      {!loading && (
        <div className="space-y-2.5">
          {filteredAndSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-brand-beige-300 dark:border-[#5A3D2B] bg-brand-cream-50/50 dark:bg-[#1A0F08]/50">
              <Search size={40} className="mb-3 text-brand-beige-300 dark:text-brand-brown-600"/><p className="font-semibold text-lg text-brand-brown-600 dark:text-brand-beige-400">No candidates found</p><p className="text-sm mt-1 text-brand-brown-400">Try adjusting your filters.</p>
            </div>
          ) : filteredAndSorted.map(s => (
            <CandidateCard key={s.id} s={s}
              isExpanded={expandedId===s.id} setExpandedId={setExpandedId}
              status={statuses[s.id]||""}
              note={notes[s.id]||""}
              setPreviewUrl={setPreviewUrl}
            />
          ))}
        </div>
      )}


    </div>
  );
}

function CandidateCard({ s, isExpanded, setExpandedId, status, note, setPreviewUrl }) {
  const [liveStats, setLiveStats] = useState({ cf: null, lc: null, gh: null });

  useEffect(() => {
    if (isExpanded) {
      if (s.codeforces) {
        const handle = s.codeforces.replace(/^https?:\/\/(www\.)?[^/]+\/(u\/|profile\/|users\/)?/, "");
        fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
          .then(res => res.json())
          .then(data => { if (data.status === "OK") setLiveStats(p => ({ ...p, cf: `${data.result[0].rank || "Unrated"} (${data.result[0].rating || 0})` })); })
          .catch(() => {});
      }
      if (s.leetcode) {
        const handle = s.leetcode.replace(/^https?:\/\/(www\.)?[^/]+\/(u\/|profile\/|users\/)?/, "");
        fetch(`${API_BASE_URL}/api/student/coding-stats/${s.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.platforms) {
              const lc = data.platforms.find(p => p.id === "leetcode");
              if (lc && typeof lc.solved === "number") setLiveStats(p => ({ ...p, lc: `${lc.solved} Solved` }));
              const gh = data.platforms.find(p => p.id === "github");
              if (gh && typeof gh.repos === "number") setLiveStats(p => ({ ...p, gh: `${gh.repos} Repos` }));
            }
          })
          .catch(() => {});
      }
    }
  }, [isExpanded, s.codeforces, s.leetcode, s.github]);

  const displayName = formatName(s.fullName || s.email?.split("@")[0]);
  const initial     = displayName.charAt(0).toUpperCase();
  const cgpaNum     = parseFloat(s.cgpa);
  const tag         = getPlacementTag(s);
  const stageObj    = PIPELINE_STAGES.find(p => p.value === status) || PIPELINE_STAGES[0];
  const hasCoding   = s.leetcode || s.codeforces || s.codechef || s.codolio;

  const cgpaColor = cgpaNum >= 8.5
    ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800"
    : cgpaNum >= 7
      ? "text-brand-amber-600 bg-brand-amber-500/10 border-brand-amber-500/30 dark:text-brand-amber-500 dark:bg-brand-amber-800/20 dark:border-brand-amber-700"
      : "text-brand-brown-600 bg-brand-cream-50 border-brand-beige-200 dark:text-brand-beige-400 dark:bg-[#2A1810] dark:border-[#5A3D2B]";

  return (
    <div className={`rounded-xl border bg-white shadow-sm dark:bg-[#2A1810]/80 transition-all overflow-hidden ${status === "selected" ? "border-emerald-300 dark:border-emerald-700" : "border-brand-beige-200 dark:border-[#5A3D2B]"}`}>
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-brand-cream-50/50 dark:hover:bg-brand-brown-800/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : s.id)}>

        <div className="relative shrink-0">
          {s.avatarUrl
            ? <img src={s.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover shadow ring-2 ring-white dark:ring-brand-brown-800"/>
            : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-sm font-bold text-white shadow ring-2 ring-white dark:ring-brand-brown-800">{initial}</div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-brand-brown-900 dark:text-white truncate">{displayName}</h3>
            <span className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${tag.color}`}>{tag.label}</span>
            {status && <span className={`hidden md:inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${stageObj.color}`}>{stageObj.label}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-brand-cream-500 dark:text-brand-beige-400">
            {s.branch && <span>{s.branch.toUpperCase()}</span>}
            {s.year && <><span className="text-brand-beige-300 dark:text-brand-brown-600">·</span><span>{s.year}</span></>}
            {s.gender && <><span className="text-brand-beige-300 dark:text-brand-brown-600">·</span><span>{s.gender}</span></>}
            {s.email && <><span className="text-brand-beige-300 dark:text-brand-brown-600 hidden lg:inline">·</span><span className="hidden lg:inline truncate max-w-[200px]">{s.email}</span></>}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          {(!s.cgpa || isNaN(cgpaNum)) ? (
             <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border border-brand-beige-200 bg-brand-cream-50 text-brand-cream-500 dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-brand-beige-400">CGPA: N/A</span>
          ) : (
             <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${cgpaColor}`}>{cgpaNum.toFixed(1)}</span>
          )}
          {s.marks10th && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-brand-cream-50 text-brand-brown-600 border border-brand-beige-200 dark:bg-[#2A1810] dark:text-brand-beige-400 dark:border-[#5A3D2B]">10th: {s.marks10th}%</span>}
          {s.marks12th && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-brand-cream-50 text-brand-brown-600 border border-brand-beige-200 dark:bg-[#2A1810] dark:text-brand-beige-400 dark:border-[#5A3D2B]">12th: {s.marks12th}%</span>}
        </div>

        <button onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : s.id); }} className="shrink-0 rounded-lg p-1.5 text-brand-brown-400 hover:bg-brand-beige-100 dark:hover:bg-brand-brown-700 transition-all">
          {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-brand-beige-100 dark:border-[#5A3D2B] animate-in slide-in-from-top-1 duration-200">
          <div className="relative isolate overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-brand-amber-500 via-violet-600 to-purple-600" />
            <div className="px-6 pb-4 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative z-10">
              <div className="shrink-0">
                {s.avatarUrl
                  ? <img src={s.avatarUrl} alt="" className="h-20 w-20 rounded-xl object-cover shadow-lg ring-4 ring-white dark:ring-brand-brown-800 bg-white" />
                  : <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-3xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-brand-brown-800">{initial}</div>
                }
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-xl font-bold text-brand-brown-900 dark:text-white truncate">{displayName}</h2>
                <p className="text-sm text-brand-cream-500">{[s.branch ? s.branch.toUpperCase() : null, s.year && `Batch ${s.year}`, s.gender].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex items-center gap-2 pb-1 flex-wrap">
                {s.primaryResumeUrl && <>
                  <button onClick={() => setPreviewUrl(s.primaryResumeUrl)} className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#2A1810] border border-brand-beige-200 dark:border-[#7A543A] px-3.5 py-2 text-xs font-bold text-brand-brown-700 dark:text-brand-beige-300 hover:bg-brand-cream-50 dark:hover:bg-brand-brown-700 transition-all shadow-sm"><Eye size={14}/> Preview Resume</button>
                  <a href={s.primaryResumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-amber-600 shadow-sm transition-all"><FileText size={14}/> Download</a>
                </>}
                {s.email && <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-beige-200 dark:border-[#7A543A] bg-white dark:bg-[#2A1810] px-3.5 py-2 text-xs font-bold text-brand-brown-700 dark:text-brand-beige-300 hover:bg-brand-cream-50 dark:hover:bg-brand-brown-700 shadow-sm transition-all"><Mail size={14}/> Email</a>}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Section title="Academics" icon={<GraduationCap size={12}/>}>
                <div className="grid grid-cols-2 gap-3">
                  {s.cgpa && !isNaN(cgpaNum) && <div className={`rounded-lg border p-3 text-center ${cgpaColor}`}><p className="text-[10px] font-bold uppercase tracking-widest opacity-70">CGPA</p><p className="text-xl font-black mt-0.5">{cgpaNum.toFixed(2)}</p></div>}
                  {s.marks10th && <div className="rounded-lg border border-brand-beige-200 dark:border-[#5A3D2B] bg-brand-cream-50 dark:bg-[#1A0F08]/50 p-3 text-center"><p className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-400">10th</p><p className="text-xl font-black text-brand-brown-800 dark:text-brand-beige-200 mt-0.5">{s.marks10th}%</p></div>}
                  {s.marks12th && <div className="rounded-lg border border-brand-beige-200 dark:border-[#5A3D2B] bg-brand-cream-50 dark:bg-[#1A0F08]/50 p-3 text-center"><p className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-400">12th</p><p className="text-xl font-black text-brand-brown-800 dark:text-brand-beige-200 mt-0.5">{s.marks12th}%</p></div>}
                  <div className="rounded-lg border border-brand-beige-200 dark:border-[#5A3D2B] bg-brand-cream-50 dark:bg-[#1A0F08]/50 p-3 text-center"><p className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-400">Backlogs</p><p className="text-xl font-black text-brand-brown-800 dark:text-brand-beige-200 mt-0.5">{s.activeBacklogs || "0"}</p></div>
                </div>
              </Section>

              <Section title="Contact & Info" icon={<Mail size={12}/>}>
                <div className="space-y-2.5">
                  {s.email && <InfoRow icon={<Mail size={14} className="text-brand-amber-500/100"/>} label="Email" value={s.email} href={`mailto:${s.email}`}/>}
                  {s.phone && <InfoRow icon={<Phone size={14} className="text-green-500"/>} label="Phone" value={s.phone}/>}
                  {s.location && <InfoRow icon={<MapPin size={14} className="text-rose-500"/>} label="Location" value={s.location}/>}
                  {s.gender && <InfoRow icon={<UserCircle size={14} className="text-purple-500"/>} label="Gender" value={s.gender}/>}
                  {s.branch && <InfoRow icon={<GraduationCap size={14} className="text-brand-amber-500/100"/>} label="Branch" value={s.branch.toUpperCase()}/>}
                  {s.year && <InfoRow icon={<Calendar size={14} className="text-violet-500"/>} label="Graduation" value={`Batch ${s.year}`}/>}
                </div>
              </Section>

              {s.about && <Section title="About" icon={<BookOpen size={12}/>}><p className="text-sm text-brand-brown-700 dark:text-brand-beige-300 leading-relaxed">{s.about}</p></Section>}
            </div>

            <div className="space-y-4">
              <div className={`rounded-xl border p-4 flex items-center justify-between ${tag.color}`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Placement Status</p>
                  <p className="text-lg font-black mt-0.5">{tag.label}</p>
                </div>
                <Star size={28} className="opacity-20"/>
              </div>

              <Section title="Coding Profiles" icon={<Code2 size={12} className="text-brand-amber-500/100"/>}>
                {hasCoding ? (
                  <div className="space-y-2">
                    {s.leetcode   && <CodingCard platform="LeetCode"   handle={s.leetcode}   url={s.leetcode.startsWith("http") ? s.leetcode : `https://leetcode.com/u/${s.leetcode}`}     g="from-amber-500 to-orange-500" bg="bg-amber-50 dark:bg-amber-900/10" bc="border-amber-200 dark:border-amber-800/50" liveStat={liveStats.lc}/>}
                    {s.codeforces && <CodingCard platform="Codeforces"  handle={s.codeforces} url={s.codeforces.startsWith("http") ? s.codeforces : `https://codeforces.com/profile/${s.codeforces}`} g="from-brand-amber-500/100 to-cyan-500" bg="bg-brand-amber-500/10 dark:bg-blue-900/10" bc="border-brand-amber-500/30 dark:border-brand-amber-700/50" liveStat={liveStats.cf}/>}
                    {s.codechef   && <CodingCard platform="CodeChef"   handle={s.codechef}   url={s.codechef.startsWith("http") ? s.codechef : `https://www.codechef.com/users/${s.codechef}`} g="from-red-500 to-rose-500" bg="bg-red-50 dark:bg-red-900/10" bc="border-red-200 dark:border-red-800/50"/>}
                    {s.codolio    && <CodingCard platform="Codolio"    handle={s.codolio}    url={s.codolio.startsWith("http") ? s.codolio : `https://codolio.com/profile/${s.codolio}`} g="from-violet-500 to-purple-500" bg="bg-violet-50 dark:bg-violet-900/10" bc="border-violet-200 dark:border-violet-800/50"/>}
                  </div>
                ) : <EmptyState icon={<Code2 size={22}/>} text="No coding profiles linked"/>}
              </Section>

              <Section title="Links & Profiles" icon={<ExternalLink size={12}/>}>
                {(s.github || s.linkedin) ? (
                  <div className="space-y-2">
                    {s.github && <SocialLink icon={<Github size={15}/>} label="GitHub" handle={s.github.replace(/^https?:\/\/(www\.)?github\.com\/?/,"")} url={s.github.startsWith("http")?s.github:`https://github.com/${s.github}`} liveStat={liveStats.gh}/>}
                    {s.linkedin && <SocialLink icon={<Linkedin size={15}/>} label="LinkedIn" handle={s.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/,"").replace(/\/$/,"")||"Profile"} url={s.linkedin.startsWith("http")?s.linkedin:`https://linkedin.com/in/${s.linkedin}`}/>}
                  </div>
                ) : <EmptyState icon={<ExternalLink size={22}/>} text="No links available"/>}
              </Section>

              {note && <Section title="Notes" icon={<StickyNote size={12} className="text-amber-500"/>}>
                <p className="text-sm text-brand-brown-700 dark:text-brand-beige-300 leading-relaxed">{note}</p>
              </Section>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-brand-beige-200 dark:border-[#5A3D2B] bg-white dark:bg-[#1A0F08]/50 p-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-400 mb-3 flex items-center gap-1.5">{icon} {title}</h4>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, href, bold }) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-beige-100 dark:bg-[#2A1810]">{icon}</div>
      <div className="flex-1 min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-brand-brown-400">{label}</p><p className={`text-sm truncate ${bold?"font-bold text-brand-brown-900 dark:text-white":"text-brand-brown-700 dark:text-brand-beige-300"}`}>{value}</p></div>
    </div>
  );
  return href ? <a href={href} className="block rounded-lg p-0.5 -m-0.5 hover:bg-brand-cream-50 dark:hover:bg-brand-brown-800/50 transition-colors">{inner}</a> : inner;
}

function CodingCard({ platform, handle, url, g, bg, bc, liveStat }) {
  const h = handle?.replace(/^https?:\/\/(www\.)?[^/]+\/(u\/|profile\/|users\/)?/,"") || handle;
  return <a href={url} target="_blank" rel="noopener noreferrer" className={`group flex flex-col gap-2 rounded-lg border ${bc} ${bg} p-3 hover:shadow-sm transition-all`}><div className="flex items-center gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${g} text-white shadow-sm`}><Code2 size={14}/></div><div className="flex-1 min-w-0"><p className="text-xs font-bold text-brand-brown-800 dark:text-brand-beige-200">{platform}</p><p className="text-[11px] text-brand-cream-500 dark:text-brand-beige-400 truncate">{h}</p></div><ExternalLink size={12} className="text-brand-brown-400 group-hover:text-brand-brown-600 dark:group-hover:text-brand-beige-300 shrink-0 transition-colors"/></div>{liveStat && <div className="mt-1 flex items-center gap-1.5"><span className="inline-flex items-center rounded bg-white/60 dark:bg-black/20 px-2 py-0.5 text-[10px] font-bold text-brand-brown-700 dark:text-brand-beige-300 border border-brand-beige-200/50 dark:border-[#5A3D2B]/50 shadow-sm capitalize">{liveStat}</span></div>}</a>;
}

function SocialLink({ icon, label, handle, url, liveStat }) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2 rounded-lg border border-brand-beige-200 dark:border-[#5A3D2B] bg-white dark:bg-[#2A1810] p-3 hover:shadow-sm transition-all"><div className="flex items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-beige-100 dark:bg-brand-brown-700 text-brand-brown-600 dark:text-brand-beige-300">{icon}</div><div className="flex-1 min-w-0"><p className="text-xs font-bold text-brand-brown-800 dark:text-brand-beige-200">{label}</p><p className="text-[11px] text-brand-cream-500 dark:text-brand-beige-400 truncate">{handle}</p></div><ExternalLink size={12} className="text-brand-brown-400 group-hover:text-brand-brown-600 dark:group-hover:text-brand-beige-300 shrink-0 transition-colors"/></div>{liveStat && <div className="mt-1 flex items-center gap-1.5"><span className="inline-flex items-center rounded bg-brand-cream-50 dark:bg-[#1A0F08] px-2 py-0.5 text-[10px] font-bold text-brand-brown-700 dark:text-brand-beige-300 border border-brand-beige-200 dark:border-[#5A3D2B] shadow-sm capitalize">{liveStat}</span></div>}</a>;
}

function EmptyState({ icon, text }) {
  return <div className="flex flex-col items-center justify-center py-5 text-brand-brown-400"><div className="mb-1.5 opacity-30">{icon}</div><p className="text-xs">{text}</p></div>;
}

function FilterSelect({ label, value, onChange, options }) {
  return <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-brand-brown-400">{label}</label><select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-lg border border-brand-beige-200 bg-white px-3 py-2 text-sm text-brand-brown-700 focus:border-brand-amber-500 focus:outline-none dark:border-[#7A543A] dark:bg-[#2A1810] dark:text-brand-beige-300">{options.map(o=><option key={o} value={o}>{o === "All" ? `All ${label}s` : o}</option>)}</select></div>;
}

function FilterInput({ label, value, onChange, placeholder }) {
  return <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-brand-brown-400">{label}</label><input type="number" step="any" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-brand-beige-200 bg-white px-3 py-2 text-sm text-brand-brown-700 focus:border-brand-amber-500 focus:outline-none dark:border-[#7A543A] dark:bg-[#2A1810] dark:text-brand-beige-300"/></div>;
}