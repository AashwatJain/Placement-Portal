import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchAllStudents, updateStudentStatus, updateStudentResume, updateStudentApplication } from "../../services/adminApi";
import { ArrowUpDown, X, FileText, Filter, Loader2, CheckCircle, AlertCircle, Save, CheckSquare, Square, Download, Bell, RefreshCw, Briefcase, ChevronDown, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";

// Custom weights for specific columns
const BRANCH_WEIGHTS = {
  CS: 8,
  IT: 7,
  AIML: 6,
  AIDS: 5,
  MNC: 4,
  ECE: 3,
  Robotics: 2,
  IIOT: 1,
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
  if (s.includes("appli")) return "bg-brand-amber-500/20 text-brand-amber-700 dark:bg-blue-900/30 dark:text-brand-amber-500";
  if (s === "eligible") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  if (s === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  if (s === "offered") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  return "bg-brand-beige-100 text-brand-brown-700 dark:bg-[#2A1810] dark:text-brand-beige-400";
};



export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Advanced Filter States
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [minCgpa, setMinCgpa] = useState("");


  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalTab, setModalTab] = useState("applications"); // "applications" | "resume"
  const [expandedApp, setExpandedApp] = useState(null); // oppId of expanded app
  const [updatingStep, setUpdatingStep] = useState(null); // "oppId-stepIndex"

  // Status Modal State
  const [statusModal, setStatusModal] = useState(null); // { student, newStatus: 'Placed' }
  const [placedCompany, setPlacedCompany] = useState("");
  const [placedOfferUrl, setPlacedOfferUrl] = useState("");

  // Resume Review State
  const [resumeReview, setResumeReview] = useState({ isVerified: false, comment: "" });
  const [isUpdatingResume, setIsUpdatingResume] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
      if (selectedStudent) {
          setResumeReview({
              isVerified: selectedStudent.isResumeVerified || false,
              comment: selectedStudent.adminResumeComment || ""
          });
      }
  }, [selectedStudent]);

  const handleStatusChange = async (student, newStatus) => {
    if (newStatus === "Placed") {
        setStatusModal({ student, newStatus });
        setPlacedCompany(student.companyName || "");
        setPlacedOfferUrl(student.offerLetterUrl || "");
        return;
    }
    
    // Direct update for Unplaced / Opted-out
    try {
        await updateStudentStatus(student.id, { status: newStatus });
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: newStatus, companyName: null, offerLetterUrl: null } : s));
    } catch (err) {
        console.error("Failed to update status", err);
        alert("Failed to update status");
    }
  };

  const handleSavePlacedStatus = async () => {
      if (!statusModal) return;
      try {
          await updateStudentStatus(statusModal.student.id, { 
              status: "Placed", 
              companyName: placedCompany, 
              offerLetterUrl: placedOfferUrl 
          });
          setStudents(prev => prev.map(s => s.id === statusModal.student.id ? { 
              ...s, 
              status: "Placed", 
              companyName: placedCompany, 
              offerLetterUrl: placedOfferUrl 
          } : s));
          setStatusModal(null);
      } catch (err) {
          console.error("Failed to update status", err);
          alert("Failed to update status");
      }
  };

  const handleSaveResumeReview = async () => {
      if (!selectedStudent) return;
      setIsUpdatingResume(true);
      try {
          await updateStudentResume(selectedStudent.id, {
              isResumeVerified: resumeReview.isVerified,
              adminResumeComment: resumeReview.comment
          });
          setStudents(prev => prev.map(s => s.id === selectedStudent.id ? {
              ...s,
              isResumeVerified: resumeReview.isVerified,
              adminResumeComment: resumeReview.comment
          } : s));
          setSelectedStudent(prev => ({ ...prev, isResumeVerified: resumeReview.isVerified, adminResumeComment: resumeReview.comment }));
          alert("Resume review saved successfully.");
      } catch (err) {
          console.error("Failed to save resume review", err);
          alert("Failed to save resume review.");
      } finally {
          setIsUpdatingResume(false);
      }
  };

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

  // Handle Filtering (Search + Advanced Filters)
  const filtered = useMemo(() => {
    return students.filter((s) => {
      // 1. Search Match
      const matchesSearch =
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.branch || "").toLowerCase().includes(search.toLowerCase());

      // 2. Status Match
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;

      // 3. Branch Match
      const matchesBranch = branchFilter === "All" || (s.branch || "").toUpperCase() === branchFilter.toUpperCase();

      // 4. Year Match
      const matchesYear = yearFilter === "All" || String(s.year) === String(yearFilter);

      // 5. Custom Min CGPA Match
      const cgpaThreshold = parseFloat(minCgpa);
      const matchesCGPA = isNaN(cgpaThreshold) || s.cgpa >= cgpaThreshold;



      return matchesSearch && matchesStatus && matchesBranch && matchesYear && matchesCGPA;
    });
  }, [students, search, statusFilter, branchFilter, yearFilter, minCgpa]);

  // Handle Custom Sorting
  const sortedStudents = useMemo(() => {
    let sortableItems = [...filtered];

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];


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
    setModalTab("applications");
    setExpandedApp(null);
  };

  // --- Application Timeline Step Toggle ---
  const handleToggleStep = async (oppId, stepIndex, currentDone, timeline) => {
    if (!selectedStudent) return;
    const newDone = !currentDone;
    const today = new Date().toISOString().slice(0, 10);
    setUpdatingStep(`${oppId}-${stepIndex}`);
    try {
      const result = await updateStudentApplication(selectedStudent.id, oppId, {
        stepIndex,
        done: newDone,
        date: newDone ? today : null,
        newStatus: newDone ? timeline[stepIndex]?.step : undefined,
      });
      // Update local state
      setStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        const apps = { ...s.applications };
        if (apps[oppId]) {
          apps[oppId] = { ...apps[oppId], timeline: result.timeline, status: result.status };
        }
        return { ...s, applications: apps };
      }));
      setSelectedStudent(prev => {
        const apps = { ...prev.applications };
        if (apps[oppId]) {
          apps[oppId] = { ...apps[oppId], timeline: result.timeline, status: result.status };
        }
        return { ...prev, applications: apps };
      });
    } catch (err) {
      console.error("Failed to update step", err);
      alert("Failed to update application step.");
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleRejectApplication = async (oppId) => {
    if (!selectedStudent) return;
    const currentApp = selectedStudent.applications?.[oppId];
    const isRejected = currentApp?.status === "Rejected";
    const targetStatus = isRejected ? "Applied" : "Rejected";

    if (!isRejected && !confirm(`Are you sure you want to reject this application?`)) return;
    setUpdatingStep(`${oppId}-reject`);
    try {
      await updateStudentApplication(selectedStudent.id, oppId, {
        newStatus: targetStatus,
      });
      setStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        const apps = { ...s.applications };
        if (apps[oppId]) apps[oppId] = { ...apps[oppId], status: targetStatus };
        return { ...s, applications: apps };
      }));
      setSelectedStudent(prev => {
        const apps = { ...prev.applications };
        if (apps[oppId]) apps[oppId] = { ...apps[oppId], status: targetStatus };
        return { ...prev, applications: apps };
      });
    } catch (err) {
      console.error("Failed to update application", err);
      alert("Failed to update application.");
    } finally {
      setUpdatingStep(null);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setBranchFilter("All");
    setYearFilter("All");
    setMinCgpa("");
  };

  // --- Bulk-Action Handlers ---
  const toggleSelectStudent = useCallback((id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedStudents.map(s => s.id)));
    }
  }, [sortedStudents, selectedIds.size]);

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    setIsBulkUpdating(true);
    try {
      const promises = [...selectedIds].map(id => updateStudentStatus(id, { status: bulkStatus }));
      await Promise.all(promises);
      setStudents(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, status: bulkStatus } : s));
      setSelectedIds(new Set());
      setBulkStatus("");
    } catch (err) {
      console.error("Bulk update failed", err);
      alert("Some updates failed. Please try again.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const selected = students.filter(s => selectedIds.has(s.id));
    const header = "Name,Email,Branch,Year,CGPA,Status,Company";
    const rows = selected.map(s => `"${s.name}","${s.email || ""}","${s.branch}",${s.year || ""},${s.cgpa || ""},"${s.status || ""}","${s.companyName || ""}"`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white">Student Management</h1>
        <p className="text-brand-brown-600 dark:text-brand-beige-400">View and manage student accounts, filters, and resumes.</p>
      </div>

      {/* --- ADVANCED FILTER CONTROLS --- */}
      <div className="bg-white dark:bg-[#1A0F08] p-5 rounded-xl border border-brand-beige-200 dark:border-[#5A3D2B] shadow-sm space-y-4">

        {/* Top Row: Search, Status, Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-brand-cream-500 mb-1.5 uppercase">Search</label>
            <input
              type="search"
              placeholder="Search by name or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-cream-500 mb-1.5 uppercase">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Placed">Placed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Eligible">Eligible (Unplaced)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-cream-500 mb-1.5 uppercase">Branch</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white transition-colors"
            >
              <option value="All">All Branches</option>
              <option value="CS">CS</option>
              <option value="IT">IT</option>
              <option value="AIML">AIML</option>
              <option value="AIDS">AIDS</option>
              <option value="MNC">MNC</option>
              <option value="ECE">ECE</option>
              <option value="Robotics">Robotics</option>
              <option value="IIOT">IIOT</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Year, Custom CGPA, Custom CF Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-cream-500 mb-1.5 uppercase">Batch Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white transition-colors"
            >
              <option value="All">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-cream-500 mb-1.5 uppercase">Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 8.5"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white transition-colors"
            />
          </div>

        </div>

      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-amber-500/100" />
        </div>
      )}

      {/* --- TABLE --- */}
      {!loading && (
        <div className="overflow-hidden rounded-xl border border-brand-beige-200 dark:border-[#5A3D2B] bg-white dark:bg-[#1A0F08] shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-beige-200 dark:divide-brand-brown-700">
              <thead className="bg-brand-cream-50 dark:bg-[#2A1810]/50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-brand-brown-400 hover:text-brand-amber-500 dark:hover:text-brand-amber-500 transition-colors">
                      {selectedIds.size > 0 && selectedIds.size === sortedStudents.length ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </th>
                  {["name", "branch", "year", "cgpa", "status"].map((col) => (
                    <th
                      key={col}
                      onClick={() => requestSort(col)}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-cream-500 dark:text-brand-beige-400 hover:text-brand-brown-700 dark:hover:text-brand-beige-300 transition-colors select-none"
                    >
                      <div className="flex items-center gap-2">
                        {col}
                        <ArrowUpDown size={12} className={`transition-opacity ${sortConfig.key === col ? 'opacity-100 text-brand-amber-500/100' : 'opacity-50'}`} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige-200 dark:divide-brand-brown-700 bg-white dark:bg-[#1A0F08]">
                {sortedStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => handleRowClick(s)}
                    className={`hover:bg-brand-cream-50 dark:hover:bg-brand-brown-800/50 transition-colors cursor-pointer group ${selectedIds.has(s.id) ? 'bg-brand-amber-500/10/50 dark:bg-brand-amber-800/10' : ''}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 w-10">
                      <button onClick={(e) => toggleSelectStudent(s.id, e)} className="text-brand-brown-400 hover:text-brand-amber-500 dark:hover:text-brand-amber-500 transition-colors">
                        {selectedIds.has(s.id) ? <CheckSquare size={18} className="text-brand-amber-500 dark:text-brand-amber-500" /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-brown-900 dark:text-white flex items-center gap-2">
                      {s.name}
                      <FileText size={14} className="text-brand-brown-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Click row to view resume" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-brown-600 dark:text-brand-beige-400">
                      {s.branch}
                    </td>
                    {/* SEPARATED YEAR COLUMN */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-brown-600 dark:text-brand-beige-400">
                      {s.year}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-brown-600 dark:text-brand-beige-400">
                      {s.cgpa}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="flex flex-col items-start gap-1">
                        <select
                          value={s.status || "Unplaced"}
                          onChange={(e) => { e.stopPropagation(); handleStatusChange(s, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs font-medium bg-brand-cream-50 border border-brand-beige-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-amber-500/100 dark:bg-[#2A1810] dark:border-[#5A3D2B] dark:text-brand-beige-300`}
                        >
                            <option value="Unplaced">Unplaced</option>
                            <option value="Eligible">Eligible</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Placed">Placed</option>
                            <option value="Opted-out">Opted-out</option>
                        </select>
                        {s.status === "Placed" && s.companyName && (
                            <span className="text-[10px] text-brand-cream-500 dark:text-brand-beige-400 max-w-[120px] truncate" title={s.companyName}>
                                @ {s.companyName}
                            </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedStudents.length === 0 && (
              <div className="p-10 flex flex-col items-center justify-center text-brand-cream-500 dark:text-brand-beige-400">
                <Filter size={32} className="mb-3 opacity-20" />
                <p>No students found matching your filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-2 text-brand-amber-500/100 hover:underline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- BULK ACTION TOOLBAR (floating) --- */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-brand-brown-900 dark:bg-white text-white dark:text-brand-brown-900 rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <span className="text-sm font-semibold">
                {selectedIds.size} student{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="h-5 w-px bg-brand-brown-600 dark:bg-brand-beige-300"></div>

            {/* Bulk Status Change */}
            <div className="flex items-center gap-2">
                <select
                    value={bulkStatus}
                    onChange={e => setBulkStatus(e.target.value)}
                    className="bg-brand-brown-800 dark:bg-brand-beige-100 border border-brand-brown-600 dark:border-brand-beige-300 rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-amber-500/100"
                >
                    <option value="">Set Status...</option>
                    <option value="Eligible">Eligible</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Placed">Placed</option>
                    <option value="Opted-out">Opted-out</option>
                </select>
                <button
                    onClick={handleBulkStatusChange}
                    disabled={!bulkStatus || isBulkUpdating}
                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-amber-500 text-white hover:bg-brand-amber-600 disabled:opacity-40 rounded-md text-xs font-semibold transition-colors"
                >
                    {isBulkUpdating ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    Apply
                </button>
            </div>

            <div className="h-5 w-px bg-brand-brown-600 dark:bg-brand-beige-300"></div>

            {/* Export */}
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-xs font-semibold transition-colors"
            >
                <Download size={13} /> Export CSV
            </button>

            {/* Deselect */}
            <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1.5 rounded-full hover:bg-brand-brown-700 dark:hover:bg-brand-beige-200 transition-colors ml-2"
                title="Clear selection"
            >
                <X size={16} />
            </button>
        </div>
      )}

      {/* --- STATUS UPDATE MODAL --- */}
      {statusModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-brown-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1A0F08] border border-brand-beige-200 dark:border-[#5A3D2B] rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-brand-brown-900 dark:text-white mb-4">Mark as Placed</h3>
                <p className="text-sm text-brand-cream-500 dark:text-brand-beige-400 mb-4">You are marking <strong>{statusModal.student.name}</strong> as Placed. Please provide the details below.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-brand-cream-500 mb-1.5 uppercase">Company Name</label>
                        <input type="text" value={placedCompany} onChange={e => setPlacedCompany(e.target.value)} className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white" placeholder="e.g. Google" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-brand-cream-500 mb-1.5 uppercase">Offer Letter Link (Optional)</label>
                        <input type="url" value={placedOfferUrl} onChange={e => setPlacedOfferUrl(e.target.value)} className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white" placeholder="https://..." />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm font-medium text-brand-brown-700 dark:text-brand-beige-300 hover:bg-brand-beige-100 dark:hover:bg-brand-brown-800 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSavePlacedStatus} className="px-4 py-2 text-sm font-medium text-white bg-brand-amber-500 hover:bg-brand-amber-600 rounded-lg transition-colors">Save Details</button>
                </div>
            </div>
        </div>
      )}

      {/* --- STUDENT DETAIL MODAL (TABBED) --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-brown-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A0F08] border border-brand-beige-200 dark:border-[#5A3D2B] rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-beige-100 dark:border-[#3E2315] bg-brand-cream-50 dark:bg-[#2A1810]/50">
              <div>
                <h2 className="text-lg font-bold text-brand-brown-900 dark:text-white flex items-center gap-2">
                  {selectedStudent.name}
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${getStatusStyles(selectedStudent.status)}`}>
                    {selectedStudent.status}
                  </span>
                </h2>
                <p className="text-sm text-brand-cream-500">{selectedStudent.branch} • Year: {selectedStudent.year} • CGPA: {selectedStudent.cgpa}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-brand-brown-400 hover:text-brand-brown-700 hover:bg-brand-beige-200 dark:hover:text-white dark:hover:bg-brand-brown-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-brand-beige-200 dark:border-[#5A3D2B] bg-white dark:bg-[#1A0F08]">
              <button
                onClick={() => setModalTab("applications")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  modalTab === "applications"
                    ? "border-brand-amber-500/100 text-brand-amber-500 dark:text-brand-amber-500"
                    : "border-transparent text-brand-cream-500 hover:text-brand-brown-700 dark:text-brand-beige-400 dark:hover:text-brand-beige-300"
                }`}
              >
                <Briefcase size={16} /> Applications
                {selectedStudent.applications && (
                  <span className="ml-1 text-[10px] bg-brand-amber-500/20 text-brand-amber-600 dark:bg-brand-amber-800/30 dark:text-brand-amber-500 px-1.5 py-0.5 rounded-full font-bold">
                    {Object.keys(selectedStudent.applications).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setModalTab("resume")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  modalTab === "resume"
                    ? "border-brand-amber-500/100 text-brand-amber-500 dark:text-brand-amber-500"
                    : "border-transparent text-brand-cream-500 hover:text-brand-brown-700 dark:text-brand-beige-400 dark:hover:text-brand-beige-300"
                }`}
              >
                <FileText size={16} /> Resume
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">

              {/* ═══ APPLICATIONS TAB ═══ */}
              {modalTab === "applications" && (
                <div className="p-6 space-y-3">
                  {!selectedStudent.applications || Object.keys(selectedStudent.applications).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-brand-brown-400 dark:text-brand-beige-500">
                      <Briefcase size={40} className="mb-3 opacity-20" />
                      <p className="font-medium">No applications yet.</p>
                      <p className="text-sm mt-1">This student hasn't applied to any companies.</p>
                    </div>
                  ) : (
                    Object.entries(selectedStudent.applications).map(([oppId, app]) => {
                      const isExpanded = expandedApp === oppId;
                      const timeline = app.timeline || [];
                      const doneCount = timeline.filter(s => s.done).length;
                      const progress = timeline.length ? Math.round((doneCount / timeline.length) * 100) : 0;

                      return (
                        <div key={oppId} className="rounded-xl border border-brand-beige-200 dark:border-[#5A3D2B] overflow-hidden transition-all">
                          {/* Company Row */}
                          <button
                            onClick={() => setExpandedApp(isExpanded ? null : oppId)}
                            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-brand-cream-50 dark:hover:bg-brand-brown-800/50 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-amber-500/100 to-violet-600 text-sm font-bold text-white shadow">
                              {(app.company || "?").charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-brand-brown-900 dark:text-white">{app.company}</p>
                              <p className="text-xs text-brand-cream-500 dark:text-brand-beige-400">{app.role} • {app.offerType || "Placement"} • Applied: {app.appliedOn || "—"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                                {app.status}
                              </span>
                              <div className="hidden sm:flex items-center gap-1.5">
                                <div className="h-1.5 w-16 rounded-full bg-brand-beige-200 dark:bg-brand-brown-700 overflow-hidden">
                                  <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-amber-500/100 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-brand-brown-400">{progress}%</span>
                              </div>
                              {isExpanded ? <ChevronDown size={16} className="text-brand-brown-400" /> : <ChevronRight size={16} className="text-brand-brown-400" />}
                            </div>
                          </button>

                          {/* Expanded Timeline */}
                          {isExpanded && (
                            <div className="border-t border-brand-beige-200 dark:border-[#5A3D2B] bg-brand-cream-50/50 dark:bg-[#2A1810]/30 px-5 py-5">
                              {app.status === "Rejected" && (
                                <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                                  <X size={14} /> This application has been rejected
                                </div>
                              )}
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-brown-400 mb-4">Selection Timeline</h4>
                              <div className={`relative ml-1 space-y-0 ${app.status === "Rejected" ? "opacity-40 pointer-events-none" : ""}`}>
                                {timeline.map((step, idx) => {
                                  const isLast = idx === timeline.length - 1;
                                  const isLoading = updatingStep === `${oppId}-${idx}`;
                                  return (
                                    <div key={idx} className="relative flex items-start gap-4 pb-5">
                                      {/* Connecting line */}
                                      {!isLast && (
                                        <div className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-10px)] transition-colors ${
                                          step.done ? "bg-green-400 dark:bg-green-600" : "bg-brand-beige-200 dark:bg-brand-brown-700"
                                        }`} />
                                      )}
                                      {/* Step dot / checkbox */}
                                      <button
                                        onClick={() => handleToggleStep(oppId, idx, step.done, timeline)}
                                        disabled={isLoading}
                                        className={`relative z-10 shrink-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                                          step.done
                                            ? "border-green-500 bg-green-500 text-white shadow-md shadow-green-500/20"
                                            : "border-brand-beige-300 bg-white text-brand-brown-400 dark:border-[#7A543A] dark:bg-[#2A1810] dark:text-brand-beige-500 hover:border-brand-amber-500 hover:text-brand-amber-500/100"
                                        }`}
                                        title={step.done ? "Mark as not done" : "Mark as done"}
                                      >
                                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : step.done ? <CheckCircle size={14} /> : <Clock size={14} />}
                                      </button>
                                      {/* Step info */}
                                      <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className={`text-sm font-bold ${step.done ? "text-brand-brown-900 dark:text-white" : "text-brand-brown-400 dark:text-brand-beige-500"}`}>{step.step}</p>
                                          {step.done && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">✓ Done</span>}
                                        </div>
                                        {step.date && (
                                          <p className="text-xs text-brand-cream-500 mt-0.5 flex items-center gap-1">
                                            <CalendarIcon size={10} /> {step.date}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-brand-beige-200 dark:border-[#5A3D2B]">
                                <button
                                  onClick={() => handleRejectApplication(oppId)}
                                  disabled={updatingStep === `${oppId}-reject`}
                                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                                    app.status === "Rejected"
                                      ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                      : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                                  }`}
                                >
                                  {updatingStep === `${oppId}-reject` ? <Loader2 size={13} className="animate-spin" /> : app.status === "Rejected" ? <RefreshCw size={13} /> : <X size={13} />}
                                  {app.status === "Rejected" ? "Undo Reject" : "Reject Application"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ═══ RESUME TAB ═══ */}
              {modalTab === "resume" && (
                <div className="flex-1 flex h-full" style={{ minHeight: "calc(85vh - 130px)" }}>
                  {/* Resume Preview */}
                  <div className="flex-1 bg-brand-beige-100 dark:bg-[#1A0F08] p-4 relative overflow-hidden">
                    {selectedStudent.resumeUrl ? (
                      <iframe
                        src={selectedStudent.resumeUrl}
                        className="w-full h-full rounded-lg border border-brand-beige-300 dark:border-[#5A3D2B] bg-white"
                        style={{ minHeight: "500px" }}
                        title={`${selectedStudent.name} Resume`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-brand-brown-400 dark:text-brand-beige-500">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>No resume uploaded for this student yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Admin Review Sidebar */}
                  <div className="w-80 border-l border-brand-beige-200 dark:border-[#5A3D2B] bg-white dark:bg-[#1A0F08] p-5 flex flex-col items-stretch overflow-y-auto">
                    <h3 className="text-sm font-bold text-brand-brown-900 dark:text-white mb-4 uppercase tracking-wider">Admin Review</h3>
                    
                    <div className="mb-6 bg-brand-cream-50 dark:bg-[#2A1810] p-4 rounded-xl border border-brand-beige-200 dark:border-[#5A3D2B]">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={resumeReview.isVerified}
                          onChange={(e) => setResumeReview(prev => ({...prev, isVerified: e.target.checked}))}
                          className="mt-1 w-4 h-4 text-brand-amber-500 border-brand-beige-300 rounded focus:ring-brand-amber-500/100 dark:focus:ring-brand-amber-500 dark:border-[#7A543A]"
                        />
                        <div>
                          <span className={`text-sm font-medium flex items-center gap-1.5 ${resumeReview.isVerified ? 'text-green-600 dark:text-green-400' : 'text-brand-brown-700 dark:text-brand-beige-300'}`}>
                            {resumeReview.isVerified ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {resumeReview.isVerified ? "Resume Verified" : "Needs Revision"}
                          </span>
                          <p className="text-xs text-brand-cream-500 dark:text-brand-beige-400 mt-1">Check this to approve the resume for recruiter view.</p>
                        </div>
                      </label>
                    </div>

                    <div className="mb-6 flex-1 flex flex-col">
                      <label className="block text-xs font-semibold text-brand-cream-500 dark:text-brand-beige-400 mb-2 uppercase">Review Comments</label>
                      <textarea 
                        value={resumeReview.comment}
                        onChange={(e) => setResumeReview(prev => ({...prev, comment: e.target.value}))}
                        placeholder="Add comments or revision notes for the student..."
                        className="w-full flex-1 min-h-[120px] rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white resize-none"
                      ></textarea>
                    </div>

                    <button 
                      onClick={handleSaveResumeReview}
                      disabled={isUpdatingResume}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-amber-500 hover:bg-brand-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {isUpdatingResume ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Review
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}