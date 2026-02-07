import { useState, useMemo } from "react";
import { MOCK_STUDENTS } from "../../data/mockData";

export default function RecruiterDashboard() {
  const [needsFilter, setNeedsFilter] = useState(""); // e.g. branch, role
  const [sortByCgpa, setSortByCgpa] = useState("desc"); // "asc" | "desc" | ""

  const filteredAndSorted = useMemo(() => {
    let list = [...MOCK_STUDENTS];
    if (needsFilter) {
      const q = needsFilter.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.branch.toLowerCase().includes(q) ||
          s.status.toLowerCase().includes(q)
      );
    }
    if (sortByCgpa === "asc") list.sort((a, b) => a.cgpa - b.cgpa);
    if (sortByCgpa === "desc") list.sort((a, b) => b.cgpa - a.cgpa);
    return list;
  }, [needsFilter, sortByCgpa]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Recruiter — View Needs</h1>
      <p className="text-slate-600">Only showing candidates matching your needs. Sort by CGPA or filter further.</p>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mr-2 text-sm font-medium text-slate-700">Filter (needs):</label>
          <input
            type="text"
            placeholder="Branch, role, keyword..."
            value={needsFilter}
            onChange={(e) => setNeedsFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="mr-2 text-sm font-medium text-slate-700">Sort by CGPA:</label>
          <select
            value={sortByCgpa}
            onChange={(e) => setSortByCgpa(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">—</option>
            <option value="desc">High to low</option>
            <option value="asc">Low to high</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Branch</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Year</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">CGPA</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredAndSorted.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.branch}</td>
                <td className="px-4 py-3 text-slate-600">{s.year}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{s.cgpa}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.status === "Placed" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm font-medium text-amber-600 hover:underline">View profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
