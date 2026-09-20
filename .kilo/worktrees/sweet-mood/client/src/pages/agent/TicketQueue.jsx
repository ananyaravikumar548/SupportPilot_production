import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../api/auth';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { FiSearch } from 'react-icons/fi';

export default function TicketQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get('/tickets/');
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setTickets(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getTicketId = (t) => (t?._id ?? t?.id ?? '').toString();
  const getSubject = (t) => t?.title ?? t?.subject ?? '';
  const getCustomer = (t) => t?.customer_id ?? t?.customer ?? '—';
  const getPriority = (t) => t?.priority ?? 'MEDIUM';
  const getStatus = (t) => t?.status ?? 'OPEN';
  const getSla = (t) => t?.slaTimeRemaining ?? t?.sla ?? '—';

  const filteredTickets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter((t) => {
      const id = getTicketId(t).toLowerCase();
      const subject = getSubject(t).toLowerCase();
      const customer = (getCustomer(t) ?? '').toString().toLowerCase();
      const category = (t?.category ?? '').toString().toLowerCase();
      return id.includes(q) || subject.includes(q) || customer.includes(q) || category.includes(q);
    });
  }, [tickets, searchTerm]);

  const updateTicketStatus = async (ticketId, nextStatus) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (getTicketId(t) === ticketId ? { ...t, status: nextStatus } : t)),
    );

    try {
      await API.patch(`/tickets/${ticketId}/`, { status: nextStatus });
      toast.success('Status updated');
    } catch (err1) {
      try {
        await API.patch(`/tickets/${ticketId}`, { status: nextStatus });
        toast.success('Status updated');
      } catch (err2) {
        // eslint-disable-next-line no-console
        console.error(err2);
        toast.error('Failed to update status');
        fetchTickets(); // rollback
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Complete Ticket Queue</h2>
          <p className="text-xs text-slate-500">Filter, review, and handle active incoming support requests</p>
        </div>

        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">SLA Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {loading ? (
              <tr>
                <td className="py-6 px-4 text-slate-500" colSpan={6}>
                  Loading tickets…
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td className="py-6 px-4 text-slate-500" colSpan={6}>
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const id = getTicketId(ticket);
                const status = getStatus(ticket);
                return (
                  <tr key={id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{getSubject(ticket)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{getCustomer(ticket)}</td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={getPriority(ticket)} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        <select
                          value={status}
                          onChange={(e) => updateTicketStatus(id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
                          title="Update status"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-medium">{getSla(ticket)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

