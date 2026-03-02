import { useState } from "react";
import { MOCK_QUESTIONS, MOCK_COMPANIES } from "../../data/mockData";
import { Check, X, Clock, CheckCircle2, Plus, Send } from "lucide-react";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [activeTab, setActiveTab] = useState("pending");
  
  // State for the Admin "Add Question" form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    text: "",
    link: ""
  });

  const getCompanyName = (id) => MOCK_COMPANIES.find((c) => String(c.id) === String(id))?.name ?? "Unknown Company";

  // --- Handlers for Student Submissions ---
  const handleApprove = (id) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, status: 'approved' } : q
    ));
  };

  const handleReject = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // --- Handler for Admin Adding a Question ---
  const handleAdminAddQuestion = (e) => {
    e.preventDefault();
    
    const newQuestion = {
      id: Date.now(),
      companyId: formData.companyId,
      text: formData.text,
      link: formData.link,
      author: "Placement Cell (Admin)", // Mark it clearly as an official PYQ
      status: "approved" // Skips pending phase
    };

    setQuestions([newQuestion, ...questions]);
    
    // Reset form and switch to approved tab to show the new question
    setFormData({ companyId: "", text: "", link: "" });
    setShowAddForm(false);
    setActiveTab("approved");
  };

  // Filter questions based on the active tab
  const displayedQuestions = questions.filter(q => 
    activeTab === "pending" ? (q.status !== "approved") : (q.status === "approved")
  );

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Question Bank</h1>
          <p className="text-slate-600 dark:text-slate-400 transition-colors">Review student submissions and add past year questions.</p>
        </div>

        {/* Controls: Status Tabs & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "pending" 
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <Clock size={16} /> Pending
            </button>
            <button 
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "approved" 
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <CheckCircle2 size={16} /> Approved
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all shadow-sm ${
              showAddForm 
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20"
            }`}
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? "Cancel" : "Add PYQ"}
          </button>
        </div>
      </div>

      {/* --- ADMIN "ADD QUESTION" FORM --- */}
      {showAddForm && (
        <form 
          onSubmit={handleAdminAddQuestion}
          className="bg-indigo-50/50 dark:bg-slate-800/50 p-6 rounded-xl border border-indigo-100 dark:border-indigo-500/20 animate-in slide-in-from-top-4 fade-in duration-200"
        >
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <Plus size={18} /> Add Past Year Question
          </h2>
          
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Select Company</label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white transition-colors"
              >
                <option value="" disabled>-- Choose a Company --</option>
                {MOCK_COMPANIES.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Problem Link <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="e.g., LeetCode, Codeforces link"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Question Description / Notes</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                required
                rows={3}
                placeholder="What was the question? Any specific constraints or expected time complexity?"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-none transition-colors"
              ></textarea>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button 
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Send size={16} /> Publish Question
            </button>
          </div>
        </form>
      )}

      {/* --- TABLE --- */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50 transition-colors">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/2">Question Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Author</th>
                {activeTab === "pending" && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900 transition-colors">
              {displayedQuestions.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "pending" ? 4 : 3} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    {activeTab === "pending" ? "No pending questions to review! 🎉" : "No approved questions yet."}
                  </td>
                </tr>
              ) : (
                displayedQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900 dark:text-white">
                      {getCompanyName(q.companyId)}
                    </td>
                    <td className="px-4 py-4">
                      {q.link && (
                        <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline block mb-1.5 transition-colors">
                          View Problem Link ↗
                        </a>
                      )}
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {q.text}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {/* Highlight if it's an official Admin PYQ */}
                      <span className={q.author.includes("Admin") ? "font-semibold text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}>
                        {q.author}
                      </span>
                    </td>
                    
                    {activeTab === "pending" && (
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleApprove(q.id)}
                            className="flex items-center gap-1 rounded-md px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/30"
                            title="Approve and publish"
                          >
                            <Check size={16} />
                            <span className="text-xs font-semibold">Approve</span>
                          </button>
                          
                          <button 
                            onClick={() => handleReject(q.id)}
                            className="flex items-center gap-1 rounded-md px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800/30"
                            title="Reject and remove"
                          >
                            <X size={16} />
                            <span className="text-xs font-semibold">Reject</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}