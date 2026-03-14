import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchAllStudents } from "../../services/adminApi";
import { fetchShortlistedIds, saveShortlistedIds } from "../../services/recruiterApi";
import {
  Star, FileText, ExternalLink, Loader2,
  Code2, Mail, Github, Trash2,
  ArrowLeft, Users,
} from "lucide-react";

export default function ShortlistedCandidates() {
  const { user } = useAuth();
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [students, ids] = await Promise.all([
          fetchAllStudents(),
          user?.uid ? fetchShortlistedIds(user.uid).catch(() => []) : [],
        ]);
        setAllStudents(students);
        setShortlisted(Array.isArray(ids) ? ids : []);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const removeFromShortlist = (id) => {
    setShortlisted((prev) => {
      const next = prev.filter((x) => x !== id);
      if (user?.uid) saveShortlistedIds(user.uid, next).catch(console.error);
      return next;
    });
  };

  const shortlistedStudents = allStudents.filter((s) => shortlisted.includes(s.id));

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400 animate-pulse">Loading shortlisted candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <Link
          to="/recruiter"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mb-3"
        >
          <ArrowLeft size={16} /> Back to Search
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Star size={22} className="text-amber-500 fill-amber-500" /> Shortlisted Candidates
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {shortlistedStudents.length} candidate{shortlistedStudents.length !== 1 ? "s" : ""} in your shortlist
        </p>
      </div>

      {/* List */}
      {shortlistedStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <Users size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No candidates shortlisted yet</p>
          <p className="text-sm mt-1 text-slate-400">Star candidates from the search page to add them here.</p>
          <Link
            to="/recruiter"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm"
          >
            Browse Candidates
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {shortlistedStudents.map((s) => {
            const displayName = s.fullName || s.email?.split("@")[0] || "Unknown";
            const initial = displayName.charAt(0).toUpperCase();
            const cgpaNum = parseFloat(s.cgpa);

            return (
              <div key={s.id} className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden ring-1 ring-amber-100/50 dark:ring-amber-900/20">
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  {s.avatarUrl ? (
                    <img src={s.avatarUrl} alt={displayName} className="h-11 w-11 rounded-full object-cover shadow-md ring-2 ring-white dark:ring-slate-800" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-800">
                      {initial}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {s.branch && <span>{s.branch}</span>}
                      {s.branch && s.year && <span className="text-slate-300 dark:text-slate-600">·</span>}
                      {s.year && <span>Batch {s.year}</span>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-2">
                    {s.cgpa && (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                        cgpaNum >= 8.5 ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800"
                        : cgpaNum >= 7 ? "text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800"
                        : "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                      }`}>
                        {cgpaNum ? cgpaNum.toFixed(1) : s.cgpa} CGPA
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all" title="Send email">
                        <Mail size={16} />
                      </a>
                    )}
                    {s.primaryResumeUrl && (
                      <a href={s.primaryResumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 transition-all" title="Download resume">
                        <FileText size={16} />
                      </a>
                    )}
                    {s.github && (
                      <a href={s.github.startsWith("http") ? s.github : `https://github.com/${s.github}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-all" title="GitHub">
                        <Github size={16} />
                      </a>
                    )}
                    <button onClick={() => removeFromShortlist(s.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all" title="Remove from shortlist">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

