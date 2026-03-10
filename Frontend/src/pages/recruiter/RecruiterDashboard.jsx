import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAllStudents } from "../../services/adminApi";
import {
  Search, X, FileText, ExternalLink, Code2, Award,
  ArrowUpDown, ArrowUp, ArrowDown, Loader2,
  Star, ChevronDown, ChevronUp, Download, Mail,
  Users, TrendingUp, GraduationCap, BarChart3,
  Github, SlidersHorizontal, MapPin, Phone,
  BookOpen, Calendar, Linkedin, Eye,
  Hash, AlertTriangle, UserCircle,
  CheckSquare, Square, StickyNote,
} from "lucide-react";

/* ═══════════ LocalStorage helpers ═══════════ */
const LS_STATUS_KEY = "recruiter-candidate-status";
const LS_NOTES_KEY  = "recruiter-candidate-notes";

function getStoredStatuses() { try { return JSON.parse(localStorage.getItem(LS_STATUS_KEY)) || {}; } catch { return {}; } }
function setStoredStatuses(m) { localStorage.setItem(LS_STATUS_KEY, JSON.stringify(m)); }
function getStoredNotes()    { try { return JSON.parse(localStorage.getItem(LS_NOTES_KEY))   || {}; } catch { return {}; } }
function setStoredNotes(m)   { localStorage.setItem(LS_NOTES_KEY, JSON.stringify(m)); }

const PIPELINE_STAGES = [
  { value: "",            label: "— None —",        color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  { value: "screening",   label: "Screening",       color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "tech1",       label: "Tech Round 1",    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { value: "tech2",       label: "Tech Round 2",    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  { value: "hr",          label: "HR Round",        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "selected",    label: "Selected",        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "rejected",    label: "Rejected",        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

const PLACEMENT_TAG = {
  unplaced:   { label: "Unplaced",            color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" },
  dream:      { label: "Placed (Dream)",      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" },
  superDream: { label: "Placed (Super Dream)",color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
};

function getPlacementTag(s) {
  if (s.placementStatus === "superDream") return PLACEMENT_TAG.superDream;
  if (s.placementStatus === "dream")      return PLACEMENT_TAG.dream;
  return PLACEMENT_TAG.unplaced;
}

/* ═══════════ Main Component ═══════════ */
export default function RecruiterDashboard() {
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
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [statuses, setStatuses]           = useState(getStoredStatuses);
  const [notes, setNotes]                 = useState(getStoredNotes);
  const [previewUrl, setPreviewUrl]       = useState(null);

  useEffect(() => { (async () => { try { setStudents(await fetchAllStudents()); } catch(e) { console.error(e); } finally { setLoading(false); } })(); }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc" }));
  };

  const updateStatus = useCallback((id, value) => {
    setStatuses(prev => { const n = { ...prev, [id]: value }; setStoredStatuses(n); return n; });
  }, []);

  const updateNote = useCallback((id, text) => {
    setNotes(prev => { const n = { ...prev, [id]: text }; setStoredNotes(n); return n; });
  }, []);

  const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = (ids) => setSelectedIds(new Set(ids));
  const clearSelection = () => setSelectedIds(new Set());

  const allBranches = useMemo(() => [...new Set(students.map(s => s.branch).filter(Boolean))].sort(), [students]);
  const allYears    = useMemo(() => [...new Set(students.map(s => String(s.year)).filter(y => y && y !== "undefined"))].sort(), [students]);

  const filteredAndSorted = useMemo(() => {
    let list = [...students];
    if (search) { const q = search.toLowerCase(); list = list.filter(s => (s.fullName||"").toLowerCase().includes(q) || (s.branch||"").toLowerCase().includes(q) || (s.email||"").toLowerCase().includes(q)); }
    if (branch !== "All") list = list.filter(s => s.branch === branch);
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
  const branchCounts = {}; filteredAndSorted.forEach(s => { if (s.branch) branchCounts[s.branch] = (branchCounts[s.branch]||0)+1; });
  const topBranch = Object.entries(branchCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";
  const eligible  = filteredAndSorted.filter(s => parseFloat(s.cgpa) >= 7).length;

  const exportCSV = () => {
    const h = ["Name","Branch","Year","CGPA","10th%","12th%","Backlogs","Gender","Email","Phone","GitHub","LinkedIn","LeetCode","Codeforces","CodeChef","Status","Note"];
    const rows = filteredAndSorted.map(s => [
      s.fullName||"", s.branch||"", s.year||"", s.cgpa||"", s.marks10th||"", s.marks12th||"",
      s.activeBacklogs||"0", s.gender||"", s.email||"", s.phone||"", s.github||"", s.linkedin||"",
      s.leetcode||"", s.codeforces||"", s.codechef||"",
      PIPELINE_STAGES.find(p=>p.value===(statuses[s.id]||""))?.label || "", notes[s.id]||""
    ]);
    const csv = [h.join(","), ...rows.map(r => r.map(v=>`"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `candidates_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const SortBtn = ({ label, columnKey }) => (
    <button onClick={() => handleSort(columnKey)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${sortConfig.key === columnKey ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"}`}>
      {label}
      {sortConfig.key === columnKey ? (sortConfig.direction === "asc" ? <ArrowUp size={12}/> : <ArrowDown size={12}/>) : <ArrowUpDown size={12} className="opacity-40"/>}
    </button>
  );

  const allIds = filteredAndSorted.map(s => s.id);
  const allSelected = selectedIds.size > 0 && allIds.every(id => selectedIds.has(id));

  return (
    <div className="space-y-6 pb-10">
      {/* Resume Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <div className="relative w-[90vw] max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Resume Preview</h3>
              <div className="flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"><Download size={14}/> Download</a>
                <button onClick={() => setPreviewUrl(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"><X size={18}/></button>
              </div>
            </div>
            <iframe src={previewUrl} className="w-full h-[calc(100%-52px)]" title="Resume Preview" />
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Candidate Search</h1>
          {initialSearch ? (
            <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg inline-block border border-indigo-100 dark:border-indigo-800">
              Filtering applicants for job: <strong>{initialSearch}</strong>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Filter, shortlist, and export candidates for your hiring pipeline.</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1.5 rounded-lg">{selectedIds.size} selected</span>
          )}
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all">
            <Download size={14}/> Export CSV
          </button>
          {selectedIds.size > 0 && (
            <button onClick={() => { const emails = filteredAndSorted.filter(s => selectedIds.has(s.id) && s.email).map(s => s.email).join(","); if(emails) window.location.href = `mailto:${emails}`; }} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all">
              <Mail size={14}/> Email {selectedIds.size} Selected
            </button>
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Total Candidates", v: total,    ic: <Users size={18}/>, g: "from-indigo-500 to-violet-600" },
          { l: "Avg CGPA",         v: avgCgpa,  ic: <TrendingUp size={18}/>, g: "from-emerald-500 to-teal-600" },
          { l: "Top Branch",       v: topBranch, ic: <GraduationCap size={18}/>, g: "from-amber-500 to-orange-600" },
          { l: "Eligible (≥7.0)",  v: eligible,  ic: <Award size={18}/>, g: "from-rose-500 to-pink-600" },
        ].map(stat => (
          <div key={stat.l} className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 transition-all">
            <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${stat.g} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`}/>
            <div className="relative"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.l}</span><div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.g} text-white shadow-sm`}>{stat.ic}</div></div><p className="text-2xl font-black text-slate-900 dark:text-white">{stat.v}</p></div>
          </div>
        ))}
      </div>

      {/* ── BRANCH CHART ── */}
      {Object.keys(branchCounts).length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><BarChart3 size={14} className="text-indigo-500"/> Branch Distribution</h3>
          <div className="space-y-2.5">
            {Object.entries(branchCounts).sort((a,b)=>b[1]-a[1]).map(([br,count]) => { const max = Math.max(...Object.values(branchCounts)); return (
              <div key={br} className="flex items-center gap-3">
                <span className="w-12 text-xs font-bold text-slate-700 dark:text-slate-300">{br}</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${(count/max)*100}%` }}/></div>
                <span className="text-[11px] font-bold text-slate-500 w-16 text-right">{count} ({Math.round(count/total*100)}%)</span>
              </div>
            ); })}
          </div>
        </div>
      )}

      {/* ── SEARCH + FILTERS ── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input type="text" placeholder="Search by name, branch, or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white dark:focus:ring-indigo-900/40"/>
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14}/></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-bold transition-all ${showFilters ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
            <SlidersHorizontal size={14}/> Filters {showFilters ? "▲" : "▼"}
          </button>
        </div>
        {showFilters && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 animate-in slide-in-from-top-1 duration-200">
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

      {/* ── SORT BAR + SELECT ALL ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => allSelected ? clearSelection() : selectAll(allIds)} className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all" title={allSelected ? "Deselect all" : "Select all"}>
          {allSelected ? <CheckSquare size={18} className="text-indigo-600 dark:text-indigo-400"/> : <Square size={18}/>}
        </button>
        <span className="text-[11px] text-slate-400 font-medium mr-1">Sort:</span>
        <SortBtn label="Name" columnKey="name"/>
        <SortBtn label="CGPA" columnKey="cgpa"/>
        <div className="ml-auto text-xs font-medium text-slate-400">{total} candidate{total !== 1 ? "s" : ""}</div>
      </div>

      {/* ── LOADING ── */}
      {loading && <div className="flex flex-col items-center justify-center py-16 gap-3"><Loader2 className="h-8 w-8 animate-spin text-indigo-500"/><p className="text-sm text-slate-400 animate-pulse">Loading candidates...</p></div>}

      {/* ── CARDS ── */}
      {!loading && (
        <div className="space-y-2.5">
          {filteredAndSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <Search size={40} className="mb-3 text-slate-300 dark:text-slate-600"/><p className="font-semibold text-lg text-slate-600 dark:text-slate-400">No candidates found</p><p className="text-sm mt-1 text-slate-400">Try adjusting your filters.</p>
            </div>
          ) : filteredAndSorted.map(s => (
            <CandidateCard key={s.id} s={s}
              isExpanded={expandedId===s.id} setExpandedId={setExpandedId}
              isSelected={selectedIds.has(s.id)} toggleSelect={toggleSelect}
              status={statuses[s.id]||""} updateStatus={updateStatus}
              note={notes[s.id]||""} updateNote={updateNote}
              setPreviewUrl={setPreviewUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ CandidateCard ═══════════ */
function CandidateCard({ s, isExpanded, setExpandedId, isSelected, toggleSelect, status, updateStatus, note, updateNote, setPreviewUrl }) {
  const [liveStats, setLiveStats] = useState({ cf: null, lc: null, gh: null });

  useEffect(() => {
    if (isExpanded) {
      // Codeforces
      if (s.codeforces) {
        const handle = s.codeforces.replace(/^https?:\/\/(www\.)?[^/]+\/(u\/|profile\/|users\/)?/, "");
        fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
          .then(res => res.json())
          .then(data => { if (data.status === "OK") setLiveStats(p => ({ ...p, cf: `${data.result[0].rank || "Unrated"} (${data.result[0].rating || 0})` })); })
          .catch(() => {});
      }
      // LeetCode
      if (s.leetcode) {
        const handle = s.leetcode.replace(/^https?:\/\/(www\.)?[^/]+\/(u\/|profile\/|users\/)?/, "");
        fetch(`https://leetcode-stats-api.herokuapp.com/${handle}`)
          .then(res => res.json())
          .then(data => { if (data.status === "success") setLiveStats(p => ({ ...p, lc: `${data.totalSolved} Solved` })); })
          .catch(() => {});
      }
      // GitHub
      if (s.github) {
        const handle = s.github.replace(/^https?:\/\/(www\.)?github\.com\/?/, "");
        fetch(`https://api.github.com/users/${handle}`)
          .then(res => res.json())
          .then(data => { if (data.public_repos !== undefined) setLiveStats(p => ({ ...p, gh: `${data.public_repos} Repos` })); })
          .catch(() => {});
      }
    }
  }, [isExpanded, s.codeforces, s.leetcode, s.github]);

  const displayName = s.fullName || s.email?.split("@")[0] || "Unknown";
  const initial     = displayName.charAt(0).toUpperCase();
  const cgpaNum     = parseFloat(s.cgpa);
  const tag         = getPlacementTag(s);
  const stageObj    = PIPELINE_STAGES.find(p => p.value === status) || PIPELINE_STAGES[0];
  const hasCoding   = s.leetcode || s.codeforces || s.codechef || s.codolio;

  const cgpaColor = cgpaNum >= 8.5
    ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800"
    : cgpaNum >= 7
      ? "text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800"
      : "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700";

  return (
    <div className={`rounded-xl border bg-white shadow-sm dark:bg-slate-800/80 transition-all overflow-hidden ${isSelected ? "border-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800 dark:border-indigo-600" : status === "selected" ? "border-emerald-300 dark:border-emerald-700" : "border-slate-200 dark:border-slate-700"}`}>
      {/* ── Collapsed ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
        {/* Checkbox */}
        <button onClick={e => { e.stopPropagation(); toggleSelect(s.id); }} className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors">
          {isSelected ? <CheckSquare size={18} className="text-indigo-600 dark:text-indigo-400"/> : <Square size={18}/>}
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          {s.avatarUrl
            ? <img src={s.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover shadow ring-2 ring-white dark:ring-slate-800"/>
            : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow ring-2 ring-white dark:ring-slate-800">{initial}</div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</h3>
            {/* Placement tag */}
            <span className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${tag.color}`}>{tag.label}</span>
            {/* Pipeline stage badge */}
            {status && <span className={`hidden md:inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${stageObj.color}`}>{stageObj.label}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {s.branch && <span>{s.branch}</span>}
            {s.year && <><span className="text-slate-300 dark:text-slate-600">·</span><span>{s.year}</span></>}
            {s.gender && <><span className="text-slate-300 dark:text-slate-600">·</span><span>{s.gender}</span></>}
            {s.email && <><span className="text-slate-300 dark:text-slate-600 hidden lg:inline">·</span><span className="hidden lg:inline truncate max-w-[200px]">{s.email}</span></>}
          </div>
        </div>

        {/* Chips */}
        <div className="hidden sm:flex items-center gap-1.5">
          {s.cgpa && !isNaN(cgpaNum) && <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${cgpaColor}`}>{cgpaNum.toFixed(1)}</span>}
          {s.marks10th && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">10th: {s.marks10th}%</span>}
          {s.marks12th && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">12th: {s.marks12th}%</span>}
        </div>

        {/* Expand */}
        <button onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : s.id); }} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
          {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
      </div>

      {/* ── Expanded ── */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-1 duration-200">
          {/* Banner */}
          <div className="relative isolate overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
            <div className="px-6 pb-4 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative z-10">
              <div className="shrink-0">
                {s.avatarUrl
                  ? <img src={s.avatarUrl} alt="" className="h-20 w-20 rounded-xl object-cover shadow-lg ring-4 ring-white dark:ring-slate-800 bg-white" />
                  : <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-slate-800">{initial}</div>
                }
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{displayName}</h2>
                <p className="text-sm text-slate-500">{[s.branch, s.year && `Batch ${s.year}`, s.gender].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex items-center gap-2 pb-1 flex-wrap">
                {s.primaryResumeUrl && <>
                  <button onClick={() => setPreviewUrl(s.primaryResumeUrl)} className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"><Eye size={14}/> Preview Resume</button>
                  <a href={s.primaryResumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-all"><FileText size={14}/> Download</a>
                </>}
                {s.email && <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"><Mail size={14}/> Email</a>}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* COL 1: Academic */}
            <div className="space-y-4">
              <Section title="Academic & Contact" icon={<GraduationCap size={12}/>}>
                <div className="space-y-2.5">
                  {s.cgpa && !isNaN(cgpaNum) && <InfoRow icon={<Award size={14} className="text-emerald-500"/>} label="CGPA" value={cgpaNum.toFixed(2)} bold/>}
                  {s.marks10th && <InfoRow icon={<Hash size={14} className="text-blue-500"/>} label="10th Marks" value={`${s.marks10th}%`}/>}
                  {s.marks12th && <InfoRow icon={<Hash size={14} className="text-violet-500"/>} label="12th Marks" value={`${s.marks12th}%`}/>}
                  {s.branch && <InfoRow icon={<GraduationCap size={14} className="text-indigo-500"/>} label="Branch" value={s.branch}/>}
                  {s.year && <InfoRow icon={<Calendar size={14} className="text-violet-500"/>} label="Graduation" value={`Batch ${s.year}`}/>}
                  <InfoRow icon={<AlertTriangle size={14} className="text-amber-500"/>} label="Active Backlogs" value={s.activeBacklogs || "0"}/>
                  <InfoRow icon={<AlertTriangle size={14} className="text-orange-500"/>} label="Backlog History" value={s.backlogHistory || "0"}/>
                  {s.email && <InfoRow icon={<Mail size={14} className="text-blue-500"/>} label="Email" value={s.email} href={`mailto:${s.email}`}/>}
                  {s.phone && <InfoRow icon={<Phone size={14} className="text-green-500"/>} label="Phone" value={s.phone}/>}
                  {s.location && <InfoRow icon={<MapPin size={14} className="text-rose-500"/>} label="Location" value={s.location}/>}
                  {s.gender && <InfoRow icon={<UserCircle size={14} className="text-purple-500"/>} label="Gender" value={s.gender}/>}
                </div>
              </Section>
              {s.about && <Section title="About" icon={<BookOpen size={12}/>}><p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{s.about}</p></Section>}
            </div>

            {/* COL 2: Coding + Links */}
            <div className="space-y-4">
              <Section title="Coding Profiles" icon={<Code2 size={12} className="text-indigo-500"/>}>
                {hasCoding ? (
                  <div className="space-y-2">
                    {s.leetcode   && <CodingCard platform="LeetCode"   handle={s.leetcode}   url={s.leetcode.startsWith("http") ? s.leetcode : `https://leetcode.com/u/${s.leetcode}`}     g="from-amber-500 to-orange-500" bg="bg-amber-50 dark:bg-amber-900/10" bc="border-amber-200 dark:border-amber-800/50" liveStat={liveStats.lc}/>}
                    {s.codeforces && <CodingCard platform="Codeforces"  handle={s.codeforces} url={s.codeforces.startsWith("http") ? s.codeforces : `https://codeforces.com/profile/${s.codeforces}`} g="from-blue-500 to-cyan-500" bg="bg-blue-50 dark:bg-blue-900/10" bc="border-blue-200 dark:border-blue-800/50" liveStat={liveStats.cf}/>}
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
            </div>

            {/* COL 3: Status + Notes */}
            <div className="space-y-4">
              {/* Pipeline Status */}
              <Section title="Pipeline Status" icon={<Star size={12}/>}>
                <div className="space-y-3">
                  <select value={status} onChange={e => updateStatus(s.id, e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 px-3 py-2.5 text-sm font-medium focus:border-indigo-400 focus:outline-none dark:text-white appearance-none cursor-pointer">
                    {PIPELINE_STAGES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                  {status && <div className={`text-center rounded-lg px-3 py-2 text-xs font-bold ${stageObj.color}`}>Current: {stageObj.label}</div>}

                  {/* Placement tag */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Placement:</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${tag.color}`}>{tag.label}</span>
                  </div>
                </div>
              </Section>

              {/* Private Notes */}
              <Section title="Private Notes" icon={<StickyNote size={12} className="text-amber-500"/>}>
                <textarea
                  value={note} onChange={e => updateNote(s.id, e.target.value)}
                  placeholder="Add private notes about this candidate..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700 p-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none resize-none"
                />
                {note && <p className="text-[10px] text-slate-400 mt-1">Saved locally · Only visible to you</p>}
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ Sub-Components ═══════════ */
function Section({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">{icon} {title}</h4>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, href, bold }) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">{icon}</div>
      <div className="flex-1 min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p><p className={`text-sm truncate ${bold?"font-bold text-slate-900 dark:text-white":"text-slate-700 dark:text-slate-300"}`}>{value}</p></div>
    </div>
  );
  return href ? <a href={href} className="block rounded-lg p-0.5 -m-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">{inner}</a> : inner;
}

function CodingCard({ platform, handle, url, g, bg, bc, liveStat }) {
  const h = handle?.replace(/^https?:\/\/(www\.)?[^/]+\/(u\/|profile\/|users\/)?/,"") || handle;
  return <a href={url} target="_blank" rel="noopener noreferrer" className={`group flex flex-col gap-2 rounded-lg border ${bc} ${bg} p-3 hover:shadow-sm transition-all`}><div className="flex items-center gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${g} text-white shadow-sm`}><Code2 size={14}/></div><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 dark:text-slate-200">{platform}</p><p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{h}</p></div><ExternalLink size={12} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-colors"/></div>{liveStat && <div className="mt-1 flex items-center gap-1.5"><span className="inline-flex items-center rounded bg-white/60 dark:bg-black/20 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shadow-sm capitalize">{liveStat}</span></div>}</a>;
}

function SocialLink({ icon, label, handle, url, liveStat }) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 hover:shadow-sm transition-all"><div className="flex items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{icon}</div><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p><p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{handle}</p></div><ExternalLink size={12} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-colors"/></div>{liveStat && <div className="mt-1 flex items-center gap-1.5"><span className="inline-flex items-center rounded bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm capitalize">{liveStat}</span></div>}</a>;
}

function EmptyState({ icon, text }) {
  return <div className="flex flex-col items-center justify-center py-5 text-slate-400"><div className="mb-1.5 opacity-30">{icon}</div><p className="text-xs">{text}</p></div>;
}

function FilterSelect({ label, value, onChange, options }) {
  return <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label><select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">{options.map(o=><option key={o} value={o}>{o === "All" ? `All ${label}s` : o}</option>)}</select></div>;
}

function FilterInput({ label, value, onChange, placeholder }) {
  return <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label><input type="number" step="any" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"/></div>;
}