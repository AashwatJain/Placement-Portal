import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Video,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronRight,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { fetchActiveDrives, extendDriveTime, endDrive } from "../../services/recruiterApi";

export default function ActiveDrives() {
  const [activeDrives, setActiveDrives] = useState([]);
  const [currentDrive, setCurrentDrive] = useState(null);
  const [driveStats, setDriveStats] = useState({ totalEligible: 0, loggedIn: 0, pending: 0 });
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExtending, setIsExtending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const drives = await fetchActiveDrives();
      setActiveDrives(drives);
      if (drives.length > 0) {
        const drive = drives[0];
        setCurrentDrive(drive);
        
        // Setup countdown based on start time and duration
        const startTimeMs = drive.startTime ? (drive.startTime._seconds ? drive.startTime._seconds * 1000 : drive.startTime) : Date.now();
        const durationSeconds = drive.durationMinutes * 60;
        const elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
        let remaining = durationSeconds - elapsedSeconds;
        setTimeRemaining(remaining > 0 ? remaining : 0);

        // Fetch Attendance from RTDB (Using REST API for now to avoid setting up new SDK client logic here, 
        // ideally this is a real-time listener if we have client-side Firebase configured)
        // For this demo, we can just hit the Realtime Database via a simplified direct fetch or a backend wrapper
        // Since we didn't build a backend endpoint for attendance yet, we can mock the fetch or use the DB URL
        const attendanceRes = await fetch(`https://placement-portal-c0bdf-default-rtdb.firebaseio.com/drive_attendance/${drive.id}.json`);
        const attendanceData = await attendanceRes.json();
        
        if (attendanceData) {
            setDriveStats({
                totalEligible: attendanceData.totalEligible || 0,
                loggedIn: attendanceData.loggedIn || 0,
                pending: attendanceData.pending || 0
            });
            
            if (attendanceData.students) {
                const studentsArray = Object.entries(attendanceData.students).map(([uid, data]) => ({
                    id: uid,
                    ...data
                }));
                setRoster(studentsArray);
            }
        }
      }
    } catch (error) {
      console.error("Failed to fetch drives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const extendTime = async () => {
    if (!currentDrive) return;
    setIsExtending(true);
    try {
        await extendDriveTime(currentDrive.id, 15);
        setTimeRemaining(prev => prev + 15 * 60);
        alert("Extended time by 15 minutes");
    } catch(err) {
        console.error(err);
        alert("Failed to extend time");
    } finally {
        setIsExtending(false);
    }
  };

  const downloadList = () => {
    alert("Downloading live attendance list...");
  };

  const handleEndDrive = () => {
    setShowEndModal(true);
  };

  const confirmEndDrive = async () => {
    if(!currentDrive) return;
    try {
      await endDrive(currentDrive.id);
      setShowEndModal(false);
      alert("Drive Ended!");
      fetchDrives(); // Refresh data
    } catch (err) {
      console.error(err);
      alert("Failed to end drive");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Active</span>;
      case 'submitted':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30"><CheckCircle size={12}/>Submitted</span>;
      case 'not_started':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20"><span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>Not Started</span>;
      case 'alert':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"><AlertTriangle size={12}/>Alert (Conn Lost)</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading Active Drives...</p>
        </div>
      </div>
    );
  }

  if (!currentDrive) {
    return (
      <div className="space-y-6 pb-10">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/recruiter" className="hover:text-slate-900 dark:hover:text-white transition-colors">Recruiter</Link></li>
            <li><ChevronRight size={14} /></li>
            <li className="font-semibold text-slate-900 dark:text-white" aria-current="page">Active Drives</li>
          </ol>
        </nav>
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <Video size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Drives</h2>
          <p className="text-slate-500 dark:text-slate-400">There are no ongoing drives for your company at the moment.</p>
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
          <li className="font-semibold text-slate-900 dark:text-white" aria-current="page">Active Drives</li>
        </ol>
      </nav>

      {/* ── TOP BANNER ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="h-2 w-full bg-gradient-to-r from-red-500 to-rose-600"></div>
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-500/20 animate-pulse">
              <Video size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">LIVE: {currentDrive.companyName} {currentDrive.roundName}</h1>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Started • Round in Progress</p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5"><Clock size={12}/> Time Remaining</span>
            <span className={`text-3xl font-black font-mono tracking-tight ${timeRemaining < 1800 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── LEFT PANE: METRICS ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Users size={16} className="text-indigo-500"/> Attendance Overview
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              
              {/* Pseudo Donut Chart */}
              <div className="relative h-40 w-40 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full rotate-[-90deg]">
                  <path
                    className="stroke-slate-100 dark:stroke-slate-800"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" strokeWidth="4"
                  />
                  <path
                    className="stroke-emerald-500"
                    strokeDasharray={`${(driveStats.loggedIn / driveStats.totalEligible) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" strokeWidth="4"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round((driveStats.loggedIn / driveStats.totalEligible) * 100)}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</span>
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Eligible</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{driveStats.totalEligible}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Logged In / Testing</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{driveStats.loggedIn}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Absent / Pending</p>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{driveStats.pending}</p>
                    </div>
                    <AlertTriangle size={24} className="text-amber-500 opacity-50"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANE: ACTION PANEL ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <button onClick={extendTime} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800/30">
                <Clock size={16} />
                Extend Time by 15 Mins
              </button>
              
              <button onClick={downloadList} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 shadow-sm">
                <Download size={16} />
                Download Live Attendance List
              </button>

              <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>

              <button onClick={handleEndDrive} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-4 text-sm font-bold text-white hover:bg-red-700 shadow-md transition-all hover:shadow-lg focus:ring-4 focus:ring-red-500/20 dark:bg-red-600 dark:hover:bg-red-500">
                <XCircle size={18} />
                END DRIVE NOW
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Need Immediate Help?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">If you're facing technical issues or need to reach out to the TnP Cell regarding this ongoing drive.</p>
            <Link to="/recruiter/messages" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
              Open TnP Connect
            </Link>
          </div>
        </div>

      </div>

      {/* ── BOTTOM PANE: ROSTER ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Candidate Roster</h2>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {roster.length} Total
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Candidate Name</th>
                <th scope="col" className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Roll Number</th>
                <th scope="col" className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Branch</th>
                <th scope="col" className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Current Status</th>
                <th scope="col" className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {roster.map((student) => (
                <tr key={student.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${student.status === 'alert' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <UserIcon size={14}/>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{student.rollNo}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.branch}</td>
                  <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── END DRIVE MODAL ── */}
      {showEndModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">End This Drive?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to completely end the <strong>Microsoft Online Coding Assessment</strong>? This action cannot be undone and will forcefully close all active student sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowEndModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmEndDrive}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-sm transition-colors"
              >
                Yes, End Drive
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
