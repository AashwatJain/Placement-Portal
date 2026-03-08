import { useState, useEffect, useMemo } from "react";
import { fetchAllStudents } from "../../services/adminApi";
import { Search, X, FileText, ExternalLink, Code2, Award, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

// Custom priority ranking for branches
const BRANCH_PRIORITY = {
  "IT": 50,
  "CSE": 40,
  "ECE": 30,
  "EEE": 20,
  "MECH": 10
};

export default function RecruiterDashboard() {
  // --- Data State ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("All");
  const [year, setYear] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [minCgpa, setMinCgpa] = useState("");
  const [minCf, setMinCf] = useState("");

  // --- Universal Sorting State ---
  const [sortConfig, setSortConfig] = useState({ key: "cgpa", direction: "desc" });

  // --- Modal State ---
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch students from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllStudents();
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // --- Sorting Handler ---
  const handleSort = (key) => {
    let direction = "desc"; // Default to descending on first click
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  // --- Filtering & Sorting Logic ---
  const filteredAndSorted = useMemo(() => {
    let list = [...students];

    // 1. Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.branch.toLowerCase().includes(q)
      );
    }
    // 2. Branch
    if (branch !== "All") list = list.filter((s) => s.branch === branch);
    // 3. Year
    if (year !== "All") list = list.filter((s) => String(s.year) === year);
    // 4. Role
    if (roleFilter !== "All") {
      list = list.filter((s) => (s.role || "Placement") === roleFilter);
    }
    // 5. Min CGPA
    if (minCgpa) list = list.filter((s) => s.cgpa >= parseFloat(minCgpa));
    // 6. Min CF Rating
    if (minCf) list = list.filter((s) => (s.cfRating || 0) >= parseInt(minCf));

    // 7. Universal Sorting
    if (sortConfig.key) {
      list.sort((a, b) => {
        // --- CUSTOM BRANCH SORTING ---
        if (sortConfig.key === "branch") {
          const rankA = BRANCH_PRIORITY[a.branch?.toUpperCase()] || 0;
          const rankB = BRANCH_PRIORITY[b.branch?.toUpperCase()] || 0;
          return sortConfig.direction === "desc" ? rankB - rankA : rankA - rankB;
        }

        // --- STANDARD SORTING FOR EVERYTHING ELSE ---
        const aValue = a[sortConfig.key] ?? (sortConfig.key === 'cfRating' ? 0 : "");
        const bValue = b[sortConfig.key] ?? (sortConfig.key === 'cfRating' ? 0 : "");

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        } else {
          const strA = String(aValue).toLowerCase();
          const strB = String(bValue).toLowerCase();
          if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
          if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
      });
    }

    return list;
  }, [search, branch, year, roleFilter, minCgpa, minCf, sortConfig]);

  // UI Component for Column Headers
  const SortableHeader = ({ label, columnKey }) => (
    <th
      onClick={() => handleSort(columnKey)}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group select-none"
    >
      <div className="flex items-center gap-1.5">
        {label}
        {sortConfig.key === columnKey ? (
          sortConfig.direction === "asc" ? (
            <ArrowUp size={14} className="text-amber-500" />
          ) : (
            <ArrowDown size={14} className="text-amber-500" />
          )
        ) : (
          <ArrowUpDown size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Candidate Search</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400 transition-colors">
          Filter and scout students based on your hiring requirements. Click column headers to sort.
        </p>
      </div>

      {/* FILTERS GRID */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 transition-colors space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Search Candidates</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, branch, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role Type</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white transition-colors"
            >
              <option value="All">All Roles</option>
              <option value="Placement">Full-Time (Placement)</option>
              <option value="Intern">Internship</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white transition-colors"
            >
              <option value="All">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Batch Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white transition-colors"
            >
              <option value="All">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Min CGPA</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 8.5"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Min CF Rating</label>
            <input
              type="number"
              placeholder="e.g. 1400"
              value={minCf}
              onChange={(e) => setMinCf(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* RESULTS TABLE */}
      {!loading && (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50 transition-colors">
                <tr>
                  <SortableHeader label="Name" columnKey="name" />
                  <SortableHeader label="Branch" columnKey="branch" />
                  <SortableHeader label="Role" columnKey="role" />
                  <SortableHeader label="CGPA" columnKey="cgpa" />
                  <SortableHeader label="Coding Profile" columnKey="cfRating" />
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900 transition-colors">
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      <Search className="mx-auto mb-3 h-8 w-8 opacity-20" />
                      No candidates found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {s.branch} • {s.year}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${(s.role || "Placement") === "Placement"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                          }`}>
                          {s.role || "Placement"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                        {s.cgpa}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Code2 size={14} className="text-amber-500" />
                        {s.cfRating ? `${s.cfRating} Rating` : "Unrated"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 hover:underline transition-colors"
                        >
                          View profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT DETAILS MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xl font-bold text-indigo-700 dark:text-indigo-400">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {selectedStudent.branch} • Batch of {selectedStudent.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CGPA</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.cgpa}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{selectedStudent.status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Availability</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{selectedStudent.role || "Placement"}</p>
                </div>
              </div>

              {/* Coding Profiles */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Award size={16} className="text-amber-500" /> Coding Platforms
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                    <div className="flex items-center gap-3">
                      <img src="https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3521352-2944796.png" alt="Codeforces" className="h-6 w-6 dark:invert" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Codeforces</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectedStudent.cfRating ? `Rating: ${selectedStudent.cfRating}` : "Unrated"}
                        </p>
                      </div>
                    </div>
                    {selectedStudent.cfHandle && (
                      <a href={`https://codeforces.com/profile/${selectedStudent.cfHandle}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium flex items-center gap-1">
                        View <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                    <div className="flex items-center gap-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="h-6 w-6 dark:invert" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">LeetCode</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectedStudent.lcRating ? `Contest Rating: ${selectedStudent.lcRating}` : "Unrated"}
                        </p>
                      </div>
                    </div>
                    {selectedStudent.lcHandle && (
                      <a href={`https://leetcode.com/${selectedStudent.lcHandle}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium flex items-center gap-1">
                        View <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer / Resume Action */}
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all">
                <FileText size={18} />
                View & Download Resume
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}