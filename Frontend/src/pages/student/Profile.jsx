import { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Book, Award,
  Save, Camera, FileText, Github, Linkedin,
  Loader2, ExternalLink,
  Code, TrendingUp, Globe, UserCircle,
  Hash, AlertTriangle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

export default function Profile() {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const avatarInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", location: "",
    branch: "", year: "", cgpa: "", github: "",
    linkedin: "", codolio: "", leetcode: "", codeforces: "", codechef: "", about: "", avatar: null,
    gender: "", marks10th: "", marks12th: "", activeBacklogs: "0", backlogHistory: "0"
  });

  // Re-fetch user data from DB when component mounts
  useEffect(() => {
    if (refreshUser) refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        branch: user.branch || "",
        year: user.year || "",
        cgpa: user.cgpa || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        codolio: user.codolio || "",
        leetcode: user.leetcode || "",
        codeforces: user.codeforces || "",
        codechef: user.codechef || "",
        about: user.about || "",
        avatar: user.avatarUrl || user.avatar || null,
        gender: user.gender || "",
        marks10th: user.marks10th || "",
        marks12th: user.marks12th || "",
        activeBacklogs: user.activeBacklogs || "0",
        backlogHistory: user.backlogHistory || "0",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setFormData({ ...formData, avatar: URL.createObjectURL(file) });
    }
  };

  const validateForm = () => {
    const requiredFields = {
      fullName: "Full Name",
      phone: "Phone",
      branch: "Branch",
      year: "Graduation Year",
      cgpa: "CGPA",
    };

    const newErrors = {};
    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || formData[key].toString().trim() === "") {
        newErrors[key] = `${label} is required`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Step 1: Push text data via standard JSON PUT request
      const textPayload = { ...formData, uid: user.uid };
      await axios.put(`${API_BASE_URL}/api/student/update-profile`, textPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Step 2: Push binary data via multipart/form-data POST request
      if (avatarFile) {
        setAvatarUploading(true);
        const filePayload = new FormData();
        filePayload.append("uid", user.uid);
        filePayload.append("avatar", avatarFile);

        const uploadRes = await axios.post(`${API_BASE_URL}/api/student/upload-docs`, filePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });

        // Use the Cloudinary URL from the response immediately
        if (uploadRes.data?.avatarUrl) {
          setFormData(prev => ({ ...prev, avatar: uploadRes.data.avatarUrl }));
        }
        setAvatarUploading(false);
      }

      // Step 3: Refresh user data
      if (refreshUser) await refreshUser();
      setAvatarFile(null);

    } catch (error) {
      console.error("Update failed:", error);
      alert("Error: " + (error.response?.data?.error || "Check if Backend is running"));
    } finally {
      setLoading(false);
    }
  };

  // Determine the primary resume from user data
  const primaryResumeName = user?.primaryResumeName;
  const primaryResumeUrl = user?.primaryResumeUrl || user?.resumeUrl;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 text-slate-900 dark:text-slate-100">

      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        <div className="px-6 pb-6 flex items-center sm:flex-row sm:items-end sm:gap-6 relative">
          <div className="relative -mt-12 group">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-indigo-500 shadow-md overflow-hidden dark:border-slate-900 relative">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{formData.fullName ? formData.fullName[0].toUpperCase() : "S"}</span>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
            </div>

            <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-2 text-white border-2 border-white hover:bg-indigo-600 transition-all cursor-pointer">
              <Camera size={14} />
            </button>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>

          <div className="mt-4 text-center sm:mb-1 sm:mt-0 sm:text-left">
            <h1 className="text-2xl font-bold">{formData.fullName || "Student Name"}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">NIT Kurukshetra | {formData.branch || "Branch"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold">Personal Information</h3>
            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">About Me</label>
              <textarea
                name="about" rows={3} value={formData.about} onChange={handleChange}
                placeholder="Tell us a little bit about yourself..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <InputGroup label="Full Name" name="fullName" value={formData.fullName} icon={User} onChange={handleChange} required error={errors.fullName} />
              <InputGroup label="Email" name="email" value={formData.email} icon={Mail} disabled />
              <InputGroup label="Phone" name="phone" value={formData.phone} icon={Phone} onChange={handleChange} required error={errors.phone} />
              <InputGroup label="Location" name="location" value={formData.location} icon={MapPin} onChange={handleChange} />
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Academic Details</h4>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">
                    Branch <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-500">
                      <Book size={18} />
                    </div>
                    <select
                      name="branch" value={formData.branch} onChange={handleChange}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm font-medium transition-all appearance-none
                        bg-white border-slate-200 text-slate-900 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white
                        ${errors.branch ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    >
                      <option value="">Select Branch</option>
                      {["CS", "IT", "AIML", "AIDS", "MNC", "ECE", "Robotics", "IIOT"].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  {errors.branch && <p className="mt-1 text-xs text-red-500">{errors.branch}</p>}
                </div>
                <InputGroup label="Grad Year" name="year" value={formData.year} icon={Award} onChange={handleChange} required error={errors.year} />
                <InputGroup label="CGPA" name="cgpa" value={formData.cgpa} icon={Award} onChange={handleChange} required error={errors.cgpa} />
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Gender</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-500">
                      <UserCircle size={18} />
                    </div>
                    <select
                      name="gender" value={formData.gender} onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium transition-all focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                <InputGroup label="10th Marks (%)" name="marks10th" value={formData.marks10th} icon={Hash} onChange={handleChange} />
                <InputGroup label="12th Marks (%)" name="marks12th" value={formData.marks12th} icon={Hash} onChange={handleChange} />
                <InputGroup label="Active Backlogs" name="activeBacklogs" value={formData.activeBacklogs} icon={AlertTriangle} onChange={handleChange} />
                <InputGroup label="Backlog History" name="backlogHistory" value={formData.backlogHistory} icon={AlertTriangle} onChange={handleChange} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Coding Profiles</h4>
              <div className="grid gap-6 sm:grid-cols-3">
                <InputGroup label="GitHub URL" name="github" value={formData.github} icon={Github} onChange={handleChange} />
                <InputGroup label="LinkedIn URL" name="linkedin" value={formData.linkedin} icon={Linkedin} onChange={handleChange} />
                <InputGroup label="Codolio Profile" name="codolio" value={formData.codolio} icon={ExternalLink} onChange={handleChange} />
                <InputGroup label="LeetCode Handle" name="leetcode" value={formData.leetcode} icon={Code} onChange={handleChange} />
                <InputGroup label="Codeforces Handle" name="codeforces" value={formData.codeforces} icon={TrendingUp} onChange={handleChange} />
                <InputGroup label="CodeChef Handle" name="codechef" value={formData.codechef} icon={Globe} onChange={handleChange} />
              </div>
            </div>

            {/* Primary Resume (Read-Only Display) */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Primary Resume</h4>
              {primaryResumeUrl ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/10"><FileText size={18} className="text-red-500" /></div>
                    <div>
                      <p className="text-sm font-medium">{primaryResumeName || "Primary_Resume.pdf"}</p>
                      <p className="text-xs text-slate-500">Set via Resume Vault</p>
                    </div>
                  </div>
                  <a href={primaryResumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    View <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No primary resume set. Go to <a href="/student/resume-builder" className="text-indigo-600 hover:underline dark:text-indigo-400">Resume Vault</a> to upload and set your primary resume.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function InputGroup({ label, name, value, onChange, icon: Icon, disabled = false, required = false, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-500">
          <Icon size={18} />
        </div>
        <input
          type="text" name={name} value={value || ""} onChange={onChange} disabled={disabled}
          className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm font-medium transition-all
            ${disabled ? "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-950" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"}
            ${error ? "border-red-400 ring-1 ring-red-400" : ""}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}