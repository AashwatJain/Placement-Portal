import { useState, useEffect } from "react";
import { useOpportunities } from "../../hooks/useOpportunities";
import { useAuth } from "../../context/AuthContext";
import { getUserApplications, registerForOpportunity } from "../../services/firebaseDb";
import { useToast } from "../../context/ToastContext";
import { buildTimeline, gCalUrl } from "../../utils/calendarHelpers";
import { offerBadge, deadlineLabel } from "../../utils/statusHelpers";
import CardSkeleton from "../../components/ui/CardSkeleton";
import {
  Search, Filter, MapPin, Calendar, IndianRupee, Briefcase,
  CheckCircle, Loader2, Clock, X,
  ExternalLink, AlertCircle, Users, GraduationCap,
  Building2, FileText, CalendarPlus,
} from "lucide-react";

const PROCESS_STEPS = [
  { key: "shortlistDate", label: "Shortlisted" },
  { key: "oaDate", label: "Online Assessment (OA)" },
  { key: "oaResultDate", label: "OA Result" },
  { key: "interviewDate", label: "Interview" },
  { key: "interviewResultDate", label: "Interview Result" },
  { key: "finalResultDate", label: "Final Decision" },
];

export default function Opportunities() {
  const { opportunities, loading, error } = useOpportunities();
  const { user } = useAuth();

  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [registered, setRegistered] = useState({});
  const [registering, setRegistering] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getUserApplications(user.uid).then((appsArray) => {
      const map = {};
      appsArray.forEach((app) => (map[app.id] = true));
      setRegistered(map);
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
      await registerForOpportunity(user.uid, opp.id, appData);
      setRegistered((p) => ({ ...p, [opp.id]: true }));
      showToast({ type: "success", title: "Registered!", message: `You've registered for ${opp.name}. Check My Applications.` });
    } catch (err) {
      console.error("Register error:", err);
      showToast({ type: "error", title: "Registration Failed", message: "Could not register. Please try again." });
    } finally { setRegistering(null); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white">Opportunities</h1>
          <p className="text-brand-cream-500 dark:text-brand-beige-400">Active placement & internship drives. Click a card for full details.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-brown-400" />
            <input type="text" placeholder="Search company or role..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border border-brand-beige-200 bg-white pl-9 pr-4 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white w-full sm:w-64" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-lg border border-brand-beige-200 bg-white px-3 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white cursor-pointer">
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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

        {!loading && filtered.map((opp) => {
          const dl = deadlineLabel(opp.lastDate);
          return (
            <div key={opp.id} onClick={() => setSelectedOpp(opp)}
              className="group cursor-pointer flex flex-col justify-between rounded-xl border border-brand-beige-200 bg-white p-5 shadow-sm transition-all hover:border-brand-amber-500/100 hover:shadow-lg dark:border-[#3E2315] dark:bg-[#1A0F08] dark:hover:border-brand-amber-500/100">
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-xl font-bold text-white shadow-md">
                      {(opp.name || "?").charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-brown-900 dark:text-white group-hover:text-brand-amber-500 transition-colors">{opp.name}</h3>
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${offerBadge(opp.offerType)}`}>
                        {opp.offerType || "Placement"}
                      </span>
                    </div>
                  </div>
                  {opp.ctc && <p className="text-sm font-bold text-green-600 dark:text-green-400">{opp.ctc}</p>}
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5 text-xs text-brand-cream-500 dark:text-brand-beige-400">
                  <span className="flex items-center gap-1 bg-brand-cream-50 rounded px-2 py-1 dark:bg-[#2A1810]"><Briefcase size={11} /> {opp.roles || "SDE"}</span>
                  {opp.location && <span className="flex items-center gap-1 bg-brand-cream-50 rounded px-2 py-1 dark:bg-[#2A1810]"><MapPin size={11} /> {opp.location}</span>}
                  {opp.cgpaCutoff && <span className="flex items-center gap-1 bg-brand-cream-50 rounded px-2 py-1 dark:bg-[#2A1810]"><GraduationCap size={11} /> ≥ {opp.cgpaCutoff}</span>}
                </div>

                {opp.lastDate && (
                  <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 ${dl?.urgent ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20" : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"}`}>
                    <Clock size={14} className={dl?.urgent ? "text-red-500" : "text-amber-600 dark:text-amber-400"} />
                    <span className="text-xs font-medium text-brand-brown-800 dark:text-brand-beige-200">Deadline: {opp.lastDate}</span>
                    {dl && <span className={`ml-auto text-[10px] font-bold ${dl.color}`}>{dl.text}</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-brand-beige-100 dark:border-[#3E2315]">
                <span className="text-xs font-medium text-brand-amber-500 group-hover:underline dark:text-brand-amber-500">View Details →</span>
                {registered[opp.id] && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600"><CheckCircle size={12} /> Registered</span>
                )}
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && !error && (
          <div className="col-span-full rounded-xl border border-dashed border-brand-beige-300 p-12 text-center dark:border-[#5A3D2B]">
            <Filter className="mx-auto mb-3 text-brand-beige-300 dark:text-brand-brown-600" size={40} />
            <p className="text-brand-cream-500 dark:text-brand-beige-400">No opportunities found.</p>
          </div>
        )}
      </div>

      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedOpp(null)}>
          <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1A0F08] border border-brand-beige-200 dark:border-[#3E2315]"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between border-b border-brand-beige-100 bg-brand-cream-50 px-6 py-5 dark:border-[#3E2315] dark:bg-[#2A1810]/50">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-2xl font-bold text-white shadow-lg">
                  {(selectedOpp.name || "?").charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-brown-900 dark:text-white">{selectedOpp.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-brand-cream-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Briefcase size={13} className="text-brand-amber-500/100" /> {selectedOpp.roles || "SDE"}</span>
                    {selectedOpp.location && <span className="flex items-center gap-1"><MapPin size={13} className="text-red-500" /> {selectedOpp.location}</span>}
                    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-medium uppercase border ${offerBadge(selectedOpp.offerType)}`}>{selectedOpp.offerType}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="rounded-full p-2 hover:bg-brand-beige-200 dark:hover:bg-brand-brown-700"><X size={22} className="text-brand-cream-500" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-6 lg:grid-cols-5">

                <div className="lg:col-span-3 space-y-6">

                  {selectedOpp.lastDate && (() => {
                    const dl = deadlineLabel(selectedOpp.lastDate);
                    return (
                      <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${dl?.urgent ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/15" : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/15"}`}>
                        <AlertCircle className={dl?.urgent ? "text-red-500" : "text-amber-600 dark:text-amber-400"} size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-brand-brown-900 dark:text-white">Last Date to Apply: {selectedOpp.lastDate}</p>
                          {dl && <p className={`text-xs mt-0.5 ${dl.color}`}>{dl.text}</p>}
                        </div>
                        <a
                          href={gCalUrl(`${selectedOpp.name} — Last Date to Apply`, selectedOpp.lastDate, `Last date to register for ${selectedOpp.name} drive.\nRole: ${selectedOpp.roles}\nCTC: ${selectedOpp.ctc || "N/A"}`)}
                          target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 rounded-lg border border-brand-amber-500/30 bg-white px-3 py-2 text-xs font-bold text-brand-amber-500 hover:bg-brand-amber-500/10 dark:border-brand-amber-700 dark:bg-[#2A1810] dark:text-brand-amber-500 dark:hover:bg-blue-900/30 transition-all shadow-sm"
                          title="Save deadline to Google Calendar"
                        >
                          <CalendarPlus size={14} /> Add to Calendar
                        </a>
                      </div>
                    );
                  })()}

                  <section>
                    <h3 className="mb-4 text-base font-bold text-brand-brown-900 dark:text-white flex items-center gap-2">
                      <Calendar className="text-brand-amber-500/100" size={18} /> Selection Process
                    </h3>
                    <div className="relative ml-3">
                      {PROCESS_STEPS.filter((ps) => selectedOpp[ps.key]).map((ps, idx, filteredArr) => {
                        const date = selectedOpp[ps.key];
                        const isLast = idx === filteredArr.length - 1;
                        return (
                          <div key={ps.key} className="relative flex items-start gap-4 pb-5">
                            {!isLast && <div className="absolute left-[13px] top-7 w-0.5 h-[calc(100%-10px)] bg-brand-beige-200 dark:bg-brand-brown-700" />}
                            <div className="relative z-10 shrink-0 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-brand-beige-100 border-brand-beige-300 text-brand-cream-500 dark:bg-brand-brown-700 dark:border-[#7A543A] dark:text-brand-beige-400">
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-brand-brown-800 dark:text-brand-beige-200">{ps.label}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-brand-cream-500 font-medium">{date}</span>
                                <a href={gCalUrl(`${selectedOpp.name} — ${ps.label}`, date, `${ps.label} for ${selectedOpp.name}`)}
                                  target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] font-bold text-brand-amber-500/100 hover:underline flex items-center gap-0.5"
                                  title="Add to Google Calendar">
                                  <ExternalLink size={9} /> Calendar
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-base font-bold text-brand-brown-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="text-emerald-500" size={18} /> Eligibility
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-brand-beige-200 bg-brand-cream-50 p-3 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
                        <p className="text-[10px] font-bold uppercase text-brand-cream-500 mb-1">CGPA Cutoff</p>
                        <p className="text-sm font-bold text-brand-brown-900 dark:text-white">≥ {selectedOpp.cgpaCutoff || "No restriction"}</p>
                      </div>
                      <div className="rounded-lg border border-brand-beige-200 bg-brand-cream-50 p-3 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
                        <p className="text-[10px] font-bold uppercase text-brand-cream-500 mb-1">Drive Type</p>
                        <p className="text-sm font-bold text-brand-brown-900 dark:text-white">{selectedOpp.driveType || "On-campus"}</p>
                      </div>
                      {selectedOpp.branches && (
                        <div className="rounded-lg border border-brand-beige-200 bg-brand-cream-50 p-3 col-span-2 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
                          <p className="text-[10px] font-bold uppercase text-brand-cream-500 mb-1">Eligible Branches</p>
                          <p className="text-sm font-bold text-brand-brown-900 dark:text-white">{selectedOpp.branches}</p>
                        </div>
                      )}
                      {selectedOpp.backlogs && (
                        <div className="rounded-lg border border-brand-beige-200 bg-brand-cream-50 p-3 col-span-2 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
                          <p className="text-[10px] font-bold uppercase text-brand-cream-500 mb-1">Backlog Policy</p>
                          <p className="text-sm font-bold text-brand-brown-900 dark:text-white">{selectedOpp.backlogs}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-2 space-y-5">
                  {selectedOpp.ctc && (
                    <div className="rounded-xl bg-gradient-to-br from-brand-amber-500 to-violet-700 p-5 text-white shadow-xl">
                      <div className="flex items-center gap-2 mb-2 opacity-90"><IndianRupee size={18} /> <h4 className="font-bold">Compensation</h4></div>
                      <div className="text-3xl font-black mb-1">{selectedOpp.ctc}</div>
                      <p className="text-brand-amber-500/30 text-sm mb-4">Cost to Company</p>
                      {selectedOpp.stipend && (
                        <div className="flex justify-between text-sm border-t border-white/20 pt-3">
                          <span className="text-brand-amber-500/30">Stipend</span>
                          <span className="font-bold">{selectedOpp.stipend}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedOpp.location && (
                    <div className="rounded-xl border border-brand-beige-200 bg-brand-cream-50 p-4 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-cream-500 mb-2">Office Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpp.location.split(",").map((loc, i) => (
                          <span key={i} className="flex items-center gap-1 rounded-full bg-white border border-brand-beige-200 px-3 py-1.5 text-xs font-medium text-brand-brown-700 dark:bg-[#2A1810] dark:border-[#5A3D2B] dark:text-brand-beige-300">
                            <MapPin size={10} /> {loc.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-brand-beige-200 bg-brand-cream-50 p-4 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-cream-500 mb-2">Offer Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-brand-cream-500">Type</span><span className="font-bold text-brand-brown-900 dark:text-white">{selectedOpp.offerType}</span></div>
                      <div className="flex justify-between"><span className="text-brand-cream-500">Roles</span><span className="font-bold text-brand-brown-900 dark:text-white">{selectedOpp.roles}</span></div>
                      {selectedOpp.bond && <div className="flex justify-between"><span className="text-brand-cream-500">Bond</span><span className="font-bold text-brand-brown-900 dark:text-white">{selectedOpp.bond}</span></div>}
                    </div>
                  </div>

                  {selectedOpp.description && (
                    <div className="rounded-xl border border-brand-beige-200 bg-brand-cream-50 p-4 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-cream-500 mb-2">About the Drive</p>
                      <p className="text-sm text-brand-brown-700 dark:text-brand-beige-300 leading-relaxed">{selectedOpp.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-brand-beige-200 px-6 py-4 bg-white dark:border-[#3E2315] dark:bg-[#1A0F08] flex justify-end gap-3">
              <button onClick={() => setSelectedOpp(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-brand-brown-600 hover:bg-brand-beige-100 dark:text-brand-beige-300 dark:hover:bg-brand-brown-800">Close</button>
              <button
                onClick={() => handleRegister(selectedOpp)}
                disabled={registered[selectedOpp.id] || registering === selectedOpp.id}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${registered[selectedOpp.id]
                  ? "bg-green-500 text-white shadow-green-500/20 cursor-default"
                  : registering === selectedOpp.id
                    ? "bg-brand-amber-500 text-white cursor-wait"
                    : "bg-brand-amber-500 hover:bg-brand-amber-600 text-white shadow-brand-amber-500/100/20"
                  }`}>
                {registering === selectedOpp.id ? <><Loader2 size={16} className="animate-spin" /> Registering...</> :
                  registered[selectedOpp.id] ? <><CheckCircle size={16} /> Update Registration</> :
                    "Register for this Drive"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
