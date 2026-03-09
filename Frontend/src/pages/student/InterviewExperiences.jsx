import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchExperiences, submitExperience, toggleExperienceLike } from "../../services/studentApi";
import { useCompanies } from "../../hooks/useCompanies";
import {
  PenTool,
  Search,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Send,
  User,
  Briefcase,
  ChevronUp,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  ArrowUpDown
} from "lucide-react";

const DIFFICULTY_OPTIONS = ["All", "Easy", "Medium", "Hard"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "most_liked", label: "Most Liked" },
  { value: "difficulty_asc", label: "Difficulty ↑" },
  { value: "difficulty_desc", label: "Difficulty ↓" },
];
const DIFFICULTY_ORDER = { Easy: 1, Medium: 2, Hard: 3 };

export default function InterviewExperiences() {
  const { user, token } = useAuth();
  const { companies } = useCompanies();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Selected",
    difficulty: "Medium",
    experience: ""
  });

  const [problems, setProblems] = useState([
    { link: "", description: "" }
  ]);

  // Fetch experiences from backend on mount
  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await fetchExperiences();
      setExperiences(data);
    } catch (err) {
      console.error("Failed to fetch experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = () => {
    setProblems([...problems, { link: "", description: "" }]);
  };

  const handleRemoveProblem = (index) => {
    const updatedProblems = [...problems];
    updatedProblems.splice(index, 1);
    setProblems(updatedProblems);
  };

  const handleProblemChange = (index, field, value) => {
    const updatedProblems = [...problems];
    updatedProblems[index][field] = value;
    setProblems(updatedProblems);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitExperience({
        ...formData,
        problems: problems.filter(p => p.link || p.description),
        author: user?.name || user?.email || "Anonymous Student",
        authorId: user?.uid || "unknown",
      }, token);
      setFormData({ company: "", role: "", status: "Selected", difficulty: "Medium", experience: "" });
      setProblems([{ link: "", description: "" }]);
      setActiveTab("browse");
      await loadExperiences();
    } catch (err) {
      console.error("Failed to submit experience:", err);
      alert("Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLike = async (e, expId) => {
    e.stopPropagation();
    if (!user?.uid) return;

    try {
      const result = await toggleExperienceLike(expId, user.uid, token);
      setExperiences((prev) =>
        prev.map((exp) =>
          exp.id === expId
            ? {
                ...exp,
                likes: result.likes,
                likedBy: result.liked
                  ? [...(exp.likedBy || []), user.uid]
                  : (exp.likedBy || []).filter((id) => id !== user.uid),
              }
            : exp
        )
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Filter and sort
  const filteredExperiences = experiences
    .filter((exp) => {
      const matchesSearch =
        exp.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.role?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "All" || exp.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "most_liked":
          return (b.likes || 0) - (a.likes || 0);
        case "difficulty_asc":
          return (DIFFICULTY_ORDER[a.difficulty] || 2) - (DIFFICULTY_ORDER[b.difficulty] || 2);
        case "difficulty_desc":
          return (DIFFICULTY_ORDER[b.difficulty] || 2) - (DIFFICULTY_ORDER[a.difficulty] || 2);
        case "newest":
        default:
          return 0; // Already sorted by newest from backend
      }
    });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Interview Experiences</h1>
          <p className="text-slate-500 dark:text-slate-400">Read past interview trends or help juniors by sharing yours.</p>
        </div>

        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "browse"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
          >
            Browse Archives
          </button>
          <button
            onClick={() => setActiveTab("contribute")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "contribute"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
          >
            <PenTool size={14} /> Share Experience
          </button>
        </div>
      </div>

      {/* --- BROWSE MODE --- */}
      {activeTab === "browse" && (
        <div className="space-y-6">

          {/* Search + Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Difficulty Filter Pills */}
              <div className="flex gap-1.5">
                {DIFFICULTY_OPTIONS.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      difficultyFilter === diff
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 ml-auto">
                <ArrowUpDown size={14} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-medium rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {loading && (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            )}

            {!loading && filteredExperiences.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No interview experiences found. Be the first to share yours!</p>
              </div>
            )}

            {!loading && filteredExperiences.map((exp) => {
              const isLiked = (exp.likedBy || []).includes(user?.uid);
              return (
                <div
                  key={exp.id}
                  className={`group rounded-xl border bg-white shadow-sm transition-all dark:bg-slate-900 ${expandedId === exp.id
                      ? "border-indigo-500 ring-1 ring-indigo-500 dark:border-indigo-500"
                      : "border-slate-200 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700"
                    }`}
                >
                  <div className="p-5 cursor-pointer" onClick={() => toggleExpand(exp.id)}>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold dark:bg-slate-800 dark:text-slate-300">
                          {exp.company?.[0] || "?"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{exp.company}</h3>
                          <p className="text-xs text-slate-500">{exp.role} • {exp.date}</p>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded text-xs font-medium border ${exp.status === "Selected"
                          ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                          : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                        }`}>
                        {exp.status === "Selected" ? <span className="flex items-center gap-1"><CheckCircle size={12} /> Selected</span> : <span className="flex items-center gap-1"><XCircle size={12} /> Rejected</span>}
                      </div>
                    </div>

                    <div className="mb-2">
                      {expandedId === exp.id ? (
                        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                          {exp.fullStory}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {exp.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User size={12} /> {exp.author}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
                          exp.difficulty === "Easy" ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                          exp.difficulty === "Hard" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                          "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        }`}>
                          <Briefcase size={12} /> {exp.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => handleLike(e, exp.id)}
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all ${
                            isLiked
                              ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30"
                              : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20"
                          }`}
                        >
                          <ThumbsUp size={14} className={isLiked ? "fill-current" : ""} /> {exp.likes || 0}
                        </button>
                        <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {expandedId === exp.id ? (
                            <>Show Less <ChevronUp size={14} /></>
                          ) : (
                            <>Read Full Story <ChevronRight size={14} /></>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- CONTRIBUTE MODE --- */}
      {activeTab === "contribute" && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Write your Interview Experience</h2>

            <form onSubmit={handlePublish} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Company Name</label>
                  <input
                    type="text"
                    list="company-list"
                    placeholder="Type company name (e.g. Google, MyStartup)"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                  <datalist id="company-list">
                    {companies.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Role Offered</label>
                  <input
                    type="text"
                    placeholder="e.g. SDE, Data Analyst"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Verdict</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="status" className="accent-green-500"
                        checked={formData.status === "Selected"}
                        onChange={() => setFormData({ ...formData, status: "Selected" })}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="status" className="accent-red-500"
                        checked={formData.status === "Rejected"}
                        onChange={() => setFormData({ ...formData, status: "Rejected" })}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rejected</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {["Easy", "Medium", "Hard"].map((diff) => (
                      <button
                        type="button"
                        key={diff}
                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${formData.difficulty === diff
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Experience Details</label>
                <textarea
                  rows={8}
                  placeholder="Describe the rounds, questions asked, and your approach. Use **bold** for headings."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                ></textarea>
                <p className="mt-2 text-xs text-slate-400">
                  Tip: Be specific about the coding problems.
                </p>
              </div>

              {/* --- DYNAMIC INTERVIEW QUESTIONS SECTION --- */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase text-slate-500">Coding Problems & Links</label>
                  <span className="text-xs text-slate-400">Optional</span>
                </div>

                <div className="space-y-4">
                  {problems.map((problem, index) => (
                    <div key={index} className="p-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/50">

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={problem.link}
                            onChange={(e) => handleProblemChange(index, "link", e.target.value)}
                            placeholder="Link to problem (e.g., LeetCode, Codeforces, CSES)"
                            className="flex-grow rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                          />

                          {problems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProblem(index)}
                              className="p-2.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                              title="Remove this problem"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div>
                          <textarea
                            value={problem.description}
                            onChange={(e) => handleProblemChange(index, "description", e.target.value)}
                            rows={2}
                            placeholder="Notes (e.g., Expected time complexity, topics like Segment Trees or Math)"
                            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white resize-none"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddProblem}
                  className="mt-3 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                >
                  <Plus size={14} /> Add Another Problem
                </button>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={18} /> Publish Experience</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}