import { PriorityBadge, StatusBadge } from '../common/Badge';
import { FiClock, FiPaperclip } from 'react-icons/fi';

export default function TicketCard({ ticket, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-indigo-600">{ticket.id}</span>
        <StatusBadge status={ticket.status} />
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{ticket.subject}</h4>
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{ticket.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] text-slate-400">
        <PriorityBadge priority={ticket.priority} />
        <span className="flex items-center gap-1 font-medium">
          <FiClock className="w-3 h-3" /> {ticket.slaTimeRemaining || ticket.updatedAt}
        </span>
      </div>
    </div>
  );
}