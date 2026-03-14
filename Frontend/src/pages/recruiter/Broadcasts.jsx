import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchBroadcasts, createBroadcast } from "../../services/recruiterApi";
import {
  Megaphone, Plus, ChevronRight, Clock,
  AlertTriangle, Info, Loader2, X, Send,
} from "lucide-react";

const URGENCY_CONFIG = {
  normal:  { label: "Normal",  color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",    icon: <Info size={14} /> },
  important: { label: "Important", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800", icon: <AlertTriangle size={14} /> },
  urgent:  { label: "Urgent",  color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",      icon: <AlertTriangle size={14} /> },
};

export default function Broadcasts() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", urgency: "normal" });

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      const data = await fetchBroadcasts();
      setBroadcasts(data);
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const newBroadcast = await createBroadcast({
        title: form.title.trim(),
        body: form.body.trim(),
        urgency: form.urgency,
        recruiterName: user?.companyName || user?.fullName || "Recruiter",
        recruiterId: user?.uid || "unknown",
      });
      setBroadcasts(prev => [newBroadcast, ...prev]);
      setForm({ title: "", body: "", urgency: "normal" });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create broadcast:", err);
      alert("Failed to post broadcast. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading Broadcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* ── BREADCRUMBS ── */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <Link to="/recruiter" className="hover:text-slate-900 dark:hover:text-white transition-colors">Recruiter</Link>
          </li>
          <li><ChevronRight size={14} /></li>
          <li className="font-semibold text-slate-900 dark:text-white" aria-current="page">Broadcasts</li>
        </ol>
      </nav>

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone size={24} className="text-indigo-500" /> Broadcasts
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Post campus-wide announcements for students and TnP Cell.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Broadcast</>}
        </button>
      </div>

      {/* ── CREATE FORM ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm dark:border-indigo-900/30 dark:bg-indigo-900/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Microsoft drive rescheduled to 3 PM"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Message Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Provide details about this announcement..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Urgency</label>
              <div className="flex gap-2">
                {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, urgency: key }))}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold border transition-all ${
                      form.urgency === key
                        ? config.color + " ring-2 ring-offset-1 ring-indigo-300 dark:ring-indigo-600"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ml-auto pt-5">
              <button
                type="submit"
                disabled={submitting || !form.title.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Post Broadcast
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── BROADCAST LIST ── */}
      {broadcasts.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <Megaphone size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Broadcasts Yet</h2>
          <p className="text-slate-500 dark:text-slate-400">Post your first campus-wide announcement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map(broadcast => {
            const urgencyConfig = URGENCY_CONFIG[broadcast.urgency] || URGENCY_CONFIG.normal;
            return (
              <div
                key={broadcast.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${urgencyConfig.color}`}>
                        {urgencyConfig.icon} {urgencyConfig.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {formatDate(broadcast.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{broadcast.title}</h3>
                    {broadcast.body && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {broadcast.body}
                      </p>
                    )}
                    <p className="mt-3 text-[11px] font-medium text-slate-400">
                      Posted by <span className="text-slate-600 dark:text-slate-300">{broadcast.recruiterName}</span>
                    </p>
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
