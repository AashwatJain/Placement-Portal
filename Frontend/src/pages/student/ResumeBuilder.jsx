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
    if (score == null) return { color: "text-brand-brown-400", ringColor: "stroke-brand-beige-300 dark:stroke-brand-brown-700", label: "Not Scored", emoji: "—" };
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
          <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white">Resume Vault</h1>
          <p className="mt-0.5 text-sm text-brand-brown-600 dark:text-brand-beige-400">Upload resumes, set your primary, and check ATS scores.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-beige-100 px-2.5 py-1 text-xs font-medium text-brand-brown-700 dark:bg-[#3E2315] dark:text-brand-beige-300">
            <FileText size={12} /> {resumes.length} file{resumes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ═══ UPLOAD ═══ */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Upload Card */}
        <div
          onClick={handleBoxClick}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-beige-300 bg-white py-10 transition-all hover:border-brand-amber-500 hover:shadow-lg hover:shadow-brand-amber-500/5 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:hover:border-[#E89B60] ${isAnalyzing ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <div className="mb-3 rounded-2xl bg-brand-amber-500/10 p-4 transition-transform group-hover:scale-110 dark:bg-[#E89B60]/20">
            {isAnalyzing ? (
              <Loader2 className="animate-spin text-brand-amber-500 dark:text-[#E89B60]" size={28} />
            ) : (
              <UploadCloud className="text-brand-amber-500 dark:text-[#E89B60]" size={28} />
            )}
          </div>
          <p className="text-sm font-semibold text-brand-brown-900 dark:text-white">
            {isAnalyzing ? "Uploading..." : "Upload Resume"}
          </p>
          <p className="mt-0.5 text-xs text-brand-brown-600 dark:text-brand-beige-400">PDF, DOCX up to 5MB</p>
        </div>
      </div>



      {/* ═══ MY RESUMES ═══ */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-brown-900 dark:text-white">My Resumes</h2>
          <span className="text-xs font-medium text-brand-brown-600 dark:text-brand-beige-400">{resumes.length} file{resumes.length !== 1 ? "s" : ""}</span>
        </div>

        {resumes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-brand-beige-200 bg-brand-cream-50 py-16 text-center dark:border-[#3E2315] dark:bg-[#1A0F08]">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-[#2A1810]">
              <FileText size={24} className="text-brand-brown-400 dark:text-brand-beige-500" />
            </div>
            <p className="text-sm font-medium text-brand-brown-600 dark:text-brand-beige-400">No resumes yet</p>
            <p className="text-xs text-brand-brown-400 mt-1 dark:text-brand-beige-500">Upload your first resume to get started</p>
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
                      ? "border-brand-amber-500/50 bg-gradient-to-r from-brand-amber-500/10 via-brand-cream-50 to-white ring-1 ring-brand-amber-500/20 dark:from-[#3E2315] dark:via-[#1A0F08] dark:to-[#1A0F08] dark:border-[#E89B60] dark:ring-[#E89B60]/20"
                      : "border-brand-beige-200 bg-white hover:border-brand-beige-300 dark:border-[#3E2315] dark:bg-[#1A0F08] dark:hover:border-[#5A3D2B]"
                  }`}
                >
                  {/* Left: Icon */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    primary
                      ? "bg-brand-amber-500/20 text-brand-amber-500 dark:bg-[#E89B60]/20 dark:text-[#E89B60]"
                      : "bg-brand-beige-100 text-brand-brown-600 dark:bg-[#2A1810] dark:text-brand-beige-400"
                  }`}>
                    <FileText size={20} />
                  </div>

                  {/* Middle: Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-brand-brown-900 dark:text-white" title={resume.name}>
                        {resume.name}
                      </h4>
                      {primary && (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-amber-500 to-[#E89B60] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          <Star size={8} className="fill-current" /> Primary
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-brand-brown-600 dark:text-brand-beige-400">
                      <span>{resume.date}</span>
                      <span className="text-brand-beige-300 dark:text-[#3E2315]">•</span>
                      <span className="text-brand-brown-500 dark:text-brand-beige-500">{resume.target}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => handleMetrics(resume)}
                      disabled={isLoadingMetrics}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-amber-500/10 px-3 py-1.5 text-xs font-semibold text-brand-amber-500 hover:bg-brand-amber-500/20 transition-all dark:bg-[#C07840]/20 dark:text-brand-amber-500 dark:hover:bg-[#C07840]/30 disabled:opacity-50 disabled:cursor-wait"
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
                        className="rounded-lg p-2 text-brand-brown-500 hover:bg-brand-beige-100 hover:text-brand-brown-800 dark:hover:bg-[#2A1810] dark:hover:text-brand-beige-200 transition-all cursor-pointer"
                        title="Open PDF"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}

                    {!primary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetPrimary(resume.id); }}
                        disabled={settingPrimary === resume.id}
                        className="rounded-lg p-2 text-brand-brown-500 hover:bg-brand-amber-50 hover:text-brand-amber-500 dark:hover:bg-[#C07840]/20 dark:hover:text-brand-amber-400 transition-all disabled:opacity-50"
                        title="Set as primary"
                      >
                        {settingPrimary === resume.id ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
                      </button>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }}
                      className="rounded-lg p-2 text-brand-brown-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 transition-all cursor-pointer"
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
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-[#1A0F08] border border-brand-beige-200 dark:border-[#3E2315] overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-brand-amber-500 to-[#E89B60] px-6 py-5 text-white">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD6A5]">ATS Analysis</p>
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
                    <circle cx="75" cy="75" r="58" fill="none" strokeWidth="12" className="stroke-brand-beige-100 dark:stroke-[#3E2315]" />
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
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-brown-500 dark:text-brand-beige-400 mt-0.5">out of 100</span>
                  </div>
                </div>

                <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  score == null ? "bg-brand-beige-100 text-brand-brown-600 dark:bg-[#3E2315] dark:text-brand-beige-300" :
                  score >= 80 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                  score >= 60 ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                  score >= 40 ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" :
                  "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {score != null && score >= 80 ? <CheckCircle size={13} /> : score != null ? <AlertCircle size={13} /> : <Clock size={13} />}
                  {info.label}
                </div>

                {score != null && (
                  <p className="mt-4 px-8 text-center text-xs text-brand-brown-600 dark:text-brand-beige-400 leading-relaxed">
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
              <div className="border-t border-brand-beige-100 px-5 py-3 bg-brand-cream-50 dark:border-[#3E2315] dark:bg-[#2A1810] flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="px-4 py-2 text-xs font-medium text-brand-brown-500 hover:text-brand-brown-800 hover:bg-brand-beige-100 rounded-lg dark:text-brand-beige-400 dark:hover:bg-[#3E2315] transition-all"
                >
                  Close
                </button>
                {selectedAnalysis.url && (
                  <a
                    href={selectedAnalysis.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-brand-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-[#E89B60] transition-all shadow-sm"
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