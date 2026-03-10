import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createJaf, updateJaf, fetchJafs } from "../../services/adminApi";
import { 
  ArrowLeft, CheckCircle2, ChevronRight, Save, 
  MapPin, Briefcase, GraduationCap, DollarSign, 
  ListChecks, Plus, Trash2, Calendar, Loader2
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Basic Details", icon: <Briefcase size={18}/> },
  { id: 2, title: "Eligibility Criteria", icon: <GraduationCap size={18}/> },
  { id: 3, title: "Compensation", icon: <DollarSign size={18}/> },
  { id: 4, title: "Selection Process", icon: <ListChecks size={18}/> }
];

const BRANCHES = ["CS", "IT", "AIML", "AIDS", "MNC", "ECE", "Robotics", "IIOT"];

export default function JAFCreationWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingJaf, setLoadingJaf] = useState(!!id);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "", roles: "", location: "", offerType: "Full Time", description: "",
    branches: "", allowedBranches: [], minCgpa: 7.0, maxBacklogs: 0,
    basePay: "", ctc: "", stipend: "", hasBonus: false,
    skills: "", brochureUrl: "",
    rounds: [
      { id: 1, name: "Resume Shortlisting", expectedDate: "" },
      { id: 2, name: "Online Coding Assessment", expectedDate: "" },
      { id: 3, name: "Technical Interview I", expectedDate: "" },
      { id: 4, name: "HR Interview", expectedDate: "" }
    ]
  });

  useEffect(() => {
    if (id) {
      async function loadJaf() {
        try {
          // We fetch all JAFs for the company and find the specific one
          const jafs = await fetchJafs(user?.companyName);
          const existing = jafs.find(j => j.id === id);
          if (existing) {
            setFormData({
              ...formData,
              ...existing,
              allowedBranches: existing.branches ? existing.branches.split(", ") : [],
              // MAP back the fields to what the UI expects (e.g. roles -> title equivalent)
              title: existing.roles || "",
              type: existing.offerType || "Full Time",
              skills: existing.skills || "",
              brochureUrl: existing.brochureUrl || "",
            });
          }
        } catch (error) {
          console.error("Failed to load JAF:", error);
        } finally {
          setLoadingJaf(false);
        }
      }
      loadJaf();
    }
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleBranch = (branch) => {
    setFormData(prev => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter(b => b !== branch)
        : [...prev.allowedBranches, branch]
    }));
  };

  const selectAllBranches = () => setFormData(prev => ({ ...prev, allowedBranches: [...BRANCHES] }));
  const clearBranches = () => setFormData(prev => ({ ...prev, allowedBranches: [] }));

  const addRound = () => {
    setFormData(prev => ({
      ...prev,
      rounds: [...prev.rounds, { id: Date.now(), name: "", expectedDate: "" }]
    }));
  };

  const updateRound = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const removeRound = (id) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.filter(r => r.id !== id)
    }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const submitDataToBackend = async (status) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: user?.companyName || "Unknown Company", // Bind to recruiter's company
        roles: formData.title, // Map UI element back to schema
        offerType: formData.type,
        branches: formData.allowedBranches.join(", "),
        backlogs: formData.maxBacklogs === 0 ? "No Active Backlogs" : formData.maxBacklogs === 99 ? "Any amount allowed" : `Max ${formData.maxBacklogs}`,
        cgpaCutoff: formData.minCgpa.toString(),
        skills: formData.skills,
        brochureUrl: formData.brochureUrl,
        status: status // "Draft" or "Pending TnP Approval"
      };

      if (isEditMode) {
        await updateJaf(id, payload);
      } else {
        await createJaf(payload);
      }
      navigate("/recruiter/jafs");
    } catch (error) {
      console.error("Failed to save JAF:", error);
      alert("Error saving JAF");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => submitDataToBackend("Draft");
  const handleSubmit = () => submitDataToBackend("Pending TnP Approval");

  if (loadingJaf) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/recruiter/jafs" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{isEditMode ? "Edit JAF" : "Create New JAF"}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Define your role, criteria, and hiring pipeline.</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all">
          <Save size={16}/> Save Draft
        </button>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="relative flex flex-col items-center">
                {idx !== 3 && <div className={`absolute left-[50%] top-4 h-0.5 w-full ${isCompleted ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-100 dark:bg-slate-700"}`}/>}
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  isActive ? "border-indigo-600 bg-white text-indigo-600 dark:border-indigo-400 dark:bg-slate-900 dark:text-indigo-400" 
                  : isCompleted ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
                  : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                }`}>
                  {isCompleted ? <CheckCircle2 size={16}/> : <span className="text-xs font-bold">{step.id}</span>}
                </div>
                <div className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                  isActive || isCompleted ? "text-slate-900 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"
                }`}>
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FORM CONTENT ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* STEP 1: Basic Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
              <Briefcase className="text-indigo-500"/> Basic Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Job Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Software Engineer - Frontend"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"/>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Work Location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore / Remote"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"/>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Employment Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800 appearance-none">
                    <option>Full Time</option><option>Internship</option><option>Internship + PPO</option><option>Contract</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Role Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the responsibilities and expectations..." rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800 resize-none"/>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Required Skills</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Java, System Design, React"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Job Description / Brochure URL</label>
                  <input type="url" name="brochureUrl" value={formData.brochureUrl} onChange={handleChange} placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Eligibility Criteria */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
              <GraduationCap className="text-indigo-500"/> Eligibility Criteria
            </h2>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-slate-500 uppercase">Allowed Branches *</label>
                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                  <button onClick={selectAllBranches} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Select All</button>
                  <button onClick={clearBranches} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Clear</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                {BRANCHES.map(branch => (
                  <button key={branch} onClick={() => toggleBranch(branch)}
                    className={`rounded-lg px-4 py-2 border transition-all ${
                      formData.allowedBranches.includes(branch) 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                    {branch}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="mb-3 block text-xs font-bold text-slate-500 uppercase">Minimum CGPA: <span className="text-indigo-600 dark:text-indigo-400 text-sm ml-1">{formData.minCgpa}</span></label>
                <input type="range" name="minCgpa" min="0" max="10" step="0.5" value={formData.minCgpa} onChange={handleChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"/>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold px-1"><span>0.0</span><span>5.0</span><span>10.0</span></div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Max Active Backlogs</label>
                <select name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800 appearance-none">
                  <option value={0}>0 (No active backlogs allowed)</option>
                  <option value={1}>1 Backlog allowed</option>
                  <option value={2}>2 Backlogs allowed</option>
                  <option value={99}>Any amount allowed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Compensation */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
              <DollarSign className="text-indigo-500"/> Compensation Details
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Total CTC (LPA)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input type="number" name="ctc" value={formData.ctc} onChange={handleChange} placeholder="e.g. 15.5"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"/>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Base Pay (LPA)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input type="number" name="basePay" value={formData.basePay} onChange={handleChange} placeholder="e.g. 12.0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"/>
                </div>
              </div>
            </div>

            {formData.type.includes("Internship") && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Monthly Stipend</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input type="text" name="stipend" value={formData.stipend} onChange={handleChange} placeholder="e.g. 40,000 / month"
                    className="w-full sm:w-1/2 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"/>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 cursor-pointer" onClick={() => setFormData(p => ({...p, hasBonus: !p.hasBonus}))}>
              <div className={`flex h-5 w-5 items-center justify-center rounded border ${formData.hasBonus ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"}`}>
                {formData.hasBonus && <CheckCircle2 size={14}/>}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Includes performance bonuses, ESOPs, or joining bonus</span>
            </div>
          </div>
        )}

        {/* STEP 4: Selection Process */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <ListChecks className="text-indigo-500"/> Hiring Pipeline
              </h2>
              <button onClick={addRound} className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors">
                <Plus size={14}/> Add Round
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.rounds.map((round, index) => (
                <div key={round.id} className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 group transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50">
                  <div className="flex items-center w-8 shrink-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <input type="text" value={round.name} onChange={(e) => updateRound(round.id, 'name', e.target.value)} placeholder="Round Name (e.g. Online Assessment)"
                      className="w-full bg-transparent border-b border-dashed border-slate-300 pb-1.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:text-white"/>
                  </div>
                  <div className="sm:w-48 relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="date" value={round.expectedDate} onChange={(e) => updateRound(round.id, 'expectedDate', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"/>
                  </div>
                  {formData.rounds.length > 1 && (
                    <button onClick={() => removeRound(round.id)} className="flex items-center justify-center w-8 text-slate-400 hover:text-red-500 transition-colors sm:opacity-0 group-hover:opacity-100">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mt-6 dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-500">Upon submitting, this JAF will be routed to the Training & Placement Cell for validation before becoming visible to students.</p>
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER NAVIGATION ── */}
      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={handlePrev} 
          disabled={currentStep === 1}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold transition-all ${
            currentStep === 1 ? "opacity-0 pointer-events-none" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm"
          }`}>
          <ArrowLeft size={18}/> Back
        </button>

        {currentStep < 4 ? (
          <button onClick={handleNext} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
            Continue <ChevronRight size={18}/>
          </button>
        ) : (
          <button 
            disabled={isSubmitting}
            onClick={handleSubmit} 
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? <><Loader2 size={18} className="animate-spin"/> Saving...</> : <>{isEditMode ? "Update JAF" : "Submit JAF"} <CheckCircle2 size={18}/></>}
          </button>
        )}
      </div>

    </div>
  );
}
