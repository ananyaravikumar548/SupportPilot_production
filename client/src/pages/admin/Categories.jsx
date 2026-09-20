import { useState } from 'react';
import { FiPlus, FiFolder, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const initialCategories = [
  { id: 1, name: 'Billing & Invoicing', count: '1,040 tickets', SLA: '2 Hours' },
  { id: 2, name: 'Technical Support', count: '850 tickets', SLA: '4 Hours' },
  { id: 3, name: 'Account & Access', count: '570 tickets', SLA: '2 Hours' },
  { id: 4, name: 'General Inquiries', count: '396 tickets', SLA: '12 Hours' },
  { id: 5, name: 'Network & Connectivity', count: '280 tickets', SLA: '1 Hour' },
  { id: 6, name: 'Bug Reports', count: '412 tickets', SLA: '8 Hours' },
  { id: 7, name: 'Feature Requests', count: '195 tickets', SLA: '24 Hours' },
  { id: 8, name: 'Hardware & Devices', count: '145 tickets', SLA: '6 Hours' },
];

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sla: '4 Hours' });

  const addCategory = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setCategories((current) => [{ id: `custom-${Date.now()}`, name, count: '0 tickets', SLA: form.sla }, ...current]);
    setForm({ name: '', sla: '4 Hours' });
    setIsModalOpen(false);
    toast.success(`${name} category created`);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Support Categories</h2>
          <p className="text-xs text-slate-500">Configure ticket categories and SLA policies</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors">
          <FiPlus /> New Category
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={addCategory} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Create category</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close"><FiX /></button>
            </div>
            <label className="block text-xs font-bold text-slate-600">Category name
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="e.g. Security" />
            </label>
            <label className="block text-xs font-bold text-slate-600">Target SLA
              <select value={form.sla} onChange={(event) => setForm({ ...form, sla: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option>1 Hour</option><option>2 Hours</option><option>4 Hours</option><option>8 Hours</option><option>24 Hours</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Create category</button>
            </div>
          </form>
        </div>
      )}

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