import { useState } from "react";
import { MOCK_APPLICATIONS } from "../../data/mockData";
import { 
  FileText, 
  Search, 
  Filter, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Briefcase 
} from "lucide-react";

export default function Applications() {
  // State for Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Logic
  const filteredApps = MOCK_APPLICATIONS.filter(app => 
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for Badge Styles
  const getStatusStyle = (status) => {
    switch (status) {
      case "Offered": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "Shortlisted": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "Interview Scheduled": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      case "OA Pending": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
          <p className="text-slate-500 dark:text-slate-400">Track status of all your drive applications.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search company..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all w-full sm:w-64"
             />
           </div>
           <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
             <Filter size={16} /> Filter
           </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium uppercase">Company</th>
                <th className="px-6 py-4 font-medium uppercase">Profile / Role</th>
                <th className="px-6 py-4 font-medium uppercase">Applied On</th>
                <th className="px-6 py-4 font-medium uppercase">Status</th>
                <th className="px-6 py-4 font-medium uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.map((app) => (
                <tr key={app.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {app.company.charAt(0)}
                      </div>
                      <span className="font-semibold">{app.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{app.role || "SDE Intern"}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{app.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <FileText size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
            <p>No applications found matching "{searchTerm}".</p>
          </div>
        )}
      </div>

      {/* --- APPLICATION DETAILS MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-200 text-xl font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    {selectedApp.company.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedApp.company}</h2>
                    <p className="text-sm text-slate-500">{selectedApp.role} • ID: #{selectedApp.id}492</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* Status Badge */}
              <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${selectedApp.status === "Rejected" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                       {selectedApp.status === "Rejected" ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
                    </div>
                    <div>
                       <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Status</p>
                       <p className="text-base font-bold text-slate-900 dark:text-white">{selectedApp.status}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Applied On</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedApp.date}</p>
                 </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <MapPin size={14} /> Location
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">Bangalore / Hybrid</p>
                 </div>
                 <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Briefcase size={14} /> Job Type
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">Full Time + 6m Intern</p>
                 </div>
              </div>

              {/* Timeline (Fake Visualization) */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Application Timeline</h3>
                <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                  
                  {/* Step 1 */}
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-slate-900"></span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Applied Successfully</p>
                    <p className="text-xs text-slate-500">{selectedApp.date}</p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative pl-6">
                    <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                       selectedApp.status === "Applied" ? "bg-slate-300" : "bg-green-500"
                    }`}></span>
                    <p className={`text-sm font-bold ${selectedApp.status === "Applied" ? "text-slate-400" : "text-slate-900 dark:text-white"}`}>Resume Shortlisting</p>
                    {selectedApp.status !== "Applied" && <p className="text-xs text-slate-500">Completed</p>}
                  </div>

                  {/* Step 3 (Dynamic) */}
                  <div className="relative pl-6">
                     <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                       ["Interview Scheduled", "Offered"].includes(selectedApp.status) ? "bg-green-500" : 
                       selectedApp.status === "Rejected" ? "bg-red-500" : "bg-slate-300"
                    }`}></span>
                     <p className={`text-sm font-bold ${
                        ["Applied", "Shortlisted", "OA Pending"].includes(selectedApp.status) ? "text-slate-400" : "text-slate-900 dark:text-white"
                     }`}>
                        {selectedApp.status === "Rejected" ? "Rejected" : "Technical Interview"}
                     </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
               <button 
                 className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                 onClick={() => setSelectedApp(null)}
               >
                 Close
               </button>
               {selectedApp.status !== "Rejected" && (
                 <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                   View Job Description
                 </button>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}