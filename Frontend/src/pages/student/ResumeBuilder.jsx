import { useState, useRef, useEffect } from "react";
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
  ExternalLink,
  Clock,
  Star
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { setPrimaryResume as setPrimaryResumeApi } from "../../services/studentApi";
import axios from "axios";

export default function ResumeBuilder() {
  const { user, token, refreshUser } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [settingPrimary, setSettingPrimary] = useState(null);
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);

  // ATS Match state
  const [atsFile, setAtsFile] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [isCalculatingAts, setIsCalculatingAts] = useState(false);
  const [atsError, setAtsError] = useState(null);
  const atsFileInputRef = useRef(null);

  useEffect(() => {
    let allResumes = [];

    if (user && user.resumes) {
      const vaultResumes = Object.values(user.resumes);
      vaultResumes.sort((a, b) => b.id - a.id);
      allResumes = [...allResumes, ...vaultResumes];
    }

    setResumes(allResumes);
  }, [user]);

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("vaultResume", file);
      formData.append("uid", user.uid);

      const response = await axios.post(`${API_BASE_URL}/api/student/upload-vault`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (refreshUser) {
        await refreshUser();
      }

      if (response.data && response.data.resume) {
        setResumes(prevResumes => [response.data.resume, ...prevResumes]);
      }

      alert("Resume uploaded to vault successfully!");
    } catch (error) {
      console.error("Vault Upload Error:", error);
      alert("Upload failed. " + (error.response?.data?.error || "Check backend connection."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteResume = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/student/delete-vault-resume/${user.uid}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(resumes.filter(r => r.id !== id));

      if (refreshUser) {
        refreshUser();
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete resume. Check backend connection.");
    }
  };

  const handleSetPrimary = async (resumeId) => {
    setSettingPrimary(resumeId);
    try {
      await setPrimaryResumeApi(user.uid, resumeId, token);
      if (refreshUser) await refreshUser();
      alert("Primary resume set successfully! It will now show on your Profile page.");
    } catch (error) {
      console.error("Set Primary Error:", error);
      alert("Failed to set primary resume. " + (error.response?.data?.error || ""));
    } finally {
      setSettingPrimary(null);
    }
  };

  const getScoreColor = (score) => {
    if (score == null) return "text-slate-400 bg-slate-200";
    if (score >= 80) return "text-emerald-500 bg-emerald-500";
    if (score >= 60) return "text-amber-500 bg-amber-500";
    return "text-red-500 bg-red-500";
  };

  const isPrimary = (resumeId) => user?.primaryResumeId === resumeId;

  // ── ATS Match handler ──────────────────────────────────────────────────────
  const handleCalculateAts = async () => {
    if (!atsFile) return;
    setIsCalculatingAts(true);
    setAtsError(null);
    setAtsScore(null);
    try {
      const formData = new FormData();
      formData.append("resumeFile", atsFile);
      const response = await axios.post(`${API_BASE_URL}/api/ats/calculate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 20000,
      });
      setAtsScore(response.data.atsScore ?? null);
    } catch (err) {
      console.error("ATS scoring error:", err);
      setAtsError(err.response?.data?.error || "Failed to calculate ATS score. Ensure ML server is running.");
    } finally {
      setIsCalculatingAts(false);
    }
  };

  const getAtsScoreColor = (score) => {
    if (score > 75) return { text: "text-emerald-600 dark:text-emerald-400", bar: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", label: "Excellent Match", tip: "Your resume is packed with strong keywords. Focus on interview prep!" };
    if (score >= 50) return { text: "text-amber-600 dark:text-amber-400", bar: "from-amber-400 to-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", label: "Moderate Match", tip: "Add more relevant skills like DSA, projects, or backend technologies to boost your score." };
    return { text: "text-rose-600 dark:text-rose-400", bar: "from-rose-400 to-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800", label: "Needs Work", tip: "Add competitive programming achievements (ICPC, Codeforces), projects, databases, and leadership roles." };
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 relative">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Vault & ATS Scanner</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage tailored resumes for different companies and check their ATS compatibility.</p>
      </div>

      {/* Upload Area */}
      <div
        onClick={handleBoxClick}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition-all hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/10 ${isAnalyzing ? 'pointer-events-none opacity-70' : ''}`}
      >
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
          {isAnalyzing ? "Uploading to Database..." : "Click to Upload New Resume"}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">PDF, DOCX up to 5MB</p>
      </div>

      {/* ── ATS Match Section ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <BarChart size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">ATS Resume Match</h2>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">AI Powered</span>
        </div>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Upload your resume PDF and we'll score it against an ideal placement-ready benchmark — covering DSA, CP, ICPC, backend, databases, projects, leadership & more.
        </p>

        {/* File picker */}
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resume PDF</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => atsFileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <UploadCloud size={16} />
              {atsFile ? "Change File" : "Choose PDF"}
            </button>
            {atsFile && (
              <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <FileText size={14} className="text-indigo-500" />
                <span className="max-w-[200px] truncate font-medium">{atsFile.name}</span>
              </span>
            )}
            <input
              ref={atsFileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { setAtsFile(e.target.files[0] || null); setAtsScore(null); setAtsError(null); }}
            />
          </div>
        </div>

        <button
          onClick={handleCalculateAts}
          disabled={isCalculatingAts || !atsFile}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isCalculatingAts ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart size={16} />
              Calculate ATS Match
            </>
          )}
        </button>

        {/* Error */}
        {atsError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400">
            <AlertCircle size={16} className="shrink-0" />
            {atsError}
          </div>
        )}

        {/* Score Result */}
        {atsScore !== null && !isCalculatingAts && (() => {
          const scoreStyle = getAtsScoreColor(atsScore);
          return (
            <div className={`mt-5 rounded-xl border p-5 ${scoreStyle.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">ATS Compatibility Score</p>
                  <p className={`mt-0.5 text-sm font-bold ${scoreStyle.text}`}>{scoreStyle.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-4xl font-black tabular-nums ${scoreStyle.text}`}>
                    {atsScore}<span className="text-lg text-slate-400">%</span>
                  </span>
                </div>
              </div>

              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${scoreStyle.bar} transition-all duration-1000 ease-out`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>

              <p className="mt-3 rounded-lg bg-white/60 px-4 py-2.5 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                💡 {scoreStyle.tip}
              </p>
            </div>
          );
        })()}
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
        {resumes.length === 0 ? (
          <div className="col-span-full py-10 text-center text-slate-500">
            No resumes found. Upload one to get started.
          </div>
        ) : (
          resumes.map((resume) => (
            <div key={resume.id} className={`group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 ${
              isPrimary(resume.id)
                ? "border-indigo-400 bg-indigo-50/30 ring-1 ring-indigo-400/50 dark:border-indigo-600 dark:bg-indigo-900/10"
                : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:hover:border-indigo-900"
            }`}>

              {/* Primary Badge */}
              {isPrimary(resume.id) && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  <Star size={10} className="fill-current" /> Primary
                </div>
              )}

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

              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Target: {resume.target}
                </span>

                {!isPrimary(resume.id) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetPrimary(resume.id); }}
                    disabled={settingPrimary === resume.id}
                    className="relative z-20 flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100 transition-all disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                  >
                    {settingPrimary === resume.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Star size={12} />
                    )}
                    Set Primary
                  </button>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <BarChart size={14} /> ATS Score
                  </span>
                  <span className={`font-bold ${getScoreColor(resume.score).split(" ")[0]}`}>
                    {resume.score == null ? "--" : `${resume.score}/100`}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${resume.score == null ? 'bg-slate-200 dark:bg-slate-700' : getScoreColor(resume.score).split(" ")[1]}`}
                    style={{ width: resume.score == null ? '0%' : `${resume.score}%` }}
                  ></div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  {resume.score == null ? (
                    <Clock size={14} className="text-slate-400" />
                  ) : resume.score >= 80 ? (
                    <CheckCircle size={14} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={14} className={resume.score < 60 ? "text-red-500" : "text-amber-500"} />
                  )}
                  <span className="text-slate-500 dark:text-slate-400">
                    {resume.score == null ? "Analysis to be integrated" : resume.score >= 80 ? "Excellent Match" : resume.score >= 60 ? "Needs Improvement" : "Critical Fixes Needed"}
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 dark:bg-slate-900/90 gap-2">
                {resume.url && (
                  <a
                    href={resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-slate-900 hover:scale-105 transition-all"
                  >
                    <ExternalLink size={16} /> Open
                  </a>
                )}
                <button
                  onClick={() => setSelectedAnalysis(resume)}
                  className="pointer-events-auto flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
                >
                  <Eye size={16} /> Metrics
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* ANALYSIS MODAL */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">

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

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                  <p className="text-xs font-semibold uppercase text-slate-500">Overall Score</p>
                  <p className={`text-3xl font-black ${getScoreColor(selectedAnalysis.score).split(" ")[0]}`}>{selectedAnalysis.score == null ? "--" : selectedAnalysis.score}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                  <p className="text-xs font-semibold uppercase text-slate-500">Formatting</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.analysis.formatting == null ? "--" : `${selectedAnalysis.analysis.formatting}%`}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
                  <p className="text-xs font-semibold uppercase text-slate-500">Impact</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.analysis.impact == null ? "--" : `${selectedAnalysis.analysis.impact}%`}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" /> Found Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.analysis.keywordsFound.length > 0 ? selectedAnalysis.analysis.keywordsFound.map(k => (
                      <span key={k} className="rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50">
                        {k}
                      </span>
                    )) : <span className="text-sm text-slate-500">Pending backend analysis.</span>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Target size={16} className="text-red-500" /> Missing Critical Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.analysis.missingKeywords.length > 0 ? selectedAnalysis.analysis.missingKeywords.map(k => (
                      <span key={k} className="rounded-md bg-red-50 px-2.5 py-1 text-sm font-medium text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
                        {k}
                      </span>
                    )) : <span className="text-sm text-slate-500">Pending backend analysis.</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>

              {selectedAnalysis.url && (
                <a
                  href={selectedAnalysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
                >
                  Open Original PDF <ExternalLink size={16} />
                </a>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}