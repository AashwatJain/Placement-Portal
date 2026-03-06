import { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Book, Award,
  Save, Camera, FileText, Github, Linkedin,
  UploadCloud, Loader2, ExternalLink
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function Profile() {
  // refreshUser add kiya
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const avatarInputRef = useRef(null);

  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", location: "",
    branch: "", year: "", cgpa: "", github: "",
    linkedin: "", codolio: "", about: "", avatar: null
  });

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
        about: user.about || "",
        avatar: user.avatarUrl || user.avatar || null
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setFormData({ ...formData, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const textPayload = { ...formData, uid: user.uid };
      await axios.put("http://localhost:5001/api/student/update-profile", textPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (avatarFile) {
        const filePayload = new FormData();
        filePayload.append("uid", user.uid);
        filePayload.append("avatar", avatarFile);

        await axios.post("http://localhost:5001/api/student/upload-docs", filePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
      }

      // UI ko DB se sync karne ke liye refresh
      if (refreshUser) await refreshUser();

      alert("Profile Updated Successfully!");
      setAvatarFile(null);

    } catch (error) {
      console.error("Update failed:", error);
      alert("Error: " + (error.response?.data?.error || "Check if Backend is running"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 text-slate-900 dark:text-slate-100">

      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        <div className="px-6 pb-6 flex items-center sm:flex-row sm:items-end sm:gap-6 relative">
          <div className="relative -mt-12 group">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-indigo-500 shadow-md overflow-hidden dark:border-slate-900">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">M</span>
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
            {/* About Me Section moved to the top of the form for better flow */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500 uppercase">About Me</label>
              <textarea
                name="about" rows={3} value={formData.about} onChange={handleChange}
                placeholder="Tell us a little bit about yourself..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <InputGroup label="Full Name" name="fullName" value={formData.fullName} icon={User} onChange={handleChange} />
              <InputGroup label="Email" name="email" value={formData.email} icon={Mail} disabled />
              <InputGroup label="Phone" name="phone" value={formData.phone} icon={Phone} onChange={handleChange} />
              <InputGroup label="Location" name="location" value={formData.location} icon={MapPin} onChange={handleChange} />
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Academic Details</h4>
              <div className="grid gap-6 sm:grid-cols-3">
                <InputGroup label="Branch" name="branch" value={formData.branch} icon={Book} onChange={handleChange} />
                <InputGroup label="Grad Year" name="year" value={formData.year} icon={Award} onChange={handleChange} />
                <InputGroup label="CGPA" name="cgpa" value={formData.cgpa} icon={Award} onChange={handleChange} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Coding Profiles</h4>
              <div className="grid gap-6 sm:grid-cols-3">
                <InputGroup label="GitHub URL" name="github" value={formData.github} icon={Github} onChange={handleChange} />
                <InputGroup label="LinkedIn URL" name="linkedin" value={formData.linkedin} icon={Linkedin} onChange={handleChange} />
                <InputGroup label="Codolio Profile" name="codolio" value={formData.codolio} icon={ExternalLink} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function InputGroup({ label, name, value, onChange, icon: Icon, disabled = false, fullWidth = false }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-500">
          <Icon size={18} />
        </div>
        <input
          type="text" name={name} value={value || ""} onChange={onChange} disabled={disabled}
          className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm font-medium transition-all
            ${disabled ? "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-950" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white"}`}
        />
      </div>
    </div>
  );
}