import { useState } from "react";
import { MOCK_COMPANIES, MOCK_EXPERIENCES } from "../../data/mockData"; 
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
  ChevronRight
} from "lucide-react";

export default function InterviewExperiences() {
  const [activeTab, setActiveTab] = useState("browse"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Selected",
    difficulty: "Medium",
    experience: ""
  });

  const handlePublish = (e) => {
    e.preventDefault();
    alert("Experience submitted for approval!");
    setActiveTab("browse");
    setFormData({ company: "", role: "", status: "Selected", difficulty: "Medium", experience: "" });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredExperiences = MOCK_EXPERIENCES.filter(exp => 
    exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "browse" 
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            Browse Archives
          </button>
          <button 
            onClick={() => setActiveTab("contribute")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "contribute" 
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company, role, or difficulty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid gap-4">
            {filteredExperiences.map((exp) => (
              <div 
                key={exp.id} 
                className={`group rounded-xl border bg-white shadow-sm transition-all dark:bg-slate-900 ${
                  expandedId === exp.id 
                    ? "border-indigo-500 ring-1 ring-indigo-500 dark:border-indigo-500" 
                    : "border-slate-200 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700"
                }`}
              >
                <div className="p-5 cursor-pointer" onClick={() => toggleExpand(exp.id)}>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold dark:bg-slate-800 dark:text-slate-300">
                         {exp.company[0]}
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-900 dark:text-white">{exp.company}</h3>
                         <p className="text-xs text-slate-500">{exp.role} • {exp.date}</p>
                       </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded text-xs font-medium border ${
                      exp.status === "Selected" 
                        ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900" 
                        : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                    }`}>
                      {exp.status === "Selected" ? <span className="flex items-center gap-1"><CheckCircle size={12}/> Selected</span> : <span className="flex items-center gap-1"><XCircle size={12}/> Rejected</span>}
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
                        <span className="flex items-center gap-1"><User size={12}/> {exp.author}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12}/> {exp.difficulty}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                          <ThumbsUp size={14} /> {exp.likes}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {expandedId === exp.id ? (
                            <>Show Less <ChevronUp size={14}/></>
                          ) : (
                            <>Read Full Story <ChevronRight size={14}/></>
                          )}
                        </span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
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
                
                {/* UPDATED: Generic Company Input with Datalist */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    list="company-list" 
                    placeholder="Type company name (e.g. Google, MyStartup)" 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                  />
                  {/* Suggestions list but accepts any input */}
                  <datalist id="company-list">
                    {MOCK_COMPANIES.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Role Offered</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SDE, Data Analyst" 
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Verdict</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" className="accent-green-500" defaultChecked />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" className="accent-red-500" />
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
                         onClick={() => setFormData({...formData, difficulty: diff})}
                         className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                           formData.difficulty === diff 
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
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  required
                ></textarea>
                <p className="mt-2 text-xs text-slate-400">
                  Tip: Be specific about the coding problems.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                  <Send size={18} /> Publish Experience
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}