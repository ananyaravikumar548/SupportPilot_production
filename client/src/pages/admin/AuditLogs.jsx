import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiShield } from 'react-icons/fi';
import API from '../../api/auth';

function relativeTime(value) {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function AuditLogs() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    const [usersResult, ticketsResult] = await Promise.allSettled([
      API.get('/accounts/users/'),
      API.get('/tickets/'),
    ]);
    if (usersResult.status === 'fulfilled') {
      const payload = Array.isArray(usersResult.value.data) ? usersResult.value.data : usersResult.value.data?.results || [];
      setUsers(payload);
    }
    if (ticketsResult.status === 'fulfilled') {
      const payload = Array.isArray(ticketsResult.value.data) ? ticketsResult.value.data : ticketsResult.value.data?.results || [];
      setTickets(payload);
    }
    if (usersResult.status === 'rejected' || ticketsResult.status === 'rejected') {
      setError('Some audit activity could not be loaded.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const logs = useMemo(() => {
    const userLogs = users.map((user, index) => ({
      id: `user-${user.email || index}`,
      action: `Project user available: ${user.role === 'agent_manager' ? 'Manager' : user.role || 'Customer'}`,
      user: user.email || 'Unknown user',
      time: user.date_joined || user.created_at,
    }));
    const ticketLogs = tickets
      .slice()
      .sort((a, b) => new Date(b.updated_at || b.updatedAt || b.created_at || 0) - new Date(a.updated_at || a.updatedAt || a.created_at || 0))
      .slice(0, 20)
      .map((ticket, index) => ({
        id: `ticket-${ticket.id || ticket._id || index}`,
        action: `Ticket ${ticket.ticket_id || ticket.id || 'record'} status: ${ticket.status || 'Unknown'}`,
        user: ticket.customer_email || ticket.customer?.email || 'Ticket workflow',
        time: ticket.updated_at || ticket.updatedAt || ticket.created_at || ticket.createdAt,
      }));
    return [...ticketLogs, ...userLogs].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  }, [tickets, users]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><FiShield className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Security Audit Logs</h2>
            <p className="text-xs text-slate-500">Live activity from project users and ticket workflows</p>
          </div>
        </div>
        <button type="button" onClick={loadLogs} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-600">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      {error && <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">{error}</div>}
      <div className="divide-y divide-slate-100 text-xs">
        {loading ? <div className="py-8 text-center text-slate-400">Loading live activity...</div> : logs.length === 0 ? <div className="py-8 text-center text-slate-400">No activity available.</div> : logs.map((log) => (
          <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div><p className="font-semibold text-slate-800">{log.action}</p><p className="mt-0.5 text-[10px] text-slate-400">By: {log.user}</p></div>
            <span className="font-mono text-[11px] text-slate-400">{relativeTime(log.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
