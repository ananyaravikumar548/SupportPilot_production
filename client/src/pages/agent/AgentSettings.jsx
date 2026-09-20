import { toast } from 'react-toastify';

export default function AgentSettings() {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Agent preferences saved successfully!');
  };

  return (
    <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Agent Workspace Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Auto-Suggest AI Responses</label>
          <select className="w-full p-2 border border-slate-200 rounded-lg">
            <option>Always Show Suggested Responses</option>
            <option>Only for High Priority Tickets</option>
            <option>Disabled</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-sm">
          Save Settings
        </button>
      </form>
    </div>
  );
}