import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchJafs } from "../../services/adminApi";
import { 
  ArrowLeft, Edit, Users, MapPin, Briefcase, 
  GraduationCap, DollarSign, Clock, AlertCircle,
  CheckCircle2, Building2, Calendar, FileText, Loader2
} from "lucide-react";

export default function JAFDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [jaf, setJaf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDetails() {
      try {
        const jafs = await fetchJafs(user?.companyName);
        const data = jafs.find(j => j.id === id);
        
        if (data) {
          setJaf({
            id: data.id,
            title: data.roles || "Untitled",
            type: data.offerType || "-",
            location: data.location || "Remote",
            status: data.status || "Draft",
            applicants: data.applicantsCount || 0,
            shortlisted: data.shortlistedCount || 0,
            deadline: data.lastDate || "TBA",
            description: data.description || "No description provided.",
            companyName: data.name || "Unknown Company",
            eligibility: {
              branches: data.branches ? data.branches.split(", ") : [],
              minCgpa: data.cgpaCutoff || 0,
              maxBacklogs: data.backlogs || 0
            },
            compensation: {
              basePay: data.basePay || "-",
              ctc: data.ctc || "-",
              stipend: data.stipend || "-",
              hasBonus: data.hasBonus || false
            },
            skills: data.skills || "",
            brochureUrl: data.brochureUrl || "",
            rounds: data.rounds || [],
            tnpComments: data.tnpComments || []
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getDetails();
  }, [id, user]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 size={12}/> Active</span>;
      case 'Pending TnP Approval': return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><Clock size={12}/> Pending TnP Approval</span>;
      case 'Closed': return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"><AlertCircle size={12}/> Closed</span>;
      default: return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><FileText size={12}/> Draft</span>;
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600"/></div>;
  }

  if (!jaf) {
    return <div className="text-center py-20 font-bold text-slate-500">JAF Document Context Pending or Not Found ({id}).</div>;
  }

  const hasTnpComments = jaf.tnpComments && jaf.tnpComments.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link to="/recruiter/jafs" className="mt-1 flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-sm border border-indigo-200 dark:bg-indigo-900/50 dark:border-indigo-800 dark:text-indigo-400">
                  {jaf.companyName[0].toUpperCase()}
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-0.5">
                   <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{jaf.companyName}</span>
                   {getStatusBadge(jaf.status)}
                 </div>
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{jaf.title}</h1>
               </div>
            </div>
            <p className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 pl-1">
              <span className="flex items-center gap-1.5"><MapPin size={16}/> {jaf.location}</span>
              <span className="text-[10px] tracking-wider uppercase opacity-60 bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">ID: {id.slice(-6)}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pl-14 sm:pl-0 flex-wrap">
          <button onClick={() => navigate(`/recruiter/jafs/edit/${id}`)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all">
            <Edit size={16}/> Edit
          </button>
          <button 
            onClick={() => navigate(`/recruiter?jobId=${jaf.id}`)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            <Users size={16}/> View {jaf.applicants} Applicants
          </button>
        </div>
      </div>

      {/* ── TNP COMMUNICATION BANNER ── */}
      {hasTnpComments && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10 flex gap-3 items-start">
          <div className="flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-500">
            <AlertCircle size={18}/>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500">TnP Communication ({jaf.status})</h3>
            <div className="mt-2 space-y-2">
              {jaf.tnpComments.map((comment, i) => (
                <div key={i} className="text-sm text-amber-700 dark:text-amber-400/80 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <p className="font-semibold mb-0.5">{comment.author} <span className="text-xs font-normal opacity-70 ml-2">{comment.date}</span></p>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── JOB PREVIEW Layout ── */}
      <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase pt-4 border-t border-slate-200 dark:border-slate-800">Student Preview</h2>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Role Description</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {jaf.description}
            </p>

            {jaf.skills && (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {jaf.skills.split(",").map(skill => skill.trim()).filter(Boolean).map(skill => (
                    <span key={skill} className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">Selection Process</h3>
            <div className="space-y-3">
              {jaf.rounds.map((round, index) => (
                <div key={round.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{round.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5"><Calendar size={12}/> {round.date || "TBD"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          
          {/* Quick Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Overview</h3>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-2"><Briefcase size={16}/> Job Type</span>
                  <span className="font-bold text-slate-900 dark:text-white">{jaf.type}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium flex items-center gap-2"><Clock size={16}/> Deadline</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{jaf.deadline}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-2"><Users size={16}/> Total Applied</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{jaf.applicants.toLocaleString()}</span>
                </div>
             </div>
           </div>

          {/* Attachments */}
          {jaf.brochureUrl && (
            <a href={jaf.brochureUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <FileText size={20}/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Corporate Brochure</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">View detailed Job Description</p>
                </div>
              </div>
            </a>
          )}

          {/* Eligibility */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm dark:border-indigo-900/30 dark:bg-indigo-900/10">
             <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-1.5"><GraduationCap size={16}/> Eligibility Criteria</h3>
             <div className="space-y-3 text-sm">
                <div>
                  <span className="block text-xs text-indigo-500/80 dark:text-indigo-300/60 font-medium mb-1">Allowed Branches</span>
                  <div className="flex flex-wrap gap-1.5">
                    {jaf.eligibility.branches.map(b => (
                      <span key={b} className="rounded bg-white border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700 shadow-sm dark:bg-indigo-900/50 dark:border-indigo-700 dark:text-indigo-300">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="block text-xs text-indigo-500/80 dark:text-indigo-300/60 font-medium mb-0.5">Min CGPA</span>
                  <span className="font-bold text-slate-900 dark:text-white">{jaf.eligibility.minCgpa}</span>
                </div>
                <div className="pt-2">
                  <span className="block text-xs text-indigo-500/80 dark:text-indigo-300/60 font-medium mb-0.5">Max Backlogs</span>
                  <span className="font-bold text-slate-900 dark:text-white">{jaf.eligibility.maxBacklogs}</span>
                </div>
             </div>
          </div>

          {/* Compensation */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-900/10">
             <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5"><DollarSign size={16}/> Compensation</h3>
             <div className="space-y-3 text-sm">
                {jaf.compensation.ctc && jaf.compensation.ctc !== "-" && (
                  <div><span className="block text-xs text-emerald-600/70 font-medium mb-0.5">Total CTC</span><span className="font-bold text-slate-900 dark:text-white">{jaf.compensation.ctc}{String(jaf.compensation.ctc).toLowerCase().includes('lpa') ? "" : " LPA"}</span></div>
                )}
                {jaf.compensation.stipend && jaf.compensation.stipend !== "-" && (
                  <div><span className="block text-xs text-emerald-600/70 font-medium mb-0.5">Stipend</span><span className="font-bold text-slate-900 dark:text-white">₹{jaf.compensation.stipend}</span></div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
