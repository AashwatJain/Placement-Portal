import { useState, useRef } from "react"; // useRef add kiya
import { 
  User, Mail, Phone, MapPin, Book, Award, 
  Link as LinkIcon, Save, Camera, FileText, 
  Github, Linkedin, UploadCloud, Loader2
} from "lucide-react";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Reference for hidden file input

  const [formData, setFormData] = useState({
    name: "Student User",
    headline: "Aspiring Software Engineer | CSE '26",
    email: "student@nitkkr.ac.in",
    phone: "+91 98765 43210",
    location: "Kurukshetra, India",
    branch: "Computer Science",
    year: "2026",
    cgpa: "8.85",
    github: "github.com/mickey",
    linkedin: "linkedin.com/in/mickey",
    portfolio: "mickey.dev",
    about: "Passionate about full-stack development and competitive programming. Looking for summer internship opportunities.",
    avatar: null // Store the image URL here
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a fake local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: imageUrl });
    }
  };
  // --------------------------

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      
      {/* 1. COVER & PROFILE HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-6 pb-6">
          <div className="relative flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            
            {/* --- AVATAR SECTION --- */}
            <div className="relative -mt-12 group">
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
              />

              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md overflow-hidden dark:border-slate-900 bg-slate-200">
                 {formData.avatar ? (
                   <img src={formData.avatar} alt="Profile" className="h-full w-full object-cover" />
                 ) : (
                   <span className="text-3xl font-bold text-white tracking-wider">
                     {formData.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                   </span>
                 )}
              </div>
              
              <button 
                onClick={handleCameraClick}
                className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-2 text-white shadow-lg border-2 border-white hover:bg-slate-700 dark:border-slate-800 transition-colors cursor-pointer z-10"
              >
                <Camera size={14} />
              </button>
            </div>
            {/* ---------------------- */}

            <div className="mt-4 text-center sm:mb-1 sm:mt-0 sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{formData.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formData.headline}</p>
            </div>

            <div className="mt-4 sm:ml-auto sm:mt-0">
               <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800">
                 <Award size={14} /> 85% Profile Completed
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">About Me</h3>
            <textarea
              name="about"
              rows={4}
              value={formData.about}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Resume & Transcript</h3>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
               <div className="rounded-full bg-indigo-50 p-3 dark:bg-indigo-900/20">
                 <UploadCloud className="text-indigo-600 dark:text-indigo-400" size={24}/>
               </div>
               <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Click to upload</p>
               <p className="text-xs text-slate-500">PDF up to 5MB</p>
            </div>
            <div className="mt-4 space-y-2">
              <FileItem name="Resume_Final.pdf" date="Uploaded 2 days ago" />
              <FileItem name="Transcript_Sem4.pdf" date="Uploaded 1 week ago" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
           <div className="mb-6 flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
             <button 
               onClick={handleSave}
               disabled={loading}
               className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
             >
               {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               {loading ? "Saving..." : "Save Changes"}
             </button>
           </div>

           <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <InputGroup label="Full Name" name="name" value={formData.name} icon={User} onChange={handleChange} />
                <InputGroup label="Email Address" name="email" value={formData.email} icon={Mail} onChange={handleChange} disabled />
                <InputGroup label="Phone Number" name="phone" value={formData.phone} icon={Phone} onChange={handleChange} />
                <InputGroup label="Location" name="location" value={formData.location} icon={MapPin} onChange={handleChange} />
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800"></div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Academic Details</h4>
                <div className="grid gap-5 sm:grid-cols-3">
                  <InputGroup label="Branch" name="branch" value={formData.branch} icon={Book} onChange={handleChange} />
                  <InputGroup label="Graduation Year" name="year" value={formData.year} icon={Award} onChange={handleChange} />
                  <InputGroup label="CGPA" name="cgpa" value={formData.cgpa} icon={Award} onChange={handleChange} />
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800"></div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Social Links</h4>
                <div className="grid gap-5 sm:grid-cols-2">
                  <InputGroup label="GitHub URL" name="github" value={formData.github} icon={Github} onChange={handleChange} />
                  <InputGroup label="LinkedIn URL" name="linkedin" value={formData.linkedin} icon={Linkedin} onChange={handleChange} />
                  <InputGroup label="Portfolio / Codolio" name="portfolio" value={formData.portfolio} icon={LinkIcon} onChange={handleChange} fullWidth />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, icon: Icon, type = "text", disabled = false, fullWidth = false }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="relative group">
        <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors duration-300 ${disabled ? 'opacity-50' : 'group-focus-within:text-indigo-500 text-slate-400'}`}>
          <Icon size={18} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm font-medium transition-all duration-200
            border-slate-200 bg-white text-slate-900 placeholder-slate-400
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
            dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500
            dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20
            disabled:cursor-not-allowed disabled:opacity-70
            disabled:bg-slate-100 disabled:text-slate-500 
            dark:disabled:bg-slate-950/50 dark:disabled:text-slate-500 dark:disabled:border-slate-800/50
          `}
        />
        {disabled && (
           <div className="absolute inset-y-0 right-3 flex items-center">
             <span className="text-xs font-medium text-slate-400">Locked</span>
           </div>
        )}
      </div>
    </div>
  );
}

function FileItem({ name, date }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-center gap-3">
        <div className="rounded bg-red-100 p-1.5 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <FileText size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p>
          <p className="text-xs text-slate-500">{date}</p>
        </div>
      </div>
      <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
        View
      </button>
    </div>
  );
}