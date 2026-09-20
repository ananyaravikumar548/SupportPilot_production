import { toast } from 'react-toastify';

export default function AdminSettings() {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System settings updated successfully!');
  };

  return (
    <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
      <h2 className="text-lg font-bold text-slate-800 mb-4">System Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-600 font-semibold mb-1">AI Classification Engine</label>
          <select className="w-full p-2 border border-slate-200 rounded-lg">
            <option>Enabled (v1.3.2 Model)</option>
            <option>Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Default SLA Timeouts</label>
          <input type="text" defaultValue="2 Hours (High), 6 Hours (Medium)" className="w-full p-2 border border-slate-200 rounded-lg" />
        </div>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium shadow-sm">
          Save System Configuration
        </button>
      </form>
    </div>
  );
}