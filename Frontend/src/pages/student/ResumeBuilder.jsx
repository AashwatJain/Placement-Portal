import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart,
  X,
  ExternalLink,
  Clock,
  Star,
  Sparkles,
  TrendingUp,
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
  const [metricsLoading, setMetricsLoading] = useState(null);
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

  const isPrimary = (resumeId) => user?.primaryResumeId === resumeId;

  // ── Metrics handler ────────────────────────────────────────────────────────
  const handleMetrics = async (resume) => {
    setMetricsLoading(resume.id);
    try {
      const pdfResponse = await axios.get(resume.url, { responseType: "blob" });
      const pdfBlob = new Blob([pdfResponse.data], { type: "application/pdf" });
      const pdfFile = new File([pdfBlob], resume.name, { type: "application/pdf" });

      const formData = new FormData();
      formData.append("resumeFile", pdfFile);

      const atsResponse = await axios.post(`${API_BASE_URL}/api/ats/calculate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 25000,
      });

      setSelectedAnalysis({ ...resume, score: atsResponse.data.atsScore ?? null });
    } catch (err) {
      console.error("Metrics error:", err);
      setSelectedAnalysis(resume);
      alert("Could not calculate ATS score. " + (err.response?.data?.error || "Make sure ML server is running."));
    } finally {
      setMetricsLoading(null);
    }
  };

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

  const getScoreInfo = (score) => {
    if (score == null) return { color: "text-slate-400", ringColor: "stroke-slate-300 dark:stroke-slate-700", label: "Not Scored", emoji: "—" };
    if (score >= 80) return { color: "text-emerald-500", ringColor: "stroke-emerald-500", label: "Excellent", emoji: "🔥" };
    if (score >= 60) return { color: "text-amber-500", ringColor: "stroke-amber-500", label: "Good", emoji: "👍" };
    if (score >= 40) return { color: "text-orange-500", ringColor: "stroke-orange-500", label: "Average", emoji: "⚡" };
    return { color: "text-red-500", ringColor: "stroke-red-500", label: "Needs Work", emoji: "📝" };
  };

  const getAtsBarColor = (score) => {
    if (score > 75) return "from-emerald-400 to-emerald-600";
    if (score >= 50) return "from-amber-400 to-amber-600";
    return "from-rose-400 to-rose-600";
  };

  const getAtsLabel = (score) => {
    if (score > 75) return { label: "Excellent Match", tip: "Your resume is packed with strong keywords. Focus on interview prep!" };
    if (score >= 50) return { label: "Moderate Match", tip: "Add more relevant skills like DSA, projects, or backend technologies." };
    return { label: "Needs Work", tip: "Add CP achievements, projects, databases, and leadership roles." };
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 relative">

      {/* ═══ HEADER ═══ */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Vault</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Upload resumes, set your primary, and check ATS scores.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <FileText size={12} /> {resumes.length} file{resumes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ═══ UPLOAD + ATS SCANNER — TWO COLUMN ═══ */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Upload Card */}
        <div
          onClick={handleBoxClick}
          className={`lg:col-span-2 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white py-10 transition-all hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 ${isAnalyzing ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <div className="mb-3 rounded-2xl bg-indigo-50 p-4 transition-transform group-hover:scale-110 dark:bg-indigo-900/20">
            {isAnalyzing ? (
              <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={28} />
            ) : (
              <UploadCloud className="text-indigo-600 dark:text-indigo-400" size={28} />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            {isAnalyzing ? "Uploading..." : "Upload Resume"}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">PDF, DOCX up to 5MB</p>
        </div>

        {/* ATS Scanner Card */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <TrendingUp size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">ATS Resume Match</h2>
              <p className="text-[11px] text-slate-400">Score your resume against placement benchmarks</p>
            </div>
            <span className="ml-auto rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => atsFileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <UploadCloud size={14} />
              {atsFile ? "Change" : "Choose PDF"}
            </button>
            {atsFile && (
              <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 min-w-0">
                <FileText size={13} className="text-indigo-500 shrink-0" />
                <span className="truncate font-medium max-w-[140px]">{atsFile.name}</span>
              </span>
            )}
            <input
              ref={atsFileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { setAtsFile(e.target.files[0] || null); setAtsScore(null); setAtsError(null); }}
            />
            <button
              onClick={handleCalculateAts}
              disabled={isCalculatingAts || !atsFile}
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCalculatingAts ? (
                <><Loader2 size={13} className="animate-spin" /> Scoring...</>
              ) : (
                <><Sparkles size={13} /> Calculate</>
              )}
            </button>
          </div>

          {atsError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400">
              <AlertCircle size={14} className="shrink-0" /> {atsError}
            </div>
          )}

          {atsScore !== null && !isCalculatingAts && (() => {
            const barColor = getAtsBarColor(atsScore);
            const { label, tip } = getAtsLabel(atsScore);
            const scoreColor = atsScore > 75 ? "text-emerald-500" : atsScore >= 50 ? "text-amber-500" : "text-rose-500";
            return (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ATS Score</p>
                    <p className={`text-xs font-bold ${scoreColor}`}>{label}</p>
                  </div>
                  <span className={`text-3xl font-black tabular-nums ${scoreColor}`}>
                    {atsScore}<span className="text-sm text-slate-400">%</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">💡 {tip}</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ═══ MY RESUMES ═══ */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Resumes</h2>
          <span className="text-xs font-medium text-slate-400">{resumes.length} file{resumes.length !== 1 ? "s" : ""}</span>
        </div>

        {resumes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <FileText size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No resumes yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload your first resume to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const primary = isPrimary(resume.id);
              const isLoadingMetrics = metricsLoading === resume.id;
              return (
                <div
                  key={resume.id}
                  className={`group relative flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md ${
                    primary
                      ? "border-indigo-300 bg-gradient-to-r from-indigo-50/70 via-white to-white ring-1 ring-indigo-300/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-indigo-700 dark:ring-indigo-700/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Left: Icon */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    primary
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    <FileText size={20} />
                  </div>

                  {/* Middle: Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={resume.name}>
                        {resume.name}
                      </h4>
                      {primary && (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          <Star size={8} className="fill-current" /> Primary
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                      <span>{resume.date}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-slate-500 dark:text-slate-400">{resume.target}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => handleMetrics(resume)}
                      disabled={isLoadingMetrics}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-all dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 disabled:opacity-50 disabled:cursor-wait"
                      title="Calculate ATS Score"
                    >
                      {isLoadingMetrics ? (
                        <><Loader2 size={12} className="animate-spin" /> Scoring...</>
                      ) : (
                        <><BarChart size={12} /> ATS Score</>
                      )}
                    </button>

                    {resume.url && (
                      <a
                        href={resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-all"
                        title="Open PDF"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}

                    {!primary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetPrimary(resume.id); }}
                        disabled={settingPrimary === resume.id}
                        className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-all disabled:opacity-50"
                        title="Set as primary"
                      >
                        {settingPrimary === resume.id ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
                      </button>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ ATS SCORE MODAL ═══ */}
      {selectedAnalysis && (() => {
        const score = selectedAnalysis.score;
        const info = getScoreInfo(score);
        const circumference = 2 * Math.PI * 58;
        const dashOffset = score != null ? circumference - (circumference * score / 100) : circumference;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSelectedAnalysis(null)}>
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-5 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">ATS Analysis</p>
                    <h2 className="truncate text-base font-bold mt-0.5" title={selectedAnalysis.name}>{selectedAnalysis.name}</h2>
                  </div>
                  <button onClick={() => setSelectedAnalysis(null)} className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Score Ring */}
              <div className="flex flex-col items-center py-8">
                <div className="relative">
                  <svg width="150" height="150" className="-rotate-90">
                    <circle cx="75" cy="75" r="58" fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-800" />
                    <circle cx="75" cy="75" r="58" fill="none" strokeWidth="12" strokeLinecap="round"
                      className={info.ringColor}
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: dashOffset,
                        transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black tabular-nums ${info.color}`}>
                      {score != null ? score : "—"}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">out of 100</span>
                  </div>
                </div>

                <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  score == null ? "bg-slate-100 text-slate-400 dark:bg-slate-800" :
                  score >= 80 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                  score >= 60 ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                  score >= 40 ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" :
                  "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {score != null && score >= 80 ? <CheckCircle size={13} /> : score != null ? <AlertCircle size={13} /> : <Clock size={13} />}
                  {info.label}
                </div>

                {score != null && (
                  <p className="mt-4 px-8 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {score >= 80
                      ? "Your resume is strong! Focus on interview preparation."
                      : score >= 60
                      ? "Good start — add more relevant skills, projects, or CP achievements."
                      : score >= 40
                      ? "Include DSA, backend tech, competitive programming, and leadership."
                      : "Add projects, CP ratings, databases, and extracurriculars to improve."}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/20 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
                {selectedAnalysis.url && (
                  <a
                    href={selectedAnalysis.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    Open PDF <ExternalLink size={12} />
                  </a>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}