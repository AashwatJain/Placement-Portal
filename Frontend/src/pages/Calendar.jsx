import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, ExternalLink, Loader2,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Google Calendar URL builder ──────────────────────────────
function buildGCalUrl(company, stepName, date) {
  const d = (date || "").replace(/-/g, "");
  if (!d) return "#";
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${company} — ${stepName}`,
    dates: `${d}/${d}`,
    details: `Company: ${company}\nStep: ${stepName}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

// ── Event chip colour by step name ───────────────────────────
function getChipColor(step) {
  if (step.includes("OA"))        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  if (step.includes("Interview")) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  if (step.includes("Decision"))  return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
  if (step.includes("Final"))     return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
  if (step.includes("Shortlist")) return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
}

// ── Sidebar accent bar ───────────────────────────────────────
function getBarColor(step) {
  if (step.includes("OA"))        return "bg-amber-500";
  if (step.includes("Interview")) return "bg-blue-500";
  if (step.includes("Final"))     return "bg-green-500";
  if (step.includes("Decision"))  return "bg-purple-500";
  return "bg-indigo-500";
}

// ── Extract calendar events from applications ────────────────
// Smart rule: only show step N's date if steps 0..N-1 are all done.
function extractEvents(applications) {
  const events = [];
  for (const app of applications) {
    const tl = app.timeline || [];
    for (let i = 0; i < tl.length; i++) {
      const step = tl[i];
      if (!step.date) continue;

      // Check all previous steps are done
      const prevAllDone = tl.slice(0, i).every((s) => s.done);
      if (!prevAllDone) continue;

      events.push({
        id: `${app.id}-${i}`,
        appId: app.id,
        company: app.company,
        role: app.role,
        step: step.step,
        date: step.date,
        done: step.done,
      });
    }
  }
  return events;
}

export default function Calendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live listener on user's applications
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsub = onValue(ref(db, `users/${user.uid}/applications`), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setApplications(Object.entries(data).map(([id, v]) => ({ id, ...v })));
      } else {
        setApplications([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const events = extractEvents(applications);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const fmtKey = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isToday = (d) => {
    const t = new Date();
    return d === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const eventsForDay = (day) => events.filter((e) => e.date === fmtKey(day));

  // Sidebar: upcoming events
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = [...events].filter((e) => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const sidebarEvents = upcoming.length >= 3
    ? upcoming
    : [
        ...upcoming,
        ...[...events].filter((e) => e.date < todayStr).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6 - upcoming.length),
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Placement Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400">Your application timeline events synced automatically.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
          <span className="min-w-[140px] text-center font-semibold text-slate-800 dark:text-slate-100">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          <button onClick={goToToday} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Today</button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading your calendar...
        </div>
      )}

      {!loading && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
              {DAYS.map((d) => (
                <div key={d} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`e-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30 p-2 dark:border-slate-700/50 dark:bg-slate-900/20" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = eventsForDay(day);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={day}
                    className={`group min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30 ${isTodayDate ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-white dark:bg-slate-800"}`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${isTodayDate ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"}`}>
                      {day}
                    </span>
                    <div className="mt-2 space-y-1">
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => navigate("/student/applications")}
                          className={`cursor-pointer truncate rounded px-1.5 py-0.5 text-[10px] font-medium border transition-transform hover:scale-[1.02] ${getChipColor(ev.step)}`}
                          title={`${ev.company} — ${ev.step}`}
                        >
                          {ev.company}: {ev.step}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 h-fit">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
              <CalendarIcon size={20} className="text-amber-500" /> Upcoming Steps
            </h2>

            {sidebarEvents.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No upcoming events. Register for opportunities!</p>
            )}

            <div className="space-y-4">
              {sidebarEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="relative flex gap-4 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 transition cursor-pointer"
                  onClick={() => navigate("/student/applications")}
                >
                  <div className="flex flex-col items-center justify-center rounded bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    <span className="text-xs font-bold uppercase">{new Date(ev.date + "T00:00:00").toLocaleString("default", { month: "short" })}</span>
                    <span className="text-lg font-bold">{new Date(ev.date + "T00:00:00").getDate()}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ev.company}</h3>
                    <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {ev.step}</span>
                      <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${getChipColor(ev.step)}`}>
                        {ev.done ? "Completed" : "Upcoming"}
                      </span>
                    </div>
                  </div>

                  <a
                    href={buildGCalUrl(ev.company, ev.step, ev.date)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Save to Google Calendar"
                    className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all"
                  >
                    <ExternalLink size={14} />
                  </a>

                  <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${getBarColor(ev.step)}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}