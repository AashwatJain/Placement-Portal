import { useState, useMemo } from "react";
import { MOCK_STUDENTS } from "../../data/mockData";
import { ArrowUpDown, X, FileText, Code2, Filter } from "lucide-react";

// Custom weights for specific columns
const BRANCH_WEIGHTS = {
  CSE: 4,
  IT: 4,
  ECE: 3,
  MECH: 2,
};

const STATUS_WEIGHTS = {
  Placed: 5,
  Shortlisted: 4,
  Interviewing: 3,
  Applied: 2,
  Eligible: 1,
};

const getStatusStyles = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "placed") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "shortlisted") return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
  if (s === "interviewing") return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
  if (s.includes("appli")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "eligible") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
};

// Helper to color-code Codeforces ratings
const getRatingColor = (rating) => {
  if (!rating) return "text-slate-500 dark:text-slate-400"; // Unrated
  if (rating >= 2400) return "text-red-500 font-bold"; // Grandmaster
  if (rating >= 2100) return "text-orange-500 font-bold"; // Master
  if (rating >= 1900) return "text-purple-500 font-bold"; // Candidate Master
  if (rating >= 1600) return "text-blue-500 font-semibold"; // Expert
  if (rating >= 1400) return "text-cyan-500 font-semibold"; // Specialist
  if (rating >= 1200) return "text-green-500 font-medium"; // Pupil
  return "text-slate-500 font-medium"; // Newbie
};

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
  // Advanced Filter States
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [minCgpa, setMinCgpa] = useState("");
  const [minRating, setMinRating] = useState("");
  
  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Handle Filtering (Search + Advanced Filters)
  const filtered = useMemo(() => {
    return MOCK_STUDENTS.filter((s) => {
      // 1. Search Match
      const matchesSearch = 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.branch.toLowerCase().includes(search.toLowerCase());
      
      // 2. Status Match
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;

      // 3. Branch Match
      const matchesBranch = branchFilter === "All" || s.branch.toUpperCase() === branchFilter.toUpperCase();

      // 4. Year Match
      const matchesYear = yearFilter === "All" || String(s.year) === String(yearFilter);
      
      // 5. Custom Min CGPA Match
      const cgpaThreshold = parseFloat(minCgpa);
      const matchesCGPA = isNaN(cgpaThreshold) || s.cgpa >= cgpaThreshold;

      // 6. Custom Min CF Rating Match
      const ratingThreshold = parseInt(minRating);
      const matchesRating = isNaN(ratingThreshold) || (s.codeforcesRating && s.codeforcesRating >= ratingThreshold);

      return matchesSearch && matchesStatus && matchesBranch && matchesYear && matchesCGPA && matchesRating;
    });
  }, [search, statusFilter, branchFilter, yearFilter, minCgpa, minRating]);

  // Handle Custom Sorting
  const sortedStudents = useMemo(() => {
    let sortableItems = [...filtered];
    
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === "codeforcesRating") {
          let ratingA = valA || 0;
          let ratingB = valB || 0;
          if (ratingA < ratingB) return sortConfig.direction === "asc" ? -1 : 1;
          if (ratingA > ratingB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }

        if (sortConfig.key === "branch") {
          let weightA = BRANCH_WEIGHTS[valA?.toUpperCase()] || 0;
          let weightB = BRANCH_WEIGHTS[valB?.toUpperCase()] || 0;
          
          if (weightA < weightB) return sortConfig.direction === "asc" ? -1 : 1;
          if (weightA > weightB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
        
        if (sortConfig.key === "status") {
          let weightA = STATUS_WEIGHTS[valA] || STATUS_WEIGHTS[valA?.charAt(0).toUpperCase() + valA?.slice(1).toLowerCase()] || 0;
          let weightB = STATUS_WEIGHTS[valB] || STATUS_WEIGHTS[valB?.charAt(0).toUpperCase() + valB?.slice(1).toLowerCase()] || 0;

          if (weightA < weightB) return sortConfig.direction === "asc" ? -1 : 1;
          if (weightA > weightB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filtered, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setBranchFilter("All");
    setYearFilter("All");
    setMinCgpa("");
    setMinRating("");
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Management</h1>
        <p className="text-slate-600 dark:text-slate-400">View and manage student accounts, filters, and resumes.</p>
      </div>

      {/* --- ADVANCED FILTER CONTROLS --- */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        
        {/* Top Row: Search, Status, Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Search</label>
            <input
              type="search"
              placeholder="Search by name or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Eligible">Eligible (Unplaced)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Branch</label>
            <select 
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="All">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="ELECTRICAL">ELECTRICAL</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Year, Custom CGPA, Custom CF Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Batch Year</label>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            >
              <option value="All">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 8.5"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Min CF Rating</label>
            <input
              type="number"
              step="100"
              min="0"
              max="4000"
              placeholder="e.g. 1400"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>
        </div>

      </div>

      {/* --- TABLE --- */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {/* ADDED 'year' to the columns array */}
                {["name", "branch", "year", "cgpa", "codeforcesRating", "status"].map((col) => (
                  <th
                    key={col}
                    onClick={() => requestSort(col)}
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2">
                      {col === "codeforcesRating" ? "Coding Profile" : col}
                      <ArrowUpDown size={12} className={`transition-opacity ${sortConfig.key === col ? 'opacity-100 text-indigo-500' : 'opacity-50'}`} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {sortedStudents.map((s) => (
                <tr 
                  key={s.id} 
                  onClick={() => handleRowClick(s)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    {s.name}
                    <FileText size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Click row to view resume" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {s.branch}
                  </td>
                  {/* SEPARATED YEAR COLUMN */}
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {s.year}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {s.cgpa}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {/* CODING PROFILE LINK */}
                    {s.codeforcesHandle ? (
                      <a 
                        href={`https://codeforces.com/profile/${s.codeforcesHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        className="inline-flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 -ml-1 rounded transition-colors group/link"
                        title={`View ${s.codeforcesHandle} on Codeforces`}
                      >
                        <Code2 size={14} className="text-indigo-500 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400" />
                        <span className={`${getRatingColor(s.codeforcesRating)} group-hover/link:underline`}>
                          {s.codeforcesRating ? s.codeforcesRating : "Unrated"}
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-1.5 p-1 -ml-1">
                        <Code2 size={14} className="text-slate-400" />
                        <span className="text-slate-500 dark:text-slate-400">Unrated</span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        alert(`Edit modal for ${s.name} coming soon!`);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedStudents.length === 0 && (
            <div className="p-10 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <Filter size={32} className="mb-3 opacity-20" />
              <p>No students found matching your filters.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-2 text-indigo-500 hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- QUICK RESUME PREVIEW MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedStudent.name}'s Resume
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${getStatusStyles(selectedStudent.status)}`}>
                    {selectedStudent.status}
                  </span>
                </h2>
                <p className="text-sm text-slate-500">{selectedStudent.branch} • Year: {selectedStudent.year} • CGPA: {selectedStudent.cgpa} • CF Rating: {selectedStudent.codeforcesRating || "N/A"}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Resume Viewer) */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 relative">
              {selectedStudent.resumeUrl ? (
                <iframe 
                  src={selectedStudent.resumeUrl} 
                  className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white"
                  title={`${selectedStudent.name} Resume`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p>No resume uploaded for this student yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}