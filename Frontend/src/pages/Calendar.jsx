import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { onUserApplications } from "../services/firebaseDb";
import { fetchOpportunities } from "../services/studentApi";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, ExternalLink, Loader2, Briefcase, LayoutGrid, Rows3,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Color config by step type ────────────────────────────────
const STEP_COLORS = {
  OA:        { chip: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800", bar: "bg-amber-500", dot: "bg-amber-500" },
  Interview: { chip: "bg-brand-amber-500/20 text-brand-amber-600 border-brand-amber-500/30 dark:bg-blue-900/30 dark:text-brand-amber-500/40 dark:border-brand-amber-700", bar: "bg-brand-amber-500/100", dot: "bg-brand-amber-500/100" },
  Decision:  { chip: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800", bar: "bg-purple-500", dot: "bg-purple-500" },
  Final:     { chip: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800", bar: "bg-green-500", dot: "bg-green-500" },
  Shortlist: { chip: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  Default:   { chip: "bg-brand-amber-500/20 text-brand-amber-600 border-brand-amber-500/30 dark:bg-brand-amber-800/30 dark:text-brand-amber-500/40 dark:border-brand-amber-700", bar: "bg-brand-amber-500/100", dot: "bg-brand-amber-500/100" },
};

function getStepType(step) {
  if (step.includes("OA")) return "OA";
  if (step.includes("Interview")) return "Interview";
  if (step.includes("Decision")) return "Decision";
  if (step.includes("Final")) return "Final";
  if (step.includes("Shortlist")) return "Shortlist";
  return "Default";
}
function getColors(step) { return STEP_COLORS[getStepType(step)] || STEP_COLORS.Default; }

// ── Google Calendar URL ──────────────────────────────────────
function buildGCalUrl(company, stepName, date) {
  const d = (date || "").replace(/-/g, "");
  if (!d) return "#";
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE", text: `${company} — ${stepName}`, dates: `${d}/${d}`,
    details: `Company: ${company}\nStep: ${stepName}`,
  })}`;
}

// ── Extract events from applications ─────────────────────────
function extractEvents(applications, isAdmin = false) {
  const events = [];
  const seen = new Set(); // de-duplicate by company+step+date
  for (const app of applications) {
    if (app.status === "Rejected") continue;
    const tl = app.timeline || [];
    for (let i = 0; i < tl.length; i++) {
      const step = tl[i];
      if (!step.date) continue;

      // De-duplicate: for admin, many students may have the same company+step+date
      const dedupeKey = `${app.company}|${step.step}|${step.date}`;
      if (isAdmin && seen.has(dedupeKey)) continue;
      if (isAdmin) seen.add(dedupeKey);

      // For students, hide very old events (>14 days ago) unless done
      if (!isAdmin) {
        const eventDate = new Date(step.date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < -14 && !step.done) continue;
      }

      events.push({
        id: `${app.id}-${i}`,
        appId: app.id, company: app.company, role: app.role,
        step: step.step, date: step.date, done: step.done,
      });
    }
  }
  return events;
}

// ── Days until helper ────────────────────────────────────────
function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00"); target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

// ══════════════════════════════════════════════════════════════
export default function Calendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("month"); // "month" | "week"
  const [selectedDay, setSelectedDay] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }

    const role = user.role || user.accountType || "student";

    if (role === "admin") {
      setIsAdmin(true);
      // Admin: fetch all opportunities and build calendar events from their schedules
      (async () => {
        try {
          const opps = await fetchOpportunities();

          const allApps = opps.map(opp => {
            const timeline = [];
            const companyName = opp.name || opp.company || opp.title || "Unknown";

            // 1. Add any top-level date fields as events
            const dateFields = [
              { key: "deadline",            step: "Application Deadline" },
              { key: "oaDate",              step: "OA" },
              { key: "resumeShortlistDate", step: "Shortlist" },
              { key: "interviewDate",       step: "Interview" },
              { key: "offerDate",           step: "Decision" },
              { key: "joiningDate",         step: "Final" },
            ];
            for (const { key, step } of dateFields) {
              if (opp[key]) {
                timeline.push({ step, date: opp[key], done: false });
              }
            }

            // 2. Add all round schedule dates
            const rounds = opp.rounds || [];
            for (const r of rounds) {
              const date = r.date || r.expectedDate || null;
              if (date) {
                timeline.push({
                  step: r.name || r.step || r.round || "Round",
                  date,
                  done: r.done || false,
                });
              }
            }

            return {
              id: opp.id,
              company: companyName,
              role: opp.roles || opp.role || "",
              status: opp.status || "Active",
              timeline,
            };
          });

          setApplications(allApps);
        } catch (err) {
          console.error("Failed to fetch calendar data:", err);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    // Student: personal applications
    const unsub = onUserApplications(user.uid, (apps) => {
      setApplications(apps || []);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid, user?.role, user?.accountType]);

  const events = extractEvents(applications, isAdmin);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const fmtKey = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isToday = (y, m, d) => {
    const t = new Date();
    return d === t.getDate() && m === t.getMonth() && y === t.getFullYear();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const eventsForDay = (day) => events.filter((e) => e.date === fmtKey(year, month, day));

  // Month event counts for stats bar
  const monthEvents = events.filter((e) => {
    const ed = new Date(e.date + "T00:00:00");
    return ed.getMonth() === month && ed.getFullYear() === year;
  });
  const monthStats = {};
  monthEvents.forEach((e) => {
    const t = getStepType(e.step);
    monthStats[t] = (monthStats[t] || 0) + 1;
  });

  // Sidebar: upcoming events
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = [...events]
    .filter((e) => e.date >= todayStr && !e.done)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  // Week view: derive 7-day window for the selected week
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };
  const weekDays = getWeekDays();
  const prevWeek = () => setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
  const nextWeek = () => setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));

  // Selected day events
  const selectedDayEvents = selectedDay
    ? events.filter((e) => e.date === selectedDay)
    : [];

  // Batch GCal export URL
  const buildBatchGCalUrl = () => {
    if (upcoming.length === 0) return "#";
    // Google Calendar only supports single event links, so open first one
    return buildGCalUrl(upcoming[0].company, upcoming[0].step, upcoming[0].date);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white">Placement Calendar</h1>
          <p className="text-brand-brown-600 dark:text-brand-beige-400 text-sm">
            Your application timeline events synced automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-brand-beige-200 bg-white p-0.5 dark:border-[#5A3D2B] dark:bg-[#2A1810]">
            <button
              onClick={() => setViewMode("month")}
              className={`rounded-md p-1.5 transition-colors ${viewMode === "month" ? "bg-brand-amber-500/20 text-brand-amber-500 dark:bg-brand-amber-800/30 dark:text-brand-amber-500" : "text-brand-brown-400 hover:text-brand-brown-600 dark:hover:text-brand-beige-300"}`}
              title="Month view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`rounded-md p-1.5 transition-colors ${viewMode === "week" ? "bg-brand-amber-500/20 text-brand-amber-500 dark:bg-brand-amber-800/30 dark:text-brand-amber-500" : "text-brand-brown-400 hover:text-brand-brown-600 dark:hover:text-brand-beige-300"}`}
              title="Week view"
            >
              <Rows3 size={16} />
            </button>
          </div>

          {/* Month/Week navigation */}
          <div className="flex items-center gap-1 rounded-xl border border-brand-beige-200 bg-white p-1 shadow-sm dark:border-[#5A3D2B] dark:bg-[#2A1810]">
            <button onClick={viewMode === "month" ? prevMonth : prevWeek} className="rounded-lg p-2 hover:bg-brand-beige-100 dark:text-brand-beige-300 dark:hover:bg-brand-brown-700">
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-brand-brown-800 dark:text-brand-beige-100">
              {viewMode === "month"
                ? `${MONTHS[month]} ${year}`
                : `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </span>
            <button onClick={viewMode === "month" ? nextMonth : nextWeek} className="rounded-lg p-2 hover:bg-brand-beige-100 dark:text-brand-beige-300 dark:hover:bg-brand-brown-700">
              <ChevronRight size={18} />
            </button>
            <div className="h-5 w-px bg-brand-beige-200 dark:bg-brand-brown-700 mx-0.5" />
            <button onClick={goToToday} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-brown-600 hover:bg-brand-beige-100 dark:text-brand-beige-300 dark:hover:bg-brand-brown-700">
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Month stats bar */}
      {Object.keys(monthStats).length > 0 && viewMode === "month" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-beige-200 bg-white px-4 py-2.5 text-xs font-medium text-brand-brown-600 shadow-sm dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-brand-beige-300">
          <CalendarIcon size={14} className="text-brand-brown-400" />
          <span className="text-brand-brown-400">This month:</span>
          {Object.entries(monthStats).map(([type, count]) => (
            <span key={type} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${STEP_COLORS[type]?.dot || "bg-brand-brown-400"}`} />
              {count} {type}{count > 1 ? "s" : ""}
            </span>
          ))}
          <span className="text-brand-brown-400">·</span>
          <span className="font-bold text-brand-brown-800 dark:text-white">{monthEvents.length} total</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20 text-brand-brown-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading your calendar...
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Calendar Grid ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-brand-beige-200 bg-white shadow-sm dark:border-[#5A3D2B] dark:bg-[#2A1810] overflow-hidden">
              {viewMode === "month" ? (
                /* ── MONTH VIEW ── */
                <>
                  <div className="grid grid-cols-7 border-b border-brand-beige-200 dark:border-[#5A3D2B]">
                    {DAYS.map((d) => (
                      <div key={d} className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-brand-cream-500 dark:text-brand-beige-400">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 auto-rows-fr">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-brand-beige-100 bg-brand-cream-50/30 p-1.5 dark:border-[#5A3D2B]/50 dark:bg-[#1A0F08]/20" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dayEvents = eventsForDay(day);
                      const isTodayDate = isToday(year, month, day);
                      const dateKey = fmtKey(year, month, day);
                      const isSelected = selectedDay === dateKey;

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                          className={`group min-h-[80px] border-b border-r border-brand-beige-100 p-1.5 transition-colors cursor-pointer dark:border-[#5A3D2B]/50 ${
                            isSelected ? "bg-brand-amber-500/10 dark:bg-brand-amber-800/20 ring-1 ring-brand-amber-500/40 dark:ring-brand-amber-600" :
                            isTodayDate ? "bg-brand-amber-500/10/50 dark:bg-blue-900/10" :
                            "bg-white dark:bg-[#2A1810] hover:bg-brand-cream-50 dark:hover:bg-brand-brown-700/30"
                          }`}
                        >
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            isTodayDate
                              ? "bg-brand-amber-500 text-white shadow-sm shadow-brand-amber-500/100/30 ring-2 ring-brand-amber-500/40 dark:ring-brand-amber-600"
                              : "text-brand-brown-700 dark:text-brand-beige-300 group-hover:bg-brand-beige-200 dark:group-hover:bg-brand-brown-600"
                          }`}>
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayEvents.slice(0, 2).map((ev) => {
                              const colors = getColors(ev.step);
                              const days = daysUntil(ev.date);
                              return (
                                <div
                                  key={ev.id}
                                  className={`relative truncate rounded px-1 py-0.5 text-[9px] font-medium border transition-transform hover:scale-[1.02] ${colors.chip}`}
                                  title={`${ev.company} — ${ev.step}`}
                                >
                                  {/* Urgency dot */}
                                  {!ev.done && days >= 0 && days <= 3 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                    </span>
                                  )}
                                  {!ev.done && days > 3 && days <= 7 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />
                                  )}
                                  {ev.company.split(" ")[0]}: {ev.step.split(" ")[0]}
                                </div>
                              );
                            })}
                            {dayEvents.length > 2 && (
                              <div className="text-[9px] font-bold text-brand-brown-400 pl-1">+{dayEvents.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* ── WEEK VIEW ── */
                <div>
                  <div className="grid grid-cols-7 border-b border-brand-beige-200 dark:border-[#5A3D2B]">
                    {weekDays.map((wd) => {
                      const isTodayDate = isToday(wd.getFullYear(), wd.getMonth(), wd.getDate());
                      return (
                        <div key={wd.toISOString()} className={`py-2.5 text-center ${isTodayDate ? "bg-brand-amber-500/10 dark:bg-blue-900/10" : ""}`}>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-cream-500 dark:text-brand-beige-400">
                            {DAYS[wd.getDay()]}
                          </div>
                          <div className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                            isTodayDate ? "bg-brand-amber-500 text-white" : "text-brand-brown-700 dark:text-brand-beige-300"
                          }`}>
                            {wd.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-7 min-h-[200px]">
                    {weekDays.map((wd) => {
                      const dateKey = fmtKey(wd.getFullYear(), wd.getMonth(), wd.getDate());
                      const dayEvts = events.filter((e) => e.date === dateKey);
                      const isSelected = selectedDay === dateKey;
                      return (
                        <div
                          key={wd.toISOString()}
                          onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                          className={`border-r border-brand-beige-100 dark:border-[#5A3D2B]/50 p-2 cursor-pointer transition-colors ${
                            isSelected ? "bg-brand-amber-500/10 dark:bg-brand-amber-800/20" : "hover:bg-brand-cream-50 dark:hover:bg-brand-brown-700/30"
                          }`}
                        >
                          <div className="space-y-1.5">
                            {dayEvts.map((ev) => {
                              const colors = getColors(ev.step);
                              const days = daysUntil(ev.date);
                              return (
                                <div key={ev.id} className={`relative rounded-lg px-2 py-1.5 text-[10px] font-medium border ${colors.chip}`}>
                                  {!ev.done && days >= 0 && days <= 3 && (
                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                                    </span>
                                  )}
                                  <div className="font-bold truncate">{ev.company}</div>
                                  <div className="text-[9px] opacity-75">{ev.step}</div>
                                </div>
                              );
                            })}
                            {dayEvts.length === 0 && (
                              <div className="text-[9px] text-brand-beige-300 dark:text-brand-brown-600 text-center pt-4">—</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Color Legend ── */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-brand-beige-200 bg-white px-4 py-2.5 text-[11px] dark:border-[#5A3D2B] dark:bg-[#2A1810]">
              {[
                { label: "OA", type: "OA" },
                { label: "Interview", type: "Interview" },
                { label: "Decision", type: "Decision" },
                { label: "Shortlist", type: "Shortlist" },
                { label: "Final", type: "Final" },
              ].map(({ label, type }) => (
                <span key={type} className="flex items-center gap-1.5 text-brand-brown-600 dark:text-brand-beige-300">
                  <span className={`h-2.5 w-2.5 rounded-full ${STEP_COLORS[type].dot}`} />
                  <span className="font-medium">{label}</span>
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-brand-brown-600 dark:text-brand-beige-300">
                <span className="flex h-2.5 w-2.5"><span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-red-400 opacity-50" /><span className="relative h-2.5 w-2.5 rounded-full bg-red-500" /></span>
                <span className="font-medium ml-1">≤3 days</span>
              </span>
              <span className="flex items-center gap-1.5 text-brand-brown-600 dark:text-brand-beige-300">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-medium">≤7 days</span>
              </span>
            </div>

            {/* Empty state */}
            {events.length === 0 && (
              <div className="rounded-xl border border-dashed border-brand-beige-300 bg-brand-cream-50/50 dark:border-[#5A3D2B] dark:bg-[#2A1810]/50 p-8 text-center">
                <Briefcase size={36} className="mx-auto mb-3 text-brand-beige-300 dark:text-brand-brown-600" />
                <p className="text-sm font-medium text-brand-brown-600 dark:text-brand-beige-300">No events on your calendar yet</p>
                <p className="mt-1 text-xs text-brand-brown-400 dark:text-brand-beige-500">
                  {(user?.role || user?.accountType) === "admin"
                    ? "Add companies with timeline dates and they'll appear here automatically."
                    : "Register for opportunities and your timeline will appear here automatically."}
                </p>
                <Link
                  to={(user?.role || user?.accountType) === "admin" ? "/admin/companies" : "/student/opportunities"}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-amber-600 transition-all shadow-sm"
                >
                  <Briefcase size={14} /> {(user?.role || user?.accountType) === "admin" ? "Manage Companies" : "Browse Opportunities"}
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Selected day detail */}
            {selectedDay && selectedDayEvents.length > 0 && (
              <div className="rounded-xl border border-brand-amber-500/30 bg-brand-amber-500/10/50 p-4 shadow-sm dark:border-brand-amber-800/50 dark:bg-brand-amber-900/20">
                <h3 className="mb-3 text-sm font-bold text-brand-amber-800 dark:text-brand-amber-500/40 flex items-center gap-2">
                  <CalendarIcon size={16} className="text-brand-amber-500/100" />
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => {
                    const colors = getColors(ev.step);
                    const days = daysUntil(ev.date);
                    return (
                      <div key={ev.id} className="relative flex gap-3 rounded-lg border border-brand-amber-500/20 dark:border-brand-amber-800 bg-white dark:bg-[#1A0F08] p-3">
                        <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${colors.bar}`} />
                        <div className="flex-1 min-w-0 pl-2">
                          <h4 className="text-sm font-semibold text-brand-brown-900 dark:text-white">{ev.company}</h4>
                          <p className="text-xs text-brand-cream-500 dark:text-brand-beige-400">{ev.step} · {ev.role || "SDE"}</p>
                          {!ev.done && days >= 0 && days <= 3 && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                              🔴 {days === 0 ? "Today!" : `${days}d left`}
                            </span>
                          )}
                        </div>
                        <a
                          href={buildGCalUrl(ev.company, ev.step, ev.date)}
                          target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-lg border border-brand-beige-200 bg-white text-brand-cream-500 hover:border-brand-amber-500/40 hover:bg-brand-amber-500/10 hover:text-brand-amber-500 dark:border-[#7A543A] dark:bg-[#2A1810] dark:hover:border-brand-amber-600 dark:hover:bg-blue-900/30 transition-all"
                          title="Add to Google Calendar"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming steps */}
            <div className="rounded-xl border border-brand-beige-200 bg-white p-4 shadow-sm dark:border-[#5A3D2B] dark:bg-[#2A1810] h-fit">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-brand-brown-800 dark:text-white">
                  <CalendarIcon size={18} className="text-amber-500" /> Upcoming
                </h2>
                {upcoming.length > 0 && (
                  <a
                    href={buildBatchGCalUrl()}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-bold text-brand-amber-500 hover:text-brand-amber-600 dark:text-brand-amber-500 flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> Add to GCal
                  </a>
                )}
              </div>

              {upcoming.length === 0 && (
                <p className="text-sm text-brand-cream-500 text-center py-4">No upcoming events. Register for opportunities!</p>
              )}

              <div className="space-y-3">
                {upcoming.map((ev) => {
                  const colors = getColors(ev.step);
                  const days = daysUntil(ev.date);
                  return (
                    <div
                      key={ev.id}
                      className="relative flex gap-3 rounded-lg border border-brand-beige-100 p-2.5 hover:bg-brand-cream-50 dark:border-[#5A3D2B] dark:hover:bg-brand-brown-700/50 transition cursor-pointer"
                      onClick={() => navigate((user?.role || user?.accountType) === "admin" ? "/admin/students" : "/student/applications")}
                    >
                      <div className="flex flex-col items-center justify-center rounded bg-brand-beige-100 px-2.5 py-1 text-brand-brown-600 dark:bg-brand-brown-700 dark:text-brand-beige-300">
                        <span className="text-[9px] font-bold uppercase">{new Date(ev.date + "T00:00:00").toLocaleString("default", { month: "short" })}</span>
                        <span className="text-base font-bold">{new Date(ev.date + "T00:00:00").getDate()}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-brand-brown-900 dark:text-white truncate">{ev.company}</h3>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-brand-cream-500 dark:text-brand-beige-400">
                          <Clock size={10} /> {ev.step}
                        </div>
                        {days >= 0 && days <= 3 ? (
                          <span className="mt-1 inline-flex rounded-full bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
                            {days === 0 ? "Today!" : `${days}d left`}
                          </span>
                        ) : days > 3 && days <= 7 ? (
                          <span className="mt-1 inline-flex rounded-full bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                            {days}d left
                          </span>
                        ) : null}
                      </div>

                      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${colors.bar}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}