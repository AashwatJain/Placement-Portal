import { useState } from "react";
import { useCompanies } from "../../hooks/useCompanies";
import CardSkeleton from "../../components/ui/CardSkeleton";
import Toast from "../../components/ui/Toast";
import {
  Search, MapPin, Calendar, IndianRupee,
  Users, ExternalLink, X, Code, Briefcase,
  Linkedin, Mail, Terminal, CheckCircle
} from "lucide-react";

// ── Main Component ────────────────────────────────────────────
export default function Company() {
  const { companies, loading, error } = useCompanies();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [toast, setToast] = useState(null);
  const [registered, setRegistered] = useState({}); // track which companies registered

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || company.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleRegisterInterest = (companyName) => {
    setRegistered(prev => ({ ...prev, [companyName]: true }));
    setToast(companyName);
    setTimeout(() => setToast(null), 3500);
  };

  const getContactIcon = (link) => link.includes("@") || link.startsWith("mailto:") ? <Mail size={16} /> : <Linkedin size={16} />;
  const getContactLabel = (link) => link.includes("@") || link.startsWith("mailto:") ? "Email Senior" : "Connect on LinkedIn";

  // Platform → button style
  const platformStyle = (platform) => {
    if (platform === "LeetCode") return "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40";
    if (platform === "GFG") return "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40";
    if (platform === "System Design") return "bg-brand-amber-500/10 text-brand-amber-500 hover:bg-brand-amber-500/20 dark:bg-blue-900/20 dark:text-brand-amber-500 dark:hover:bg-blue-900/40";
    return "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40";
  };

  return (
    <div className="space-y-6 relative">

      {/* Header & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white">Placement Drives</h1>
          <p className="text-brand-cream-500 dark:text-brand-beige-400">Past stats, senior contacts, and prep material.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-brown-400" />
            <input
              type="text"
              placeholder="Search company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-lg border border-brand-beige-200 bg-white pl-9 pr-4 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white w-full sm:w-64"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-lg border border-brand-beige-200 bg-white px-3 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white cursor-pointer"
          >
            <option value="All">All Drives</option>
            <option value="On-Campus">On-Campus</option>
            <option value="Off-Campus">Off-Campus</option>
            <option value="FTE">FTE</option>
            <option value="Intern">Intern</option>
            <option value="FTE + Intern">FTE + Intern</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ Could not load companies: {error}
        </div>
      )}

      {/* Company Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

        {!loading && filteredCompanies.map((company) => (
          <div
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className="group cursor-pointer rounded-xl border border-brand-beige-200 bg-white p-5 shadow-sm transition-all hover:border-brand-amber-500/100 hover:shadow-md dark:border-[#3E2315] dark:bg-[#1A0F08] dark:hover:border-brand-amber-500/100"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-beige-100 text-xl font-bold text-brand-brown-700 dark:bg-[#2A1810] dark:text-white border border-brand-beige-200 dark:border-[#5A3D2B]">
                  {company.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-brand-brown-900 dark:text-white group-hover:text-brand-amber-500 transition-colors">{company.name}</h3>
                  <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${company.type === "On-Campus"
                    ? "bg-brand-amber-500/10 text-brand-amber-600 border-brand-amber-500/20 dark:bg-brand-amber-800/20 dark:text-brand-amber-500 dark:border-brand-amber-700"
                    : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                    }`}>
                    {company.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-brand-cream-500">CGPA</p>
                <p className="font-bold text-brand-brown-900 dark:text-white">≥ {company.cgpaCutoff}</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-brand-cream-50 p-2.5 text-brand-brown-700 dark:bg-[#2A1810] dark:text-brand-beige-300">
                <IndianRupee size={16} className="text-green-600" />
                <span className="font-bold">{company.ctc}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-brand-cream-50 p-2.5 text-brand-brown-700 dark:bg-[#2A1810] dark:text-brand-beige-300">
                <Calendar size={16} className="text-brand-amber-500" />
                <span className="font-medium">{company.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-brand-beige-100 pt-3 dark:border-[#3E2315]">
              <span className="flex items-center gap-1 text-xs text-brand-cream-500">
                <MapPin size={12} /> {company.locations?.[0]}
              </span>
              <span className="text-xs font-medium text-brand-amber-500 group-hover:underline dark:text-brand-amber-500">
                View Prep & Tips →
              </span>
            </div>
          </div>
        ))}

        {!loading && filteredCompanies.length === 0 && !error && (
          <div className="col-span-full rounded-xl border border-dashed border-brand-beige-300 p-12 text-center dark:border-[#5A3D2B]">
            <p className="text-brand-cream-500 dark:text-brand-beige-400">No companies found for "{searchTerm}".</p>
          </div>
        )}
      </div>

      {/* ── COMPANY DETAIL MODAL ── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1A0F08] border border-brand-beige-200 dark:border-[#3E2315]">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-beige-100 bg-brand-cream-50 p-6 dark:border-[#3E2315] dark:bg-[#2A1810]/50">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-3xl font-bold shadow-sm dark:bg-[#2A1810] dark:text-white border border-brand-beige-200 dark:border-[#5A3D2B]">
                  {selectedCompany.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-brand-brown-900 dark:text-white">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-brand-cream-500 dark:text-brand-beige-400 mt-1">
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-brand-beige-200 dark:bg-[#2A1810] dark:border-[#5A3D2B]">
                      <Briefcase size={14} className="text-brand-amber-500/100" /> {selectedCompany.roles?.join(" / ")}
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-brand-beige-200 dark:bg-[#2A1810] dark:border-[#5A3D2B]">
                      <MapPin size={14} className="text-red-500" /> {selectedCompany.locations?.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="rounded-full p-2 hover:bg-brand-beige-200 dark:hover:bg-brand-brown-700 transition-colors">
                <X size={24} className="text-brand-cream-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-8 lg:grid-cols-3">

                {/* LEFT: Questions */}
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-brown-900 dark:text-white">
                      <Terminal className="text-brand-amber-500/100" size={20} /> Past Year Questions
                    </h3>
                    <div className="space-y-3">
                      {selectedCompany.interviewQuestions?.length > 0 ? (
                        selectedCompany.interviewQuestions.map((q, idx) => (
                          <div key={idx} className="rounded-lg border border-brand-beige-200 bg-white p-4 hover:border-brand-amber-500/40 dark:border-[#3E2315] dark:bg-[#1A0F08] dark:hover:border-brand-amber-600 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold uppercase text-brand-brown-400 tracking-wider">{q.topic}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${q.difficulty === "Hard" ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50" :
                                q.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50" :
                                  "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50"
                                }`}>{q.difficulty}</span>
                            </div>
                            <p className="font-medium text-brand-brown-900 dark:text-white mb-3 text-lg">{q.question}</p>
                            {/* ✅ Working link button */}
                            <a
                              href={q.link || "#"}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${platformStyle(q.platform)}`}
                            >
                              <Code size={14} /> Solve on {q.platform} <ExternalLink size={12} />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-brand-beige-300 p-6 text-center text-brand-cream-500 dark:border-[#5A3D2B]">
                          No questions added yet. Be the first to contribute!
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* RIGHT: Seniors & Stats */}
                <div className="space-y-6">
                  <section>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-brown-900 dark:text-white">
                      <Users className="text-brand-amber-500/100" size={20} /> Seniors (Past Hires)
                    </h3>
                    <div className="rounded-xl border border-brand-beige-200 bg-brand-cream-50/50 p-4 dark:border-[#3E2315] dark:bg-[#2A1810]/20">
                      {selectedCompany.pastHires?.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCompany.pastHires.map((senior, idx) => (
                            <div key={idx} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-brand-beige-100 dark:bg-[#1A0F08] dark:border-[#5A3D2B]">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-brand-amber-500/20 flex items-center justify-center text-sm font-bold text-brand-amber-600 dark:bg-brand-amber-800 dark:text-brand-amber-500/40">
                                {senior.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-brand-brown-900 dark:text-white truncate">{senior.name}</p>
                                <p className="text-xs text-brand-cream-500 truncate">{senior.role} • Batch '{senior.batch.slice(2)}</p>
                              </div>
                              {/* ✅ Working LinkedIn button */}
                              <a
                                href={senior.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                title={getContactLabel(senior.linkedin)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cream-50 text-brand-cream-500 hover:bg-brand-amber-500/10 hover:text-brand-amber-500 dark:bg-[#2A1810] dark:text-brand-beige-400 dark:hover:bg-blue-900/30 dark:hover:text-brand-amber-500 transition-all border border-brand-beige-200 dark:border-[#5A3D2B]"
                              >
                                {getContactIcon(senior.linkedin)}
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-brand-cream-500 text-center py-4">No alumni data available yet.</p>
                      )}
                    </div>
                  </section>

                  {/* CTC Card */}
                  <div className="rounded-xl bg-gradient-to-br from-brand-amber-500 to-violet-700 p-5 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-4 opacity-90">
                      <IndianRupee size={20} />
                      <h4 className="font-bold text-lg">Compensation</h4>
                    </div>
                    <div className="text-4xl font-black mb-1">{selectedCompany.ctc}</div>
                    <p className="text-brand-amber-500/30 text-sm mb-6">Cost to Company (CTC)</p>
                    <div className="space-y-3 border-t border-white/20 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-amber-500/20">Cutoff CGPA</span>
                        <span className="font-bold">{selectedCompany.cgpaCutoff}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-amber-500/20">Selection Ratio</span>
                        <span className="font-bold">~1.5%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-brand-beige-200 p-4 bg-white dark:border-[#3E2315] dark:bg-[#1A0F08] flex justify-end gap-3">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-5 py-2 rounded-lg text-sm font-medium text-brand-brown-600 hover:bg-brand-beige-100 dark:text-brand-beige-300 dark:hover:bg-brand-brown-800"
              >
                Close
              </button>
              {/* ✅ Working Register Interest button */}
              <button
                onClick={() => handleRegisterInterest(selectedCompany.name)}
                disabled={registered[selectedCompany.name]}
                className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${registered[selectedCompany.name]
                  ? "bg-green-500 text-white shadow-green-500/20 cursor-default"
                  : "bg-brand-amber-500 hover:bg-brand-amber-600 text-white shadow-brand-amber-500/100/20"
                  }`}
              >
                {registered[selectedCompany.name] ? (
                  <><CheckCircle size={16} /> Registered!</>
                ) : (
                  "Register Interest"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ✅ Toast Notification */}
      {toast && <Toast company={toast} onClose={() => setToast(null)} />}

    </div>
  );
}