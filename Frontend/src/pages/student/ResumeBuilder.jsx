import { useState, useRef } from "react"; // useRef add kiya
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye,
  BarChart,
  X,
  Target,
  ArrowUpRight
} from "lucide-react";

export default function ResumeBuilder() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const fileInputRef = useRef(null); // Reference for hidden file input
  
  // Mock Data
  const [resumes, setResumes] = useState([
    { 
      id: 1, 
      name: "Aashwat_Google_SDE.pdf", 
      target: "Google", 
      score: 88, 
      status: "Strong", 
      date: "2 days ago",
      analysis: {
        keywordsFound: ["Data Structures", "Algorithms", "C++", "System Design"],
        missingKeywords: ["Distributed Systems", "Go"],
        formatting: 95,
        impact: 85
      }
    },
    { 
      id: 2, 
      name: "Aashwat_Amazon_Backend.pdf", 
      target: "Amazon", 
      score: 72, 
      status: "Average", 
      date: "1 week ago",
      analysis: {
        keywordsFound: ["Java", "AWS", "DynamoDB"],
        missingKeywords: ["Leadership Principles", "Scalability"],
        formatting: 80,
        impact: 65
      }
    }
  ]);

  // Step 1: Trigger File Input Click
  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  // Step 2: Handle File Selection & Start Simulation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Start Analysis Animation
    setIsAnalyzing(true);

    // Simulate Backend Processing (2 Seconds)
    setTimeout(() => {
      const newResume = {
        id: Date.now(),
        name: file.name, // Real file name use kar rahe hain
        target: "General", // Default target
        score: Math.floor(Math.random() * (95 - 60) + 60), 
        status: "Analyzing...",
        date: "Just now",
        analysis: {
          keywordsFound: ["React", "JavaScript"],
          missingKeywords: ["TypeScript", "Testing"],
          formatting: Math.floor(Math.random() * (100 - 70) + 70),
          impact: Math.floor(Math.random() * (100 - 60) + 60)
        }
      };
      
      if(newResume.score > 80) newResume.status = "Strong";
      else if(newResume.score > 60) newResume.status = "Average";
      else newResume.status = "Weak";

      setResumes([newResume, ...resumes]);
      setIsAnalyzing(false);
    }, 2500);
  };

  const deleteResume = (id) => {
    setResumes(resumes.filter(r => r.id !== id));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500";
    if (score >= 60) return "text-amber-500 bg-amber-500";
    return "text-red-500 bg-red-500";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Vault & ATS Scanner</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage tailored resumes for different companies and check their ATS compatibility.</p>
      </div>

      {/* --- REAL UPLOAD AREA --- */}
      <div 
        onClick={handleBoxClick}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition-all hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10 ${isAnalyzing ? 'pointer-events-none opacity-70' : ''}`}
      >
        {/* Hidden Input Field */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.doc,.docx"
        />

        <div className="mb-4 rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/30">
          {isAnalyzing ? (
            <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
          ) : (
            <UploadCloud className="text-indigo-600 dark:text-indigo-400" size={32} />
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {isAnalyzing ? "Scanning & Analyzing Resume..." : "Click to Upload New Resume"}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">PDF, DOCX up to 5MB</p>
      </div>

      {/* Resume Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <div key={resume.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">
            
            {/* Top Row */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="max-w-[120px] truncate text-sm font-bold text-slate-900 dark:text-white" title={resume.name}>
                    {resume.name}
                  </h4>
                  <p className="text-xs text-slate-500">{resume.date}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }}
                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all z-10"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Target Tag */}
            <div className="mb-6">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Target: {resume.target}
              </span>
            </div>

            {/* ATS Score Meter */}
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                   <BarChart size={14} /> ATS Score
                </span>
                <span className={`font-bold ${getScoreColor(resume.score).split(" ")[0]}`}>
                  {resume.score}/100
                </span>
              </div>
              
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(resume.score).split(" ")[1]}`} 
                  style={{ width: `${resume.score}%` }}
                ></div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs">
                {resume.score >= 80 ? (
                  <CheckCircle size={14} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={14} className={resume.score < 60 ? "text-red-500" : "text-amber-500"} />
                )}
                <span className="text-slate-500 dark:text-slate-400">
                  {resume.score >= 80 ? "Excellent Match" : resume.score >= 60 ? "Needs Improvement" : "Critical Fixes Needed"}
                </span>
              </div>
            </div>

            {/* View Analysis Button (Overlay) */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 dark:bg-slate-900/90">
               <button 
                 onClick={() => setSelectedAnalysis(resume)}
                 className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
               >
                 <Eye size={16} /> View Analysis
               </button>
            </div>

          </div>
        ))}
      </div>

      {/* --- ANALYSIS MODAL --- */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${getScoreColor(selectedAnalysis.score).replace('text-', 'bg-').replace('500', '100')} ${getScoreColor(selectedAnalysis.score).split(' ')[0]}`}>
                    <BarChart size={24} />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">ATS Analysis Report</h2>
                    <p className="text-sm text-slate-500">File: {selectedAnalysis.name}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedAnalysis(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
               
               {/* Score Overview */}
               <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                     <p className="text-xs font-semibold uppercase text-slate-500">Overall Score</p>
                     <p className={`text-3xl font-black ${getScoreColor(selectedAnalysis.score).split(" ")[0]}`}>{selectedAnalysis.score}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                     <p className="text-xs font-semibold uppercase text-slate-500">Formatting</p>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.analysis.formatting}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                     <p className="text-xs font-semibold uppercase text-slate-500">Impact</p>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.analysis.impact}%</p>
                  </div>
               </div>

               {/* Keywords Section */}
               <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                       <CheckCircle size={16} className="text-emerald-500"/> Found Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {selectedAnalysis.analysis.keywordsFound.map(k => (
                          <span key={k} className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50">
                            {k}
                          </span>
                       ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                       <Target size={16} className="text-red-500"/> Missing Critical Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {selectedAnalysis.analysis.missingKeywords.map(k => (
                          <span key={k} className="rounded-md bg-red-50 px-2.5 py-1 text-sm font-medium text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
                            {k}
                          </span>
                       ))}
                    </div>
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 flex justify-end gap-3">
               <button 
                 onClick={() => setSelectedAnalysis(null)}
                 className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700"
               >
                 Close
               </button>
               <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                 Edit Resume <ArrowUpRight size={16} />
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}