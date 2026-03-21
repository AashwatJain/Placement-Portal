import { useState, useEffect } from "react";
import { fetchQuestions, addQuestion as apiAddQuestion, approveQuestion as apiApprove, rejectQuestion as apiReject } from "../../services/adminApi";
import { fetchCompanies } from "../../services/studentApi";
import { Check, X, Clock, CheckCircle2, Plus, Send, Loader2, Edit2 } from "lucide-react";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // State for the Admin "Add Question" form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    text: "",
    link: "",
    difficulty: "Medium",
    tagsInput: ""
  });

  // State for Edit/Reject modals
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({ text: "", tagsInput: "", difficulty: "Medium" });
  
  const [rejectingQuestionId, setRejectingQuestionId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch questions and companies on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [qData, cData] = await Promise.all([fetchQuestions(), fetchCompanies()]);
        setQuestions(qData);
        setCompanies(cData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCompanyName = (id) => companies.find((c) => String(c.id) === String(id))?.name ?? "Unknown Company";

  // --- Handlers for Student Submissions ---
  const handleApprove = async (id, overrideData = null) => {
    try {
      await apiApprove(id, overrideData || {});
      setQuestions(questions.map(q => q.id === id ? { ...q, ...overrideData, status: 'approved' } : q));
      setEditingQuestion(null);
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const submitEditAndApprove = (e) => {
      e.preventDefault();
      if (!editingQuestion) return;
      const parsedTags = editFormData.tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      handleApprove(editingQuestion.id, {
          text: editFormData.text,
          difficulty: editFormData.difficulty,
          tags: parsedTags
      });
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingQuestionId) return;
    try {
      await apiReject(rejectingQuestionId, rejectReason);
      setQuestions(questions.map(q => q.id === rejectingQuestionId ? { ...q, status: 'rejected' } : q));
      setRejectingQuestionId(null);
      setRejectReason("");
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  // --- Handler for Admin Adding a Question ---
  const handleAdminAddQuestion = async (e) => {
    e.preventDefault();

    const selectedCompany = companies.find(c => String(c.id) === String(formData.companyId));

    try {
      const tags = formData.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await apiAddQuestion({
        companyId: formData.companyId,
        companyName: selectedCompany?.name || "Unknown",
        text: formData.text,
        link: formData.link,
        difficulty: formData.difficulty,
        tags,
        author: "Placement Cell (Admin)",
      });

      setQuestions([{ id: result.id, ...result }, ...questions]);
      setFormData({ companyId: "", text: "", link: "", difficulty: "Medium", tagsInput: "" });
      setShowAddForm(false);
      setActiveTab("approved");
    } catch (err) {
      console.error("Failed to add question:", err);
      alert("Something went wrong. Please try again.");
    }
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
          <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white transition-colors">Question Bank</h1>
          <p className="text-brand-brown-600 dark:text-brand-beige-400 transition-colors">Review student submissions and add past year questions.</p>
        </div>

        {/* Controls: Status Tabs & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white dark:bg-[#2A1810] p-1 rounded-lg border border-brand-beige-200 dark:border-[#5A3D2B] w-fit">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "pending"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "text-brand-brown-600 dark:text-brand-beige-400 hover:bg-brand-cream-50 dark:hover:bg-brand-brown-700"
                }`}
            >
              <Clock size={16} /> Pending
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "approved"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "text-brand-brown-600 dark:text-brand-beige-400 hover:bg-brand-cream-50 dark:hover:bg-brand-brown-700"
                }`}
            >
              <CheckCircle2 size={16} /> Approved
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all shadow-sm ${showAddForm
                ? "bg-brand-beige-200 text-brand-brown-700 hover:bg-brand-beige-300 dark:bg-brand-brown-700 dark:text-white dark:hover:bg-brand-brown-600"
                : "bg-brand-amber-500 text-white hover:bg-brand-amber-600 shadow-brand-amber-500/100/20"
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
          className="bg-brand-amber-500/10/50 dark:bg-[#2A1810]/50 p-6 rounded-xl border border-brand-amber-500/20 dark:border-brand-amber-500/100/20 animate-in slide-in-from-top-4 fade-in duration-200"
        >
          <h2 className="text-lg font-bold text-brand-amber-800 dark:text-brand-amber-500/40 mb-4 flex items-center gap-2">
            <Plus size={18} /> Add Past Year Question
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400">Select Company</label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                required
                className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2.5 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none focus:ring-1 focus:ring-brand-amber-500/100 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white transition-colors"
              >
                <option value="" disabled>-- Choose a Company --</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400">Problem Link <span className="text-brand-brown-400 font-normal lowercase">(Optional)</span></label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="e.g., LeetCode, Codeforces link"
                className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2.5 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none focus:ring-1 focus:ring-brand-amber-500/100 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2.5 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none focus:ring-1 focus:ring-brand-amber-500/100 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white transition-colors"
              >
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400">Tags <span className="text-brand-brown-400 font-normal lowercase">(comma-separated)</span></label>
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                placeholder="e.g., Arrays, DP, Graphs"
                className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2.5 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none focus:ring-1 focus:ring-brand-amber-500/100 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400">Question Description / Notes</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                required
                rows={3}
                placeholder="What was the question? Any specific constraints or expected time complexity?"
                className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2.5 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none focus:ring-1 focus:ring-brand-amber-500/100 dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white resize-none transition-colors"
              ></textarea>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-brand-amber-500 px-6 py-2.5 font-bold text-white shadow-lg shadow-brand-amber-500/100/20 hover:bg-brand-amber-600 transition-all active:scale-95"
            >
              <Send size={16} /> Publish Question
            </button>
          </div>
        </form>
      )}

      {/* --- TABLE --- */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-amber-500/100" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-beige-200 dark:border-[#5A3D2B] bg-white dark:bg-[#1A0F08] shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-beige-200 dark:divide-brand-brown-700">
              <thead className="bg-brand-cream-50 dark:bg-[#2A1810]/50 transition-colors">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-cream-500 dark:text-brand-beige-400">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-cream-500 dark:text-brand-beige-400 w-1/2">Question Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-cream-500 dark:text-brand-beige-400">Author</th>
                  {activeTab === "pending" && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brand-cream-500 dark:text-brand-beige-400">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige-200 dark:divide-brand-brown-700 bg-white dark:bg-[#1A0F08] transition-colors">
                {displayedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "pending" ? 4 : 3} className="px-4 py-12 text-center text-sm text-brand-cream-500 dark:text-brand-beige-400">
                      {activeTab === "pending" ? "No pending questions to review! 🎉" : "No approved questions yet."}
                    </td>
                  </tr>
                ) : (
                  displayedQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-brand-cream-50 dark:hover:bg-brand-brown-800/50 transition-colors group">
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-brand-brown-900 dark:text-white">
                        {getCompanyName(q.companyId)}
                      </td>
                      <td className="px-4 py-4">
                        {q.link && (
                          <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand-amber-500/100 hover:text-brand-amber-500 dark:hover:text-brand-amber-500 hover:underline block mb-1.5 transition-colors">
                            View Problem Link ↗
                          </a>
                        )}
                        <p className="text-sm text-brand-brown-700 dark:text-brand-beige-300 whitespace-pre-line leading-relaxed">
                          {q.text}
                        </p>
                        {q.tags && q.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {q.tags.map(t => (
                                    <span key={t} className="text-[10px] bg-brand-beige-100 dark:bg-[#2A1810] text-brand-brown-600 dark:text-brand-beige-400 px-1.5 py-0.5 rounded border border-brand-beige-200 dark:border-[#5A3D2B]">{t}</span>
                                ))}
                            </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        {/* Highlight if it's an official Admin PYQ */}
                        <span className={q.author.includes("Admin") ? "font-semibold text-brand-amber-500 dark:text-brand-amber-500" : "text-brand-brown-600 dark:text-brand-beige-400"}>
                          {q.author}
                        </span>
                      </td>

                      {activeTab === "pending" && (
                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                  setEditingQuestion(q);
                                  setEditFormData({
                                      text: q.text,
                                      tagsInput: (q.tags || []).join(", "),
                                      difficulty: q.difficulty || "Medium"
                                  });
                              }}
                              className="p-1.5 rounded text-brand-amber-500/100 hover:bg-brand-beige-100 dark:hover:bg-brand-brown-800 transition-colors"
                              title="Edit question text before approving"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => handleApprove(q.id)}
                              className="flex items-center gap-1 rounded-md px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/30"
                              title="Approve and publish"
                            >
                              <Check size={16} />
                              <span className="text-xs font-semibold">Approve</span>
                            </button>

                            <button
                              onClick={() => setRejectingQuestionId(q.id)}
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
      )}

      {/* --- EDIT AND APPROVE MODAL --- */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-brown-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1A0F08] border border-brand-beige-200 dark:border-[#5A3D2B] rounded-2xl shadow-2xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-brand-brown-900 dark:text-white">Edit & Approve Question</h3>
                    <button onClick={() => setEditingQuestion(null)} className="text-brand-brown-400 hover:text-brand-brown-600 dark:hover:text-brand-beige-300">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={submitEditAndApprove} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400 mb-1.5">Question Text</label>
                        <textarea
                            value={editFormData.text}
                            onChange={(e) => setEditFormData({...editFormData, text: e.target.value})}
                            required rows={4}
                            className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white resize-none"
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400 mb-1.5">Difficulty</label>
                            <select
                                value={editFormData.difficulty}
                                onChange={(e) => setEditFormData({...editFormData, difficulty: e.target.value})}
                                className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400 mb-1.5">Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={editFormData.tagsInput}
                                onChange={(e) => setEditFormData({...editFormData, tagsInput: e.target.value})}
                                className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2 text-sm text-brand-brown-900 focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 text-sm font-medium text-brand-brown-600 dark:text-brand-beige-300 hover:bg-brand-beige-100 dark:hover:bg-brand-brown-800 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-amber-500 hover:bg-brand-amber-600 rounded-lg flex items-center gap-1.5">
                            <Check size={16} /> Approve Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- REJECT REASON MODAL --- */}
      {rejectingQuestionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-brown-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1A0F08] border border-brand-beige-200 dark:border-[#5A3D2B] rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Reject Question</h3>
                    <button onClick={() => { setRejectingQuestionId(null); setRejectReason(""); }} className="text-brand-brown-400 hover:text-brand-brown-600 dark:hover:text-brand-beige-300">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleRejectSubmit}>
                    <label className="block text-sm font-medium text-brand-brown-700 dark:text-brand-beige-300 mb-2">Please provide a reason for rejecting this submission. The student will be notified.</label>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        required rows={3} placeholder="e.g., Incomplete description, inappropriate content..."
                        className="w-full rounded-lg border border-brand-beige-300 bg-white px-3 py-2 text-sm text-brand-brown-900 focus:border-red-500 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#1A0F08] dark:text-white resize-none"
                    ></textarea>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => { setRejectingQuestionId(null); setRejectReason(""); }} className="px-4 py-2 text-sm font-medium text-brand-brown-600 dark:text-brand-beige-300 hover:bg-brand-beige-100 dark:hover:bg-brand-brown-800 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                            Reject & Notify
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}