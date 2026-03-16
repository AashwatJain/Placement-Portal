import { useState, useEffect, useMemo, useRef } from "react";
import { Building2, Edit, Trash2, X, Filter, Users, Upload, CheckSquare, Send, Loader2 } from "lucide-react";
import { fetchJafs, createJaf, updateJaf, deleteJaf, fetchFilteredStudents } from "../../services/adminApi";

const BRANCH_OPTIONS = ["CSE", "IT", "ECE", "EE", "ME", "CE"];

const initialForm = {
  name: "",
  offerType: "Placement", 
  roles: "",
  cgpaCutoff: "",
  type: "On-campus",
  rounds: [],
  allowedBranches: [],
  noBacklogs: false,
};

export default function CompanyAdd() {
  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editId, setEditId] = useState(null);

  // Shortlist Manager State
  const [shortlistModal, setShortlistModal] = useState(null);
  const [shortlistTab, setShortlistTab] = useState("auto");
  const [autoFilter, setAutoFilter] = useState({ branch: "", minCgpa: "" });
  const [shortlistCandidates, setShortlistCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const fileInputRef = useRef(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [offerTypeFilter, setOfferTypeFilter] = useState("All");
  const [driveTypeFilter, setDriveTypeFilter] = useState("All");
  const [cgpaFilter, setCgpaFilter] = useState("All");

  // Load companies from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchJafs();
        setCompanies(data);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editId) {
        await updateJaf(editId, form);
        setCompanies(companies.map(c => c.id === editId ? { ...c, ...form } : c));
      } else {
        const result = await createJaf(form);
        setCompanies([{ id: result.id, ...form }, ...companies]);
      }

      setSaved(true);
      setForm(initialForm);
      setEditId(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save company:", err);
      alert("Failed to save company. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setForm({
      name: company.name,
      offerType: company.offerType,
      roles: company.roles,
      cgpaCutoff: company.cgpaCutoff,
      type: company.type,
      rounds: company.rounds || [],
      allowedBranches: company.allowedBranches || [],
      noBacklogs: company.noBacklogs || false,
    });
    setEditId(company.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      await deleteJaf(id);
      setCompanies(companies.filter(c => c.id !== id));
      if (editId === id) cancelEdit();
    } catch (err) {
      console.error("Failed to delete company:", err);
      alert("Failed to delete company.");
    }
  };

  // --- FILTERING LOGIC ---
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = 
        (c.name || "").toLowerCase().includes(search.toLowerCase()) || 
        (c.roles || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesOffer = offerTypeFilter === "All" || c.offerType === offerTypeFilter;
      const matchesDrive = driveTypeFilter === "All" || c.type === driveTypeFilter;
      
      let matchesCgpa = true;
      const reqCgpa = parseFloat(c.cgpaCutoff) || 0;
      if (cgpaFilter === "> 9.0") matchesCgpa = reqCgpa >= 9.0;
      else if (cgpaFilter === "> 8.5") matchesCgpa = reqCgpa >= 8.5;
      else if (cgpaFilter === "> 8.0") matchesCgpa = reqCgpa >= 8.0;
      else if (cgpaFilter === "< 8.0") matchesCgpa = reqCgpa < 8.0;

      return matchesSearch && matchesOffer && matchesDrive && matchesCgpa;
    });
  }, [companies, search, offerTypeFilter, driveTypeFilter, cgpaFilter]);

  const clearFilters = () => {
    setSearch("");
    setOfferTypeFilter("All");
    setDriveTypeFilter("All");
    setCgpaFilter("All");
  };

  // --- SHORTLIST MANAGER LOGIC ---
  const handleOpenShortlist = (company) => {
      setShortlistModal(company);
      setAutoFilter({ branch: "", minCgpa: company.cgpaCutoff || "" });
      setShortlistCandidates([]);
      setShortlistTab("auto");
  };

  const generateAutoShortlist = async () => {
      setIsLoadingCandidates(true);
      try {
          const students = await fetchFilteredStudents({ 
              branch: autoFilter.branch, 
              minCgpa: autoFilter.minCgpa 
          });
          setShortlistCandidates(students.map(s => ({ ...s, selected: true })));
      } catch (err) {
          console.error("Failed to fetch students", err);
          alert("Failed to generate shortlist.");
      } finally {
          setIsLoadingCandidates(false);
      }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        const parsed = rows.slice(1).filter(r => r.length > 1 && r[0].trim() !== '').map((row, i) => ({
            id: `csv-${i}`,
            name: row[0]?.trim() || "Unknown",
            email: row[1]?.trim() || "",
            branch: row[2]?.trim() || "N/A",
            cgpa: row[3]?.trim() || "N/A",
            selected: true
        }));
        setShortlistCandidates(parsed);
    };
    reader.readAsText(file);
  };

  const toggleCandidateSelection = (id) => {
      setShortlistCandidates(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const saveShortlist = () => {
      const selectedCount = shortlistCandidates.filter(c => c.selected).length;
      alert(`Successfully saved shortlist of ${selectedCount} candidates for ${shortlistModal.name}! Notifications will be sent shortly.`);
      setShortlistModal(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Companies</h1>
        <p className="text-slate-600 dark:text-slate-400">Add new companies, filter drives, and update placement details.</p>
      </div>

      {/* ADD / EDIT FORM */}
      <form 
        onSubmit={handleSubmit} 
        className={`rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 dark:bg-slate-900 ${
          editId 
            ? "border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400 dark:ring-amber-500/50" 
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        {editId && (
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider">
              Editing Company
            </span>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Company name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              placeholder="e.g. Amazon"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Offer Type</label>
            <select
              value={form.offerType}
              onChange={(e) => update("offerType", e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="Placement">Placement (FTE)</option>
              <option value="Internship">Internship</option>
              <option value="Intern + PPO">Intern + PPO</option>
            </select>
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Drive Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="On-campus">On-campus</option>
              <option value="Off-campus">Off-campus</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">CGPA cutoff</label>
            <input
              type="text"
              value={form.cgpaCutoff}
              onChange={(e) => update("cgpaCutoff", e.target.value)}
              placeholder="e.g. 7.5"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Roles (comma-separated)</label>
            <input
              type="text"
              value={form.roles}
              onChange={(e) => update("roles", e.target.value)}
              placeholder="SDE, ML, Data Analyst"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>

          {/* Eligibility Rules */}
          <div className="sm:col-span-2 lg:col-span-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3">Eligibility Rules</label>
              <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Allowed Branches (leave empty for all)</label>
                      <div className="flex flex-wrap gap-2">
                          {BRANCH_OPTIONS.map(br => (
                              <button
                                  key={br}
                                  type="button"
                                  onClick={() => {
                                      const current = form.allowedBranches || [];
                                      if (current.includes(br)) {
                                          update("allowedBranches", current.filter(b => b !== br));
                                      } else {
                                          update("allowedBranches", [...current, br]);
                                      }
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                      (form.allowedBranches || []).includes(br)
                                          ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700"
                                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
                                  }`}
                              >
                                  {br}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input
                              type="checkbox"
                              checked={form.noBacklogs || false}
                              onChange={e => update("noBacklogs", e.target.checked)}
                              className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">No Active Backlogs Required</span>
                  </div>
              </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Drive Schedule (Rounds)</label>
                  <button 
                      type="button" 
                      onClick={() => update("rounds", [...form.rounds, { name: "", date: "", venue: "" }])}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                      + Add Round
                  </button>
              </div>
              
              {form.rounds.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">No rounds scheduled yet. Click "+ Add Round" to begin.</p>
              ) : (
                  <div className="space-y-3">
                      {form.rounds.map((round, index) => (
                          <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                              <input 
                                  type="text" 
                                  placeholder="Round Name (e.g. Aptitude)" 
                                  value={round.name}
                                  onChange={(e) => {
                                      const newRounds = [...form.rounds];
                                      newRounds[index].name = e.target.value;
                                      update("rounds", newRounds);
                                  }}
                                  className="flex-1 min-w-[150px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                              />
                              <input 
                                  type="date" 
                                  value={round.date}
                                  onChange={(e) => {
                                      const newRounds = [...form.rounds];
                                      newRounds[index].date = e.target.value;
                                      update("rounds", newRounds);
                                  }}
                                  className="w-[140px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                              />
                              <input 
                                  type="text" 
                                  placeholder="Venue (e.g. Lab 1)" 
                                  value={round.venue}
                                  onChange={(e) => {
                                      const newRounds = [...form.rounds];
                                      newRounds[index].venue = e.target.value;
                                      update("rounds", newRounds);
                                  }}
                                  className="w-[140px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                              />
                              <button 
                                  type="button" 
                                  onClick={() => {
                                      const newRounds = form.rounds.filter((_, i) => i !== index);
                                      update("rounds", newRounds);
                                  }}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                  <X size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>
        
        <div className="mt-8 flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
          <button 
            type="submit"
            disabled={saving}
            className={`rounded-lg px-6 py-2.5 font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 ${
              editId 
                ? "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600" 
                : "bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-700"
            }`}
          >
            {saving ? "Saving..." : editId ? "Update company" : "Add company"}
          </button>
          
          {editId && (
            <button 
              type="button" 
              onClick={cancelEdit}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} /> Cancel
            </button>
          )}

          {saved && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in">
              {editId ? "Company updated!" : "Company added successfully!"}
            </span>
          )}
        </div>
      </form>

      {/* FILTER SECTION */}
      <div className="pt-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Available Companies</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Search</label>
            <input
              type="search"
              placeholder="Company or Role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Offer Type</label>
            <select 
              value={offerTypeFilter}
              onChange={(e) => setOfferTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="All">All Types</option>
              <option value="Placement">Placement (FTE)</option>
              <option value="Internship">Internship</option>
              <option value="Intern + PPO">Intern + PPO</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Drive Type</label>
            <select 
              value={driveTypeFilter}
              onChange={(e) => setDriveTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="All">All Drives</option>
              <option value="On-campus">On-campus</option>
              <option value="Off-campus">Off-campus</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">CGPA Cutoff</label>
            <select 
              value={cgpaFilter}
              onChange={(e) => setCgpaFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="All">All CGPA</option>
              <option value="> 9.0">&gt; 9.0</option>
              <option value="> 8.5">&gt; 8.5</option>
              <option value="> 8.0">&gt; 8.0</option>
              <option value="< 8.0">&lt; 8.0</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Offer Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Roles</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CGPA Cutoff</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Drive / Schedule</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Filter size={32} className="mb-3 opacity-20" />
                        <p>No companies found matching your filters.</p>
                        <button onClick={clearFilters} className="mt-2 text-indigo-500 hover:underline text-sm">Clear all filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr 
                      key={company.id} 
                      className={`transition-colors ${
                        editId === company.id 
                          ? "bg-amber-50/50 dark:bg-amber-900/10" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <Building2 size={14} />
                        </div>
                        {company.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          company.offerType === "Placement" ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20" :
                          company.offerType === "Internship" ? "text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20" :
                          "text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
                        }`}>
                          {company.offerType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                        {company.roles}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {company.cgpaCutoff ? `${company.cgpaCutoff}+` : "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                            {company.type}
                            </span>
                            {company.rounds && company.rounds.length > 0 && (
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                    {company.rounds.length} round(s) scheduled
                                </span>
                            )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenShortlist(company)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" 
                            title="Manage Shortlist"
                          >
                            <Users size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(company)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" 
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(company.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SHORTLIST SETTINGS MODAL */}
      {shortlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Manage Shortlist: {shortlistModal.name}
                        </h2>
                        <p className="text-sm text-slate-500">Generate or upload a shortlist for this drive to notify students.</p>
                    </div>
                    <button onClick={() => setShortlistModal(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Controls */}
                    <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-5 flex flex-col gap-6 overflow-y-auto">
                        
                        {/* Tabs */}
                        <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg">
                            <button 
                                onClick={() => setShortlistTab("auto")} 
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${shortlistTab === "auto" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                            >
                                Auto-Generate
                            </button>
                            <button 
                                onClick={() => setShortlistTab("csv")} 
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${shortlistTab === "csv" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                            >
                                CSV Upload
                            </button>
                        </div>

                        {shortlistTab === "auto" ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Branch Filter</label>
                                    <select 
                                        value={autoFilter.branch} 
                                        onChange={e => setAutoFilter({...autoFilter, branch: e.target.value})}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700"
                                    >
                                        <option value="">All Branches</option>
                                        <option value="CSE">CSE</option>
                                        <option value="IT">IT</option>
                                        <option value="ECE">ECE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Min CGPA</label>
                                    <input 
                                        type="number" step="0.1" 
                                        value={autoFilter.minCgpa} 
                                        onChange={e => setAutoFilter({...autoFilter, minCgpa: e.target.value})}
                                        placeholder="e.g. 8.0"
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700"
                                    />
                                </div>
                                <button 
                                    onClick={generateAutoShortlist}
                                    disabled={isLoadingCandidates}
                                    className="w-full flex justify-center items-center gap-2 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-md font-medium text-sm transition-colors"
                                >
                                    {isLoadingCandidates ? <Loader2 size={16} className="animate-spin" /> : <Filter size={16} />}
                                    Generate List
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Upload a CSV file with columns: Name, Email, Branch, CGPA.</p>
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden" 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex justify-center items-center gap-2 py-2 border border-dashed border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-md font-medium text-sm transition-colors"
                                >
                                    <Upload size={16} />
                                    Select CSV File
                                </button>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
                            <div className="mb-4 flex items-center justify-between text-sm">
                                <span className="text-slate-500">Selected</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {shortlistCandidates.filter(c => c.selected).length} / {shortlistCandidates.length}
                                </span>
                            </div>
                            <button 
                                onClick={saveShortlist}
                                disabled={shortlistCandidates.filter(c => c.selected).length === 0}
                                className="w-full flex justify-center items-center gap-2 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium text-sm transition-colors shadow-sm"
                            >
                                <Send size={16} />
                                Save & Notify Students
                            </button>
                        </div>
                    </div>

                    {/* Right Content: Candidate List */}
                    <div className="flex-1 bg-white dark:bg-slate-900 p-5 overflow-y-auto">
                        {shortlistCandidates.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Users size={48} className="mb-4 opacity-20" />
                                <p>No candidates generated yet.</p>
                                <p className="text-sm mt-1 text-slate-500">Use the filters on the left or upload a CSV.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-4 px-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</span>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Include</span>
                                </div>
                                {shortlistCandidates.map(c => (
                                    <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${c.selected ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/10' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30'}`}>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{c.name}</p>
                                            <p className="text-xs text-slate-500">{c.branch} • CGPA: {c.cgpa} {c.email && `• ${c.email}`}</p>
                                        </div>
                                        <button 
                                            onClick={() => toggleCandidateSelection(c.id)}
                                            className={`p-1.5 rounded transition-colors ${c.selected ? 'text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            {c.selected ? <CheckSquare size={20} /> : <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600"></div>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}