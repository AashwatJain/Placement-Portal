import { useState, useMemo } from "react";
import { Building2, Edit, Trash2, X, Filter } from "lucide-react";

const initialForm = {
  name: "",
  offerType: "Placement", 
  roles: "",
  cgpaCutoff: "",
  type: "On-campus",
};

const initialCompanies = [
  { id: 1, name: "Google", offerType: "Placement", roles: "SDE", cgpaCutoff: "8.0", type: "On-campus" },
  { id: 2, name: "Microsoft", offerType: "Internship", roles: "Data Science", cgpaCutoff: "8.5", type: "On-campus" },
  { id: 3, name: "De Shaw", offerType: "Intern + PPO", roles: "QAE", cgpaCutoff: "8.0", type: "On-campus" },
];

export default function CompanyAdd() {
  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState(initialCompanies);
  const [saved, setSaved] = useState(false);
  const [editId, setEditId] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [offerTypeFilter, setOfferTypeFilter] = useState("All");
  const [driveTypeFilter, setDriveTypeFilter] = useState("All");
  const [cgpaFilter, setCgpaFilter] = useState("All");

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editId) {
      setCompanies(companies.map(company => 
        company.id === editId ? { ...company, ...form } : company
      ));
    } else {
      const newCompany = { id: Date.now(), ...form };
      setCompanies([...companies, newCompany]);
    }

    setSaved(true);
    setForm(initialForm);
    setEditId(null);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEdit = (company) => {
    setForm({
      name: company.name,
      offerType: company.offerType,
      roles: company.roles,
      cgpaCutoff: company.cgpaCutoff,
      type: company.type,
    });
    setEditId(company.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm(initialForm);
    setEditId(null);
  };

  const handleDelete = (id) => {
    setCompanies(companies.filter(company => company.id !== id));
    if (editId === id) cancelEdit();
  };

  // --- FILTERING LOGIC ---
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.roles.toLowerCase().includes(search.toLowerCase());
      
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
        </div>
        
        <div className="mt-8 flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
          <button 
            type="submit" 
            className={`rounded-lg px-6 py-2.5 font-bold text-white shadow-lg transition-all active:scale-95 ${
              editId 
                ? "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600" 
                : "bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-700"
            }`}
          >
            {editId ? "Update company" : "Add company"}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Drive</th>
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
                        <span className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                          {company.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
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

    </div>
  );
}