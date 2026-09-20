import { FiPlus, FiFolder } from 'react-icons/fi';

const categories = [
  { id: 1, name: 'Billing', count: '1,040 tickets', SLA: '2 Hours' },
  { id: 2, name: 'Technical', count: '850 tickets', SLA: '4 Hours' },
  { id: 3, name: 'Account', count: '570 tickets', SLA: '6 Hours' },
  { id: 4, name: 'General', count: '396 tickets', SLA: '12 Hours' },
];

export default function Categories() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Support Categories</h2>
          <p className="text-xs text-slate-500">Configure ticket categories and SLA policies</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <FiPlus /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-3">
              <FiFolder className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{cat.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400">Target SLA:</span>
              <span className="font-bold text-emerald-600">{cat.SLA}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}