import { mockNotifications } from '../../mock/notifications';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

export default function CustomerNotifications() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
          <p className="text-xs text-slate-500">Stay updated on your ticket progress</p>
        </div>
        <button className="text-xs font-semibold text-indigo-600 hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {mockNotifications.map((notif) => (
          <div key={notif.id} className="py-4 flex gap-4 items-start hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
            <div className={`p-2 rounded-xl mt-0.5 ${notif.read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <FiBell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                <span className="text-[10px] text-slate-400">{notif.time}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}