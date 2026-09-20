import { PriorityBadge, StatusBadge } from '../common/Badge';

export default function TicketTable({ tickets, onSelectTicket, selectedTicketId }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <th className="py-2.5 px-3">Ticket ID</th>
            <th className="py-2.5 px-3">Subject</th>
            <th className="py-2.5 px-3">Priority</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-xs">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onSelectTicket && onSelectTicket(ticket)}
              className={`hover:bg-indigo-50/40 transition-colors cursor-pointer ${
                selectedTicketId === ticket.id ? 'bg-indigo-50/70 font-medium' : ''
              }`}
            >
              <td className="py-3 px-3 text-indigo-600 font-semibold">{ticket.id}</td>
              <td className="py-3 px-3 text-slate-800">{ticket.subject}</td>
              <td className="py-3 px-3"><PriorityBadge priority={ticket.priority} /></td>
              <td className="py-3 px-3"><StatusBadge status={ticket.status} /></td>
              <td className="py-3 px-3 text-right text-slate-400">{ticket.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}