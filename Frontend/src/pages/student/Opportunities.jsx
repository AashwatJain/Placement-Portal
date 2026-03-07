import { useState, useEffect } from "react";
import { useOpportunities } from "../../hooks/useOpportunities";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { ref, set, get } from "firebase/database";
import {
  Search, MapPin, Calendar, DollarSign, Briefcase,
  CheckCircle, Loader2, Clock, Filter, X,
  ExternalLink, AlertCircle, Users, GraduationCap,
  Building2, FileText, CalendarPlus,
} from "lucide-react";

// ── Skeleton ──────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 shadow-2xl px-5 py-4 animate-in slide-in-from-bottom-4 duration-300">
      <CheckCircle className="text-green-500 shrink-0" size={22} />
      <div>
        <p className="font-bold text-slate-900 dark:text-white text-sm">Registered!</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
    </div>
  );
}

// ── CORRECT PROCESS: the actual placement timeline ────────────
// These are the steps every company follows. Dates come from Firestore.
const PROCESS_STEPS = [
  { key: "shortlistDate",       label: "Shortlisted" },
  { key: "oaDate",              label: "Online Assessment (OA)" },
  { key: "oaResultDate",        label: "OA Result" },
  { key: "interviewDate",       label: "Interview" },
  { key: "interviewResultDate", label: "Interview Result" },
  { key: "finalResultDate",     label: "Final Decision" },
];

// Build timeline from opportunity data for saving to Firebase on registration
function buildTimeline(opp) {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { step: "Applied",           date: today,                          done: true },
    { step: "Shortlisted",       date: opp.shortlistDate || null,      done: false },
    { step: "Online Assessment", date: opp.oaDate || null,             done: false },
    { step: "OA Result",         date: opp.oaResultDate || null,       done: false },
    { step: "Interview",         date: opp.interviewDate || null,      done: false },
    { step: "Interview Result",  date: opp.interviewResultDate || null,done: false },
    { step: "Final Decision",    date: opp.finalResultDate || null,    done: false },
  ];
}

// ── Offer-type badge ──────────────────────────────────────────
function offerBadge(type) {
  if (type === "Placement")   return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
  if (type === "Internship")  return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
  return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
}

// ── Deadline urgency ──────────────────────────────────────────
function deadlineLabel(lastDate) {
  if (!lastDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dl = new Date(lastDate + "T00:00:00");
  const diff = Math.ceil((dl - today) / 86400000);
  if (diff < 0)  return { text: "Deadline passed", color: "text-red-600 dark:text-red-400", urgent: true };
  if (diff === 0) return { text: "Last day!", color: "text-red-600 dark:text-red-400 font-bold", urgent: true };
  if (diff <= 3)  return { text: `${diff} day${diff > 1 ? "s" : ""} left`, color: "text-amber-600 dark:text-amber-400 font-semibold", urgent: true };
  return { text: `${diff} days left`, color: "text-slate-600 dark:text-slate-400", urgent: false };
}

// ── Google Calendar URL for a single date event ───────────────
function gCalUrl(title, date, details) {
  const d = (date || "").replace(/-/g, "");
  if (!d) return "#";
  const p = new URLSearchParams({
    action: "TEMPLATE", text: title,
    dates: `${d}/${d}`, details: details || "",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

// ══════════════════════════════════════════════════════════════
export default function Opportunities() {
  const { opportunities, loading, error } = useOpportunities();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm]   = useState("");
  const [filterType, setFilterType]   = useState("All");
  const [toast, setToast]             = useState(null);
  const [registered, setRegistered]   = useState({});
  const [registering, setRegistering] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    get(ref(db, `users/${user.uid}/applications`)).then((snap) => {
      if (snap.exists()) {
        const map = {};
        Object.keys(snap.val()).forEach((k) => (map[k] = true));
        setRegistered(map);
      }
    });
  }, [user?.uid]);

  const filtered = opportunities.filter((opp) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = (opp.name || "").toLowerCase().includes(s) || (opp.roles || "").toLowerCase().includes(s);
    const matchType = filterType === "All" || opp.offerType === filterType;
    return matchSearch && matchType;
  });

  const handleRegister = async (opp) => {
    if (!user?.uid) return;
    setRegistering(opp.id);
    const appData = {
      company: opp.name, role: opp.roles || "SDE",
      offerType: opp.offerType || "Placement", cgpaCutoff: opp.cgpaCutoff || "",
      ctc: opp.ctc || "", location: opp.location || "",
      status: "Applied", appliedOn: new Date().toISOString().slice(0, 10),
      timeline: buildTimeline(opp),
    };
    try {
      await set(ref(db, `users/${user.uid}/applications/${opp.id}`), appData);
      setRegistered((p) => ({ ...p, [opp.id]: true }));
      setToast(`You've registered for ${opp.name}. Check My Applications.`);
      setTimeout(() => setToast(null), 3500);
    } catch (err) { console.error("Register error:", err); }
    finally { setRegistering(null); }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Opportunities</h1>
          <p className="text-slate-500 dark:text-slate-400">Active placement & internship drives. Click a card for full details.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search company or role..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white w-full sm:w-64" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer">
            <option value="All">All Types</option>
            <option value="Placement">Placement (FTE)</option>
            <option value="Internship">Internship</option>
            <option value="Intern + PPO">Intern + PPO</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">⚠️ {error}</div>
      )}

      {/* ── CARDS GRID ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

        {!loading && filtered.map((opp) => {
          const dl = deadlineLabel(opp.lastDate);
          return (
            <div key={opp.id} onClick={() => setSelectedOpp(opp)}
              className="group cursor-pointer flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500">
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-md">
                      {(opp.name || "?").charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{opp.name}</h3>
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${offerBadge(opp.offerType)}`}>
                        {opp.offerType || "Placement"}
                      </span>
                    </div>
                  </div>
                  {opp.ctc && <p className="text-sm font-bold text-green-600 dark:text-green-400">{opp.ctc}</p>}
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 bg-slate-50 rounded px-2 py-1 dark:bg-slate-800"><Briefcase size={11} /> {opp.roles || "SDE"}</span>
                  {opp.location && <span className="flex items-center gap-1 bg-slate-50 rounded px-2 py-1 dark:bg-slate-800"><MapPin size={11} /> {opp.location}</span>}
                  {opp.cgpaCutoff && <span className="flex items-center gap-1 bg-slate-50 rounded px-2 py-1 dark:bg-slate-800"><GraduationCap size={11} /> ≥ {opp.cgpaCutoff}</span>}
                </div>

                {/* Deadline */}
                {opp.lastDate && (
                  <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 ${dl?.urgent ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20" : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"}`}>
                    <Clock size={14} className={dl?.urgent ? "text-red-500" : "text-amber-600 dark:text-amber-400"} />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Deadline: {opp.lastDate}</span>
                    {dl && <span className={`ml-auto text-[10px] font-bold ${dl.color}`}>{dl.text}</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">View Details →</span>
                {registered[opp.id] && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600"><CheckCircle size={12} /> Registered</span>
                )}
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && !error && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <Filter className="mx-auto mb-3 text-slate-300 dark:text-slate-600" size={40} />
            <p className="text-slate-500 dark:text-slate-400">No opportunities found.</p>
          </div>
        )}
      </div>

      {/* ══════════ DETAIL MODAL ══════════ */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedOpp(null)}>
          <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
               onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-lg">
                  {(selectedOpp.name || "?").charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedOpp.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Briefcase size={13} className="text-indigo-500" /> {selectedOpp.roles || "SDE"}</span>
                    {selectedOpp.location && <span className="flex items-center gap-1"><MapPin size={13} className="text-red-500" /> {selectedOpp.location}</span>}
                    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-medium uppercase border ${offerBadge(selectedOpp.offerType)}`}>{selectedOpp.offerType}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700"><X size={22} className="text-slate-500" /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-6 lg:grid-cols-5">

                {/* LEFT COL: Timeline + Details (3/5) */}
                <div className="lg:col-span-3 space-y-6">

                  {/* Deadline banner + Add to Calendar */}
                  {selectedOpp.lastDate && (() => {
                    const dl = deadlineLabel(selectedOpp.lastDate);
                    return (
                      <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${dl?.urgent ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/15" : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/15"}`}>
                        <AlertCircle className={dl?.urgent ? "text-red-500" : "text-amber-600 dark:text-amber-400"} size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Last Date to Apply: {selectedOpp.lastDate}</p>
                          {dl && <p className={`text-xs mt-0.5 ${dl.color}`}>{dl.text}</p>}
                        </div>
                        <a
                          href={gCalUrl(`${selectedOpp.name} — Last Date to Apply`, selectedOpp.lastDate, `Last date to register for ${selectedOpp.name} drive.\nRole: ${selectedOpp.roles}\nCTC: ${selectedOpp.ctc || "N/A"}`)}
                          target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all shadow-sm"
                          title="Save deadline to Google Calendar"
                        >
                          <CalendarPlus size={14} /> Add to Calendar
                        </a>
                      </div>
                    );
                  })()}

                  {/* Selection Process (READ-ONLY PREVIEW) */}
                  <section>
                    <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="text-indigo-500" size={18} /> Selection Process
                    </h3>
                    <div className="relative ml-3">
                      {PROCESS_STEPS.map((ps, idx) => {
                        const date = selectedOpp[ps.key];
                        const isLast = idx === PROCESS_STEPS.length - 1;
                        return (
                          <div key={ps.key} className="relative flex items-start gap-4 pb-5">
                            {!isLast && <div className="absolute left-[13px] top-7 w-0.5 h-[calc(100%-10px)] bg-slate-200 dark:bg-slate-700" />}
                            <div className="relative z-10 shrink-0 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400">
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ps.label}</p>
                              {date ? (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-slate-500 font-medium">{date}</span>
                                  <a href={gCalUrl(`${selectedOpp.name} — ${ps.label}`, date, `${ps.label} for ${selectedOpp.name}`)}
                                     target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                     className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-0.5"
                                     title="Add to Google Calendar">
                                    <ExternalLink size={9} /> Calendar
                                  </a>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic mt-0.5">Date to be announced</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Eligibility */}
                  <section>
                    <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="text-emerald-500" size={18} /> Eligibility
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">CGPA Cutoff</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">≥ {selectedOpp.cgpaCutoff || "No restriction"}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Drive Type</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOpp.driveType || "On-campus"}</p>
                      </div>
                      {selectedOpp.branches && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 col-span-2 dark:border-slate-700 dark:bg-slate-800/50">
                          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Eligible Branches</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOpp.branches}</p>
                        </div>
                      )}
                      {selectedOpp.backlogs && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 col-span-2 dark:border-slate-700 dark:bg-slate-800/50">
                          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Backlog Policy</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOpp.backlogs}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* RIGHT COL: CTC + Location + Extra (2/5) */}
                <div className="lg:col-span-2 space-y-5">
                  {/* CTC Card */}
                  {selectedOpp.ctc && (
                    <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-xl">
                      <div className="flex items-center gap-2 mb-2 opacity-90"><DollarSign size={18} /> <h4 className="font-bold">Compensation</h4></div>
                      <div className="text-3xl font-black mb-1">{selectedOpp.ctc}</div>
                      <p className="text-indigo-200 text-sm mb-4">Cost to Company</p>
                      {selectedOpp.stipend && (
                        <div className="flex justify-between text-sm border-t border-white/20 pt-3">
                          <span className="text-indigo-200">Stipend</span>
                          <span className="font-bold">{selectedOpp.stipend}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {selectedOpp.location && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Office Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpp.location.split(",").map((loc, i) => (
                          <span key={i} className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                            <MapPin size={10} /> {loc.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Offer Type */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Offer Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-bold text-slate-900 dark:text-white">{selectedOpp.offerType}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Roles</span><span className="font-bold text-slate-900 dark:text-white">{selectedOpp.roles}</span></div>
                      {selectedOpp.bond && <div className="flex justify-between"><span className="text-slate-500">Bond</span><span className="font-bold text-slate-900 dark:text-white">{selectedOpp.bond}</span></div>}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedOpp.description && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About the Drive</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedOpp.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-white dark:border-slate-800 dark:bg-slate-900 flex justify-end gap-3">
              <button onClick={() => setSelectedOpp(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Close</button>
              <button
                onClick={() => handleRegister(selectedOpp)}
                disabled={registered[selectedOpp.id] || registering === selectedOpp.id}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                  registered[selectedOpp.id]
                    ? "bg-green-500 text-white shadow-green-500/20 cursor-default"
                    : registering === selectedOpp.id
                    ? "bg-indigo-400 text-white cursor-wait"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                }`}>
                {registering === selectedOpp.id ? <><Loader2 size={16} className="animate-spin" /> Registering...</> :
                 registered[selectedOpp.id] ? <><CheckCircle size={16} /> Update Registration</> :
                 "Register for this Drive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
