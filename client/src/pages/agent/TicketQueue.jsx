import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../api/auth';
import { PriorityBadge } from '../../components/common/Badge';
import { FiSearch, FiDatabase } from 'react-icons/fi';

import MasterDataModal from "../../components/MasterDataModal";

export default function TicketQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);

  const applySelectedTicket = (ticket) => {
    if (!ticket) {
      setSelectedTicket(null);
      setStatus('');
      setResolutionNotes('');
      return;
    }

    setSelectedTicket(ticket);
    setStatus(getStatus(ticket));
    setResolutionNotes(ticket?.resolution_notes ?? ticket?.resolutionNotes ?? '');
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get('/tickets/');
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setTickets(data);

      if (data.length > 0) {
        const currentSelected = selectedTicket && data.find((ticket) => getTicketId(ticket) === getTicketId(selectedTicket));
        applySelectedTicket(currentSelected || data[0]);
      } else {
        applySelectedTicket(null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = (ticket) => {
    applySelectedTicket(ticket);
  };

  const handleSaveResolution = async () => {
    if (!selectedTicket) return;

    try {
      await API.patch(`/tickets/${getTicketId(selectedTicket)}/`, {
        status,
        resolution_notes: resolutionNotes,
      });
      toast.success('Resolution saved');
      fetchTickets();
    } catch (error) {
      console.error(error);
      try {
        await API.patch(`/tickets/${getTicketId(selectedTicket)}`, {
          status,
          resolution_notes: resolutionNotes,
        });
        toast.success('Resolution saved');
        fetchTickets();
      } catch (retryError) {
        console.error(retryError);
        toast.error('Failed to save resolution');
      }
    }
  };

  // Field helpers
  const getTicketId = (t) => (t?._id ?? t?.id ?? t?.ticket_number ?? '').toString();
  const getSubject = (t) => t?.title ?? t?.subject ?? '';
  const getCustomer = (t) => t?.customer_id ?? t?.customer ?? t?.created_by ?? '—';
  const getCategory = (t) => t?.category ?? 'General';
  const getPriority = (t) => t?.priority ?? 'MEDIUM';
  const getStatus = (t) => t?.status ?? 'OPEN';
  const getAiResolution = (t) => {
    const value = t?.ai_resolution ?? t?.aiResolution ?? t?.suggested_resolution ?? t?.suggestedResolution ?? [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  };
  const getCustomerFeedback = (t) => t?.customer_feedback ?? t?.customerFeedback ?? 'Customer rejected the automated resolution.';
  const getAssignedAgent = (t) => t?.assigned_agent ?? t?.assignedAgent ?? t?.agent ?? t?.owner ?? 'Unassigned';
  const getAssignedEmail = (t) => t?.assigned_email ?? t?.assignedEmail ?? t?.agent_email ?? 'Unassigned';
  const getRoutingMethod = (t) => {
    const method = t?.routing_method ?? t?.routingMethod ?? '';
    if (method === 'MANUAL_MANAGER_ASSIGNMENT') return 'Manual Manager Assignment';
    if (method === 'AUTOMATED_SKILL_BASED') return `Auto (Skill-Match: ${getCategory(t)})`;
    if (method === 'UNMAPPED_CATEGORY') return 'Unmapped Category (Pending Assignment)';
    if (method === 'AUTOMATED_HIGH_CONFIDENCE') return 'Auto (High Confidence)';
    return method || 'AI Processing';
  };
  const getAiConfidence = (t) => Number(t?.ai_confidence ?? t?.aiConfidence ?? 0) || 0;

  // Shorten Mongo ObjectId (e.g. "6a74a49aaf4765b68e24ea92" -> "#24EA92")
  const formatShortId = (rawId) => {
    if (!rawId) return '—';
    if (rawId.length >= 12) {
      return `#${rawId.slice(-6).toUpperCase()}`;
    }
    return rawId.startsWith('#') ? rawId : `#${rawId}`;
  };

  // Extract or calculate SLA timestamp safely
  const getSlaDueDate = (t) => {
    if (t?.sla_due_at || t?.slaDueAt || t?.sla_due_date) {
      return t.sla_due_at || t.slaDueAt || t.sla_due_date;
    }

    let createdAt = t?.created_at ? new Date(t.created_at) : null;
    const mongoId = t?._id ?? t?.id;

    if (!createdAt && mongoId && typeof mongoId === 'string' && mongoId.length === 24) {
      createdAt = new Date(parseInt(mongoId.substring(0, 8), 16) * 1000);
    }

    if (!createdAt || isNaN(createdAt.getTime())) return null;

    const priorityHours = {
      P1: 2,
      P2: 4,
      P3: 8,
      P4: 24,
    };

    const priority = t?.priority ?? 'P3';
    const hoursToAdd = priorityHours[priority] || 8;

    return new Date(createdAt.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString();
  };

  // Render SLA Badge with dynamic countdown & warning colors
  const renderSLA = (ticket) => {
    const status = getStatus(ticket);

    if (status === 'RESOLVED' || status === 'AI_RESOLVED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          Resolved
        </span>
      );
    }

    const rawDueAt = getSlaDueDate(ticket);

    if (!rawDueAt && (ticket?.slaTimeRemaining || ticket?.sla)) {
      return <span className="text-slate-600 whitespace-nowrap">{ticket.slaTimeRemaining || ticket.sla}</span>;
    }

    if (!rawDueAt) return <span className="text-slate-400">—</span>;

    const dueDate = new Date(rawDueAt);
    const now = new Date();

    if (isNaN(dueDate.getTime())) {
      return <span className="text-slate-500 whitespace-nowrap">{rawDueAt}</span>;
    }

    const diffMs = dueDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      const breachedMins = Math.abs(Math.floor(diffMs / (1000 * 60)));
      const hours = Math.floor(breachedMins / 60);
      const mins = breachedMins % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          Breached ({timeStr} ago)
        </span>
      );
    }

    const totalMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    if (totalMins <= 60) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse whitespace-nowrap">
          {timeStr} remaining
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
        {timeStr} left
      </span>
    );
  };

  const filteredTickets = useMemo(() => {
    let list = [...tickets];

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const id = getTicketId(t).toLowerCase();
        const subject = getSubject(t).toLowerCase();
        const customer = (getCustomer(t) ?? '').toString().toLowerCase();
        const category = (t?.category ?? '').toString().toLowerCase();
        return id.includes(q) || subject.includes(q) || customer.includes(q) || category.includes(q);
      });
    }

    return list.sort((a, b) => {
      if (a.status === 'RESOLVED' || a.status === 'AI_RESOLVED') return 1;
      if (b.status === 'RESOLVED' || b.status === 'AI_RESOLVED') return -1;

      const dateA = getSlaDueDate(a) ? new Date(getSlaDueDate(a)).getTime() : Infinity;
      const dateB = getSlaDueDate(b) ? new Date(getSlaDueDate(b)).getTime() : Infinity;

      return dateA - dateB;
    });
  }, [tickets, searchTerm]);

  const updateTicketStatus = async (ticketId, nextStatus) => {
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
        console.error(err2);
        toast.error('Failed to update status');
        fetchTickets();
      }
    }
  };

  return (
    <div className="bg-[#f5f7f6] rounded-2xl p-6 border border-slate-200 shadow-soft space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-500">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[380px]">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search across ticket, subject, customer, status, category, and priority"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => setIsMasterDataOpen(true)}
            className="flex items-center gap-1.5 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <FiDatabase className="text-sm" />
            <span>Master Data</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-28 whitespace-nowrap">Ticket ID</th>
              <th className="py-3 px-4 min-w-[180px]">Subject</th>
              <th className="py-3 px-4 w-24 whitespace-nowrap">Customer</th>
              <th className="py-3 px-4 w-28 whitespace-nowrap">Category</th>
              <th className="py-3 px-4 w-24 whitespace-nowrap">Priority</th>
              <th className="py-3 px-4 w-32 whitespace-nowrap">Status</th>
              <th className="py-3 px-4 w-40 text-right whitespace-nowrap">SLA Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {loading ? (
              <tr>
                <td className="py-6 px-4 text-slate-500 text-center" colSpan={7}>
                  Loading tickets…
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td className="py-6 px-4 text-slate-500 text-center" colSpan={7}>
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const rawId = getTicketId(ticket);
                const currentStatus = getStatus(ticket);
                const isSelected = selectedTicket && getTicketId(selectedTicket) === rawId;

                return (
                  <tr
                    key={rawId}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/80' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700 whitespace-nowrap" title={rawId}>
                      {formatShortId(rawId)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{getSubject(ticket)}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{getCustomer(ticket)}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        {getCategory(ticket)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={getPriority(ticket)} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={currentStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTicketStatus(rawId, e.target.value);
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold outline-none transition-colors cursor-pointer ${
                          currentStatus === 'RESOLVED' || currentStatus === 'AI_RESOLVED'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : currentStatus === 'IN_PROGRESS' || currentStatus === 'ASSIGNED'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : currentStatus === 'PENDING_AGENT_REVIEW' || currentStatus === 'ESCALATED' || currentStatus === 'PENDING_HUMAN_REVIEW'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : currentStatus === 'PENDING_ASSIGNMENT'
                            ? 'border-violet-200 bg-violet-50 text-violet-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                        title="Update status"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="PENDING_ASSIGNMENT">PENDING_ASSIGNMENT</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="PENDING_AGENT_REVIEW">PENDING_AGENT_REVIEW</option>
                        <option value="AI_RESOLVED">AI_RESOLVED</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="ESCALATED">ESCALATED</option>
                        <option value="PENDING_HUMAN_REVIEW">PENDING_HUMAN_REVIEW</option>
                        <option value="REOPENED">REOPENED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">{renderSLA(ticket)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr] pt-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-[15px] font-bold text-[#021d17]">Selected ticket overview</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                  {getStatus(selectedTicket).toLowerCase() === 'escalated' ? 'Escalated' : getStatus(selectedTicket)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {getPriority(selectedTicket)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ticket ID</div>
                <div className="mt-1 text-xs font-mono font-semibold text-[#021d17] break-all">{getTicketId(selectedTicket)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Category</div>
                <div className="mt-1 text-xs font-semibold text-[#021d17]">{getCategory(selectedTicket)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer</div>
                <div className="mt-1 text-xs font-semibold text-[#021d17]">{getCustomer(selectedTicket)}</div>
                <div className="mt-1 text-[11px] text-slate-500">No email available</div>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Created Date</div>
                <div className="mt-1 text-xs font-semibold text-[#021d17]">
                  {selectedTicket?.created_at ? new Date(selectedTicket.created_at).toLocaleString() : '—'}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</div>
              <p className="text-sm font-semibold text-[#021d17]">{getSubject(selectedTicket)}</p>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</div>
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 whitespace-pre-line min-h-[52px]">
                {selectedTicket?.description || selectedTicket?.details || 'No additional details provided.'}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Escalated - Human intervention required</div>
              <p className="mt-2 text-xs text-amber-800 leading-relaxed font-medium">
                Customer feedback: {getCustomerFeedback(selectedTicket) || 'Customer rejected the automated resolution.'}
              </p>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                {getAiResolution(selectedTicket).length ? 'AI RAG suggested resolution' : 'No RAG recommendation available for this ticket'}
              </p>
              {getAiResolution(selectedTicket).length > 0 ? (
                <ol className="mt-3 text-xs text-amber-800 leading-relaxed list-decimal pl-5 space-y-1">
                  {getAiResolution(selectedTicket).map((step, index) => (
                    <li key={`${getTicketId(selectedTicket)}-rag-${index}`}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-xs text-amber-800 leading-relaxed">
                  No RAG resolution steps were returned for this query yet. The ticket will require agent review.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[15px] font-bold text-[#021d17] mb-4">Quick actions</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Update status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="PENDING_ASSIGNMENT">PENDING_ASSIGNMENT</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="PENDING_AGENT_REVIEW">PENDING_AGENT_REVIEW</option>
                  <option value="AI_RESOLVED">AI_RESOLVED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="ESCALATED">ESCALATED</option>
                  <option value="PENDING_HUMAN_REVIEW">PENDING_HUMAN_REVIEW</option>
                  <option value="REOPENED">REOPENED</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Resolution notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Describe how the issue was resolved."
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mt-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Current queue context</div>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between gap-2"><span className="text-slate-500">Status</span><span className="font-semibold text-rose-600">{getStatus(selectedTicket)}</span></div>
                  <div className="flex items-center justify-between gap-2"><span className="text-slate-500">Priority</span><span className="font-semibold">{getPriority(selectedTicket)}</span></div>
                  <div className="flex items-center justify-between gap-2"><span className="text-slate-500">SLA remaining</span><span className="font-semibold">{renderSLA(selectedTicket)}</span></div>
                  <div className="flex items-center justify-between gap-2"><span className="text-slate-500">Assigned agent</span><span className="font-semibold">{getAssignedAgent(selectedTicket)}</span></div>
                  <div className="flex items-center justify-between gap-2"><span className="text-slate-500">Assigned email</span><span className="font-semibold">{getAssignedEmail(selectedTicket)}</span></div>
                  <div className="flex items-center justify-between gap-2"><span className="text-slate-500">Routing method</span><span className="font-semibold">{getRoutingMethod(selectedTicket)}</span></div>
                  <div className="flex items-center justify-between gap-2"><span className="text-slate-500">AI confidence</span><span className="font-semibold">{Math.round(getAiConfidence(selectedTicket) * 100)}%</span></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveResolution}
                  className="bg-[#d98d5d] hover:bg-[#c77c49] text-white text-[11px] font-semibold px-3 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Send Manual Resolution &amp; Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveResolution}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Save ticket
                </button>
                <button
                  type="button"
                  className="bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold px-3 py-2.5 rounded-lg transition-colors hover:bg-slate-50"
                >
                  View details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MasterDataModal
        isOpen={isMasterDataOpen}
        onClose={() => setIsMasterDataOpen(false)}
      />
    </div>
  );
}