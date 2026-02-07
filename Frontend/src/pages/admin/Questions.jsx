import { MOCK_QUESTIONS, MOCK_COMPANIES } from "../../data/mockData";

export default function AdminQuestions() {
  const getCompanyName = (id) => MOCK_COMPANIES.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Questions</h1>
      <p className="text-slate-600">Review and manage questions added by students (linked to companies).</p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Question</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Author</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {MOCK_QUESTIONS.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{getCompanyName(q.companyId)}</td>
                <td className="px-4 py-3 text-slate-700">{q.text}</td>
                <td className="px-4 py-3 text-slate-600">{q.author}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm font-medium text-amber-600 hover:underline">Approve</button>
                  <span className="mx-2 text-slate-300">|</span>
                  <button className="text-sm font-medium text-red-600 hover:underline">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
