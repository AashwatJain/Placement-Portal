import { useState, useEffect } from "react";
import { createNotification, fetchNotifications } from "../../services/adminApi";
import { useToast } from "../../context/ToastContext";
import { Bell, Send, Loader2, Clock, Users, Filter, X, CheckCircle } from "lucide-react";

const TARGET_TYPES = [
    { value: "all", label: "All Students" },
    { value: "branch", label: "By Branch" },
    { value: "status", label: "By Status" },
    { value: "company", label: "By Company" },
];

export default function AdminNotifications() {
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const [form, setForm] = useState({
        title: "",
        message: "",
        targetType: "all",
        targetValue: "",
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchNotifications();
                setNotifications(data);
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const result = await createNotification(form);
            setNotifications([{ ...result, createdAt: new Date().toISOString() }, ...notifications]);
            setForm({ title: "", message: "", targetType: "all", targetValue: "" });
            setSent(true);
            setTimeout(() => setSent(false), 3000);
        } catch (err) {
            console.error("Failed to send notification", err);
            showToast({ type: "error", title: "Send Failed", message: "Failed to send notification." });
        } finally {
            setSending(false);
        }
    };

    const getTargetLabel = (n) => {
        if (n.targetType === "all") return "All Students";
        return `${n.targetType}: ${n.targetValue}`;
    };

    const formatDate = (iso) => {
        if (!iso) return "Just now";
        const d = new Date(iso);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-brand-brown-900 dark:text-white flex items-center gap-2">
                    <Bell className="text-brand-amber-500 dark:text-brand-amber-500" /> Notifications
                </h1>
                <p className="text-brand-brown-600 dark:text-brand-beige-400 mt-1">Compose and send targeted notifications to students.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <form
                    onSubmit={handleSend}
                    className="lg:col-span-2 bg-white dark:bg-[#1A0F08] rounded-2xl border border-brand-beige-200 dark:border-[#5A3D2B] shadow-sm p-6 space-y-5 h-fit"
                >
                    <h2 className="font-bold text-brand-brown-900 dark:text-white flex items-center gap-2">
                        <Send size={16} className="text-brand-amber-500/100" /> Compose Notification
                    </h2>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400 mb-1.5">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                            placeholder="e.g., Drive Update: Google"
                            className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400 mb-1.5">Message</label>
                        <textarea
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                            required rows={4}
                            placeholder="Write your notification message..."
                            className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400 mb-1.5">Target Audience</label>
                        <select
                            value={form.targetType}
                            onChange={e => setForm({ ...form, targetType: e.target.value, targetValue: "" })}
                            className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white"
                        >
                            {TARGET_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {form.targetType !== "all" && (
                        <div>
                            <label className="block text-xs font-semibold uppercase text-brand-cream-500 dark:text-brand-beige-400 mb-1.5">
                                {form.targetType === "branch" ? "Branch Name" : form.targetType === "status" ? "Status" : "Company Name"}
                            </label>
                            <input
                                type="text"
                                value={form.targetValue}
                                onChange={e => setForm({ ...form, targetValue: e.target.value })}
                                required
                                placeholder={form.targetType === "branch" ? "e.g., CSE" : form.targetType === "status" ? "e.g., Placed" : "e.g., Google"}
                                className="w-full rounded-lg border border-brand-beige-300 bg-brand-cream-50 px-3 py-2 text-sm focus:border-brand-amber-500/100 focus:outline-none dark:border-[#5A3D2B] dark:bg-[#2A1810] dark:text-white"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full flex justify-center items-center gap-2 py-2.5 bg-brand-amber-500 text-white hover:bg-brand-amber-600 disabled:opacity-50 rounded-lg font-semibold text-sm transition-all shadow-sm"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : sent ? <CheckCircle size={16} /> : <Send size={16} />}
                        {sent ? "Sent!" : "Send Notification"}
                    </button>
                </form>

                <div className="lg:col-span-3 space-y-4">
                    <h2 className="font-bold text-brand-brown-900 dark:text-white flex items-center gap-2">
                        <Clock size={16} className="text-brand-brown-400" /> Sent History
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-amber-500/100" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white dark:bg-[#1A0F08] rounded-2xl border border-brand-beige-200 dark:border-[#5A3D2B] p-10 text-center">
                            <Bell size={40} className="mx-auto mb-3 text-brand-beige-300 dark:text-brand-brown-600" />
                            <p className="text-brand-cream-500">No notifications sent yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((n) => (
                                <div key={n.id} className="bg-white dark:bg-[#1A0F08] rounded-xl border border-brand-beige-200 dark:border-[#5A3D2B] shadow-sm p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-brand-brown-900 dark:text-white text-sm">{n.title}</h3>
                                            <p className="text-sm text-brand-brown-600 dark:text-brand-beige-400 mt-1 whitespace-pre-line">{n.message}</p>
                                        </div>
                                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-amber-500/10 text-brand-amber-600 dark:bg-brand-amber-800/20 dark:text-brand-amber-500 text-[10px] font-semibold uppercase">
                                            <Filter size={10} /> {getTargetLabel(n)}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-brand-brown-400 mt-2">{formatDate(n.createdAt)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
