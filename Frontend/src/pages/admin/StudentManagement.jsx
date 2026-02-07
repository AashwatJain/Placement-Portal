import { useState } from "react";
import { MOCK_STUDENTS } from "../../data/mockData";

export default function StudentManagement() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
      <p className="text-slate-600">View and manage student accounts and profiles.</p>

      <div className="flex gap-4">
        <input
          type="search"
          placeholder="Search by name or branch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
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
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.branch}</td>
                <td className="px-4 py-3 text-slate-600">{s.year}</td>
                <td className="px-4 py-3 text-slate-600">{s.cgpa}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.status === "Placed" ? "bg-green-100 text-green-800" :
                    s.status === "Applying" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm font-medium text-amber-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
