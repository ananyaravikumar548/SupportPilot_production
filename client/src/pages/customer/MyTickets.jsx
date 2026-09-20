import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../api/auth';
import { StatusBadge } from '../../components/common/Badge';

export default function MyTickets({ initialTickets, limit }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Latest activity');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [feedbackTicketIds, setFeedbackTicketIds] = useState(new Set());
  const [reopenTarget, setReopenTarget] = useState(null);
  const [reopenReason, setReopenReason] = useState('');

  const tabs = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

  const fetchTickets = useCallback(async ({ showLoading = false } = {}) => {
      try {
        if (showLoading) setLoading(true);
        const response = await API.get('/tickets/');
        const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
        setTickets(data);
        setLastUpdated(new Date());
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (Array.isArray(initialTickets)) {
      setTickets(initialTickets);
      setLoading(false);
      return undefined;
    }

    fetchTickets({ showLoading: true });
    const pollId = window.setInterval(fetchTickets, 15_000);
    return () => window.clearInterval(pollId);
  }, [fetchTickets, initialTickets]);

  const normalizeStatus = (status) => {
    const value = (status || '').toString().trim().toUpperCase();
    if (value === 'IN_PROGRESS') return 'In Progress';
    if (value === 'OPEN') return 'Open';
    if (value === 'RESOLVED') return 'Resolved';
    if (value === 'CLOSED') return 'Closed';
    if (value === 'AI_RESOLVED') return 'AI Resolved';
    if (value === 'REOPENED') return 'Reopened';
    if (value === 'PENDING_ASSIGNMENT') return 'Pending Assignment';
    if (value === 'PENDING_AGENT_REVIEW') return 'Pending Agent Review';
    if (value === 'ESCALATED') return 'Escalated';
    return status || 'Open';
  };

  const getTicketId = (ticket) => (ticket?._id ?? ticket?.id ?? '').toString();
  const getSubject = (ticket) => ticket?.title ?? ticket?.subject ?? 'Untitled ticket';
  const getCategory = (ticket) => ticket?.category ?? 'General';
  const getStatus = (ticket) => ticket?.status ?? 'OPEN';
  const getResolution = (ticket) => {
    const steps = ticket?.ai_resolution ?? ticket?.suggested_resolution;
    if (Array.isArray(steps) && steps.length) return steps;
    return ticket?.ai_solution ? [ticket.ai_solution] : [];
  };

  const handlingStatus = (ticket) => {
    const status = String(getStatus(ticket)).toUpperCase();
    if (status === 'AI_RESOLVED') return 'Pending Your Confirmation';
    if (['ASSIGNED', 'IN_PROGRESS', 'PENDING_AGENT_REVIEW', 'REOPENED'].includes(status)) {
      return ticket?.assigned_email
        ? `Assigned to Support Specialist (${ticket.assigned_email})`
        : 'Assigned to Support Specialist';
    }
    if (status === 'RESOLVED') return 'Pending Your Confirmation';
    if (status === 'CLOSED') return 'Closed';
    return normalizeStatus(status);
  };

  const submitFeedback = async (ticketId, accepted) => {
    setFeedbackTicketIds((current) => new Set(current).add(ticketId));
    try {
      const payload = accepted
        ? { status: 'CLOSED', customer_feedback: 'ACCEPTED' }
        : { status: 'ESCALATED', customer_feedback: 'REJECTED_NEEDS_HUMAN' };
      const response = await API.patch(`/tickets/${ticketId}/`, payload);
      setTickets((current) => current.map((ticket) =>
        getTicketId(ticket) === ticketId ? { ...ticket, ...response.data } : ticket
      ));
      toast.success(accepted ? 'Ticket resolved and closed. Thank you!' : 'Your ticket has been escalated to a support specialist.');
    } catch (error) {
      console.error('Ticket feedback failed:', error);
      toast.error('Unable to submit ticket feedback.');
    } finally {
      setFeedbackTicketIds((current) => {
        const next = new Set(current);
        next.delete(ticketId);
        return next;
      });
    }
  };

  const reopenTicket = async (ticketId) => {
    const feedback = reopenReason.trim();
    if (!feedback) return;
    setFeedbackTicketIds((current) => new Set(current).add(ticketId));
    try {
      const response = await API.post(`/tickets/${ticketId}/reopen/`, { reason: feedback });
      const updatedTicket = response.data.ticket;
      setTickets((current) => current.map((ticket) =>
        getTicketId(ticket) === ticketId ? { ...ticket, ...updatedTicket } : ticket
      ));
      setReopenTarget(null);
      setReopenReason('');
      toast.success('Ticket reopened and returned to the assigned support specialist.');
    } catch (error) {
      console.error('Ticket reopen failed:', error);
      toast.error(error?.response?.data?.detail || 'Unable to reopen ticket.');
    } finally {
      setFeedbackTicketIds((current) => {
        const next = new Set(current);
        next.delete(ticketId);
        return next;
      });
    }
  };

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

    const sorted = [...result].sort((a, b) => {
      const aDate = new Date(a?.updated_at ?? a?.updatedAt ?? a?.created_at ?? a?.createdAt ?? 0).getTime();
      const bDate = new Date(b?.updated_at ?? b?.updatedAt ?? b?.created_at ?? b?.createdAt ?? 0).getTime();

      if (sort === 'Oldest first') {
        return aDate - bDate;
      }

      return bDate - aDate;
    });

    return Number.isInteger(limit) ? sorted.slice(0, limit) : sorted;
  }, [tickets, activeTab, query, sort, limit]);

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

        <div className={`flex w-full min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:w-auto ${Number.isInteger(limit) ? 'hidden' : ''}`}>
          <div className="relative w-52 shrink-0">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Search tickets"
              aria-label="Search tickets"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort tickets"
            className="w-36 shrink-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none"
          >
            <option>Latest activity</option>
            <option>Oldest first</option>
          </select>
        </div>
      </div>

      {location.state?.submittedTicketId && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Ticket submitted! Our AI agent has emailed you a proposed solution.
        </div>
      )}

      <div className={`mb-5 flex gap-2 overflow-x-auto pb-1 ${Number.isInteger(limit) ? 'hidden' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            {tab}
            {tab === 'All' && <span className="ml-1.5 text-xs opacity-80">{tickets.length}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
            Loading tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
            No tickets found.
          </div>
        ) : (
          filteredTickets.map((ticket, index) => {
            const normalizedStatus = String(getStatus(ticket)).toUpperCase();
            const isResolved = ['RESOLVED', 'AI_RESOLVED'].includes(normalizedStatus);
            const canReopen = [...['RESOLVED', 'AI_RESOLVED', 'CLOSED']].includes(normalizedStatus);
            const resolution = getResolution(ticket);
            const isBusy = feedbackTicketIds.has(getTicketId(ticket));

            return (
              <motion.article
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                key={getTicketId(ticket)}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                        #{getTicketId(ticket)}
                      </span>
                      <StatusBadge status={getStatus(ticket)} />
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        {getCategory(ticket)}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate text-base font-bold text-slate-900">{getSubject(ticket)}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{handlingStatus(ticket)}</p>
                  </div>
                  <button className="hidden rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50 lg:block" aria-label="Open ticket">
                    <FiArrowUpRight />
                  </button>
                </div>

                <div className="mt-4 grid gap-3 border-y border-slate-100 py-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="font-semibold uppercase tracking-wide text-slate-400">Assigned agent</div>
                    <div className="mt-1 font-semibold text-slate-700">{ticket?.assigned_email || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div className="font-semibold uppercase tracking-wide text-slate-400">Routing</div>
                    <div className="mt-1 font-semibold text-slate-700">
                      {ticket?.routing_method === 'AUTOMATED_SKILL_BASED'
                        ? `Skill match · ${getCategory(ticket)}`
                        : ticket?.routing_method === 'UNMAPPED_CATEGORY'
                          ? 'Manager review'
                          : ticket?.routing_method === 'MANUAL_MANAGER_ASSIGNMENT'
                            ? 'Manual assignment'
                            : 'AI analysis'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold uppercase tracking-wide text-slate-400">AI confidence</div>
                    <div className="mt-1 font-mono font-bold text-slate-700">{Math.round(Number(ticket?.ai_confidence || 0) * 100)}%</div>
                  </div>
                  <div>
                    <div className="font-semibold uppercase tracking-wide text-slate-400">Last updated</div>
                    <div className="mt-1 font-semibold text-slate-700">{formatDate(ticket?.updated_at ?? ticket?.updatedAt)}</div>
                  </div>
                </div>

                {isResolved && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-emerald-950">Resolution provided</div>
                        <p className="mt-1 text-xs leading-5 text-emerald-800">
                          {resolution.length ? resolution.slice(0, 2).join(' ') : 'Review the proposed solution and choose how you would like to proceed.'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {!['ACCEPTED', 'REJECTED_NEEDS_HUMAN'].includes((ticket.customer_feedback || '').toUpperCase()) && (
                          <>
                            <button disabled={isBusy} onClick={() => submitFeedback(getTicketId(ticket), true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">Accept & close</button>
                            <button disabled={isBusy} onClick={() => submitFeedback(getTicketId(ticket), false)} className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-50 disabled:opacity-50">Request human help</button>
                          </>
                        )}
                        {canReopen && (
                          <button disabled={isBusy} onClick={() => setReopenTarget(ticket)} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50">Reopen ticket</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })
        )}
      </div>

      <div className={`mt-5 flex items-center justify-between text-sm text-slate-500 ${Number.isInteger(limit) ? 'hidden' : ''}`}>
        <span>
          Showing {filteredTickets.length} of {tickets.length} tickets{lastUpdated ? ` · Updated ${lastUpdated.toLocaleTimeString()}` : ''}
        </span>
        <div className="flex gap-2">
          <button disabled className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">
            Previous
          </button>
          <button className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white">1</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5">Next</button>
        </div>
      </div>

      {reopenTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021d17]/80 p-4">
          <div className="w-full max-w-lg rounded-xl border border-emerald-800 bg-[#062c22] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Reopen ticket</h3>
            <p className="mt-2 text-sm text-emerald-200/80">
              Tell your assigned support specialist what still needs attention.
            </p>
            <textarea
              value={reopenReason}
              onChange={(event) => setReopenReason(event.target.value)}
              className="mt-4 min-h-28 w-full rounded-lg border border-emerald-800 bg-[#021d17] p-3 text-sm text-white outline-none focus:border-emerald-500"
              placeholder="Describe what is still not fixed..."
              aria-label="Reopen reason"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => { setReopenTarget(null); setReopenReason(''); }} className="rounded-lg px-4 py-2 text-sm text-emerald-200">
                Cancel
              </button>
              <button
                disabled={!reopenReason.trim() || feedbackTicketIds.has(getTicketId(reopenTarget))}
                onClick={() => reopenTicket(getTicketId(reopenTarget))}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-50"
              >
                Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
