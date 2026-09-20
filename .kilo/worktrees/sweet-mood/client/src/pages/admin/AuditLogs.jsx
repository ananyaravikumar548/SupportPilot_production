import { FiShield } from 'react-icons/fi';

const logs = [
  { id: 1, action: 'User Logged In', user: 'customer@demo.com', time: '5 minutes ago' },
  { id: 2, action: 'Ticket #TKT-1042 Priority updated to High', user: 'AI Engine', time: '12 minutes ago' },
  { id: 3, action: 'New Agent Created', user: 'admin@demo.com', time: '1 hour ago' },
];

export default function AuditLogs() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <FiShield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Security Audit Logs</h2>
          <p className="text-xs text-slate-500">Track all administrative and automated actions</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {logs.map((log) => (
          <div key={log.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-800">{log.action}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">By: {log.user}</p>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}