import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';
import API from '../../api/auth';
import { StatusBadge } from '../../components/common/Badge';

const formatDate = (date) => date
  ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(date))
  : '—';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await API.get('/tickets/');
        setTickets(response.data);
      } catch (requestError) {
        console.error(requestError);
        setError('Tickets could not be loaded. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    const searchableText = `${ticket.id} ${ticket.title} ${ticket.category} ${ticket.customer_id}`.toLowerCase();
    return (status === 'ALL' || ticket.status === status) && searchableText.includes(query.toLowerCase());
  }), [tickets, query, status]);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">All Tickets</h2>
          <p className="mt-1 text-sm text-slate-500">Review every support request submitted to the system.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 sm:w-60" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-indigo-500">
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {error && <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><FiAlertCircle />{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-[780px] w-full text-left">
          <thead>
            <tr className="border-y border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-3 py-3">Ticket ID</th>
              <th className="py-3">Title</th>
              <th className="py-3">Category</th>
              <th className="py-3">Status</th>
              <th className="py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-500">
                  Loading tickets…
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-500">
                  No tickets match your search.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-3 py-4 font-semibold text-indigo-600">{ticket.id}</td>
                  <td className="max-w-xs py-4 font-medium text-slate-800">{ticket.title}</td>
                  <td className="py-4 text-slate-600">{ticket.category || '—'}</td>
                  <td className="py-4"><StatusBadge status={ticket.status} /></td>
                  <td className="py-4 text-slate-500">{formatDate(ticket.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && <p className="text-sm text-slate-500">Showing {filteredTickets.length} of {tickets.length} tickets</p>}
    </section>
  );
}