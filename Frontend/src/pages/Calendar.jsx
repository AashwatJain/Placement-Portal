import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { MOCK_EVENTS } from "../data/mockData";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper: Get days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Helper: Get which day of the week the month starts (0 = Sun, 1 = Mon...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Helper: Format date for comparison (YYYY-MM-DD)
  const formatDateKey = (d) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // Helper: Check if a date is Today
  const isToday = (d) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Navigation Handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter Events for current view
  const getEventsForDay = (day) => {
    const dateKey = formatDateKey(day);
    return MOCK_EVENTS.filter(e => e.date === dateKey);
  };

  // Event Type Color Mapping
  const getEventColor = (type) => {
    if (type?.toLowerCase().includes("interview")) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    if (type?.toLowerCase().includes("deadline")) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Placement Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400">Track deadlines, OAs, and interview schedules.</p>
        </div>
        
        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
            <ChevronLeft size={20} />
          </button>
          <span className="min-w-[140px] text-center font-semibold text-slate-800 dark:text-slate-100">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
            <ChevronRight size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button onClick={goToToday} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
            Today
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Main Calendar Grid (2 Columns wide) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
            {DAYS.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Empty slots for previous month days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30 p-2 dark:border-slate-700/50 dark:bg-slate-900/20"></div>
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = getEventsForDay(day);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day} 
                  className={`group min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30 ${
                    isTodayDate ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span 
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                        isTodayDate 
                          ? "bg-blue-600 text-white" 
                          : "text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  
                  {/* Event Chips */}
                  <div className="mt-2 space-y-1">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium border ${getEventColor(ev.type)}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming List */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 h-fit">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
            <CalendarIcon size={20} className="text-amber-500" /> Upcoming Events
          </h2>
          <div className="space-y-4">
            {MOCK_EVENTS.slice(0, 5).map((ev) => (
              <div key={ev.id} className="relative flex gap-4 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 transition">
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center rounded bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <span className="text-xs font-bold uppercase">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg font-bold">{new Date(ev.date).getDate()}</span>
                </div>
                
                {/* Details */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{ev.title}</h3>
                  <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                       <Clock size={12} /> {ev.type}
                    </span>
                    <span className="flex items-center gap-1">
                       <MapPin size={12} /> {ev.company || "Online"}
                    </span>
                  </div>
                </div>
                
                {/* Type Indicator Line */}
                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                   ev.type?.includes("Interview") ? "bg-blue-500" : ev.type?.includes("Deadline") ? "bg-red-500" : "bg-amber-500"
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}