import { toast } from 'react-toastify';

export default function CustomerSettings() {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
      <h2 className="text-lg font-bold text-slate-800 mb-6">Account Settings</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Notifications Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
              Email updates when ticket status changes
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
              AI response alerts
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}