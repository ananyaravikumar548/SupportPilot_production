import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiFilter, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../api/auth';
import { StatusBadge } from '../../components/common/Badge';

export default function MyTickets() {
  const [activeTab, setActiveTab] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Latest activity');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await API.get('/tickets/');
        const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
        setTickets(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const normalizeStatus = (status) => {
    const value = (status || '').toString().trim().toUpperCase();
    if (value === 'IN_PROGRESS') return 'In Progress';
    if (value === 'OPEN') return 'Open';
    if (value === 'RESOLVED') return 'Resolved';
    if (value === 'CLOSED') return 'Closed';
    return status || 'Open';
  };

  const getTicketId = (ticket) => (ticket?._id ?? ticket?.id ?? '').toString();
  const getSubject = (ticket) => ticket?.title ?? ticket?.subject ?? 'Untitled ticket';
  const getCategory = (ticket) => ticket?.category ?? 'General';
  const getStatus = (ticket) => ticket?.status ?? 'OPEN';

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    const result = tickets.filter((ticket) => {
      const matchesTab =
        activeTab === 'All' || normalizeStatus(getStatus(ticket)) === activeTab;

      const searchableText = `${getTicketId(ticket)} ${getSubject(ticket)} ${getCategory(ticket)}`
        .toLowerCase();

      const matchesQuery = searchableText.includes(normalizedQuery);
      return matchesTab && matchesQuery;
    });

    return [...result].sort((a, b) => {
      const aDate = new Date(a?.updated_at ?? a?.updatedAt ?? a?.created_at ?? a?.createdAt ?? 0).getTime();
      const bDate = new Date(b?.updated_at ?? b?.updatedAt ?? b?.created_at ?? b?.createdAt ?? 0).getTime();

      if (sort === 'Oldest first') {
        return aDate - bDate;
      }

      return bDate - aDate;
    });
  }, [tickets, activeTab, query, sort]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft sm:p-7"
    >
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">My Tickets</h2>
          <p className="mt-1 text-sm text-slate-500">Track every request and stay up to date.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-52 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
              placeholder="Search tickets"
            />
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600">
            <FiFilter /> Filter
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none"
          >
            <option>Latest activity</option>
            <option>Oldest first</option>
          </select>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            {tab}
            {tab === 'All' && <span className="ml-1.5 text-xs opacity-80">{tickets.length}</span>}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-y border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 pl-3">Ticket ID</th>
              <th className="py-4">Subject</th>
              <th className="py-4">Category</th>
              <th className="py-4">Status</th>
              <th className="py-4">Created</th>
              <th className="py-4">Updated</th>
              <th className="py-4 pr-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  Loading tickets...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket, index) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  key={getTicketId(ticket)}
                  className="group text-sm transition hover:bg-indigo-50/40"
                >
                  <td className="py-4 pl-3 font-bold text-indigo-600">{getTicketId(ticket)}</td>
                  <td className="max-w-[210px] py-4 font-semibold text-slate-800">{getSubject(ticket)}</td>
                  <td className="py-4 text-slate-500">{getCategory(ticket)}</td>
                  <td className="py-4">
                    <StatusBadge status={getStatus(ticket)} />
                  </td>
                  <td className="py-4 text-xs text-slate-500">
                    {formatDate(ticket?.created_at ?? ticket?.createdAt)}
                  </td>
                  <td className="py-4 text-xs text-slate-500">
                    {formatDate(ticket?.updated_at ?? ticket?.updatedAt)}
                  </td>
                  <td className="py-4 pr-3 text-right">
                    <button className="rounded-lg p-2 text-indigo-600 opacity-70 transition hover:bg-white hover:opacity-100">
                      <FiArrowUpRight />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {filteredTickets.length} of {tickets.length} tickets
        </span>
        <div className="flex gap-2">
          <button disabled className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">
            Previous
          </button>
          <button className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white">1</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5">Next</button>
        </div>
      </div>
    </motion.section>
  );
}