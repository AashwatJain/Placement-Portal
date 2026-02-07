import { useState } from "react";

const initial = {
  name: "",
  score: "",
  year: new Date().getFullYear(),
  roles: "",
  cgpaCutoff: "",
  type: "On-campus",
};

export default function CompanyAdd() {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setForm(initial);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Company Add</h1>
      <p className="text-slate-600">Add new companies and their placement details.</p>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Score / Rank</label>
            <input
              type="text"
              value={form.score}
              onChange={(e) => update("score", e.target.value)}
              placeholder="e.g. 9.2"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">CGPA cutoff</label>
            <input
              type="text"
              value={form.cgpaCutoff}
              onChange={(e) => update("cgpaCutoff", e.target.value)}
              placeholder="e.g. 7.5"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Roles (comma-separated)</label>
            <input
              type="text"
              value={form.roles}
              onChange={(e) => update("roles", e.target.value)}
              placeholder="SDE, ML, Analyst"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="On-campus">On-campus</option>
              <option value="Off-campus">Off-campus</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
            Add company
          </button>
          {saved && <span className="text-sm text-green-600">Company added (mock).</span>}
        </div>
      </form>
    </div>
  );
}
