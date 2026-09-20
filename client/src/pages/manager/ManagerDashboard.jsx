import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../api/auth';
import { PriorityBadge, StatusBadge, CategoryTag } from '../../components/common/Badge';
import { toast } from 'react-toastify';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiInbox,
  FiRefreshCw,
  FiShield,
  FiUsers,
  FiX,
  FiZap,
} from 'react-icons/fi';

// --- Helpers ----------------------------------------------------------------

function toTitleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeTicket(raw) {
  return {
    ...raw,
    _id: raw?._id || raw?.id || raw?.ticketId,
    id: raw?.ticketId || raw?.ticket_id || raw?.id || raw?._id || 'N/A',
    title: raw?.subject || raw?.title || 'Untitled ticket',
    description: raw?.description || raw?.message || raw?.details || '',
    customer: raw?.customer || raw?.customer_name || raw?.customerName || raw?.customer_id || 'Unknown customer',
    customerEmail: raw?.customer_email || raw?.customerEmail || raw?.email || '',
    category: toTitleCase(raw?.category || 'General'),
    priority: String(raw?.priority || 'LOW').toUpperCase(),
    status: String(raw?.status || 'OPEN').toUpperCase(),
    createdAt: raw?.createdAt || raw?.created_at || raw?.date || raw?.timestamp || '',
    assignedAgent: raw?.assigned_agent || raw?.assignedAgent || raw?.agent || '',
    assignedEmail: raw?.assigned_email || raw?.assignedEmail || '',
    routingMethod: raw?.routing_method || raw?.routingMethod || '',
    aiConfidence: Number(raw?.ai_confidence ?? raw?.aiConfidence ?? 0) || 0,
    aiResolution: raw?.ai_resolution || raw?.aiResolution || raw?.suggested_resolution || [],
  };
}

function routingReason(ticket) {
  if (ticket.routingMethod === 'MANUAL_MANAGER_ASSIGNMENT') {
    return { label: 'Manual Manager Assignment', className: 'bg-blue-50 text-blue-700' };
  }
  if (ticket.routingMethod === 'UNMAPPED_CATEGORY' || ticket.status === 'PENDING_ASSIGNMENT') {
    return { label: 'Unmapped Category (Pending Assignment)', className: 'bg-orange-50 text-orange-700' };
  }
  if (ticket.routingMethod === 'AUTOMATED_SKILL_BASED') {
    return { label: `Auto-Assigned (Skill Match: ${ticket.category})`, className: 'bg-emerald-50 text-emerald-700' };
  }
  if (ticket.aiConfidence <= 0.75 && ticket.status !== 'AI_RESOLVED') {
    return { label: 'Low AI Confidence (<75%)', className: 'bg-amber-50 text-amber-700' };
  }
  return { label: 'AI Resolution', className: 'bg-emerald-500/10 text-emerald-300' };
}

function normalizeAgent(raw) {
  return {
    ...raw,
    id: raw?.id || raw?._id,
    name: raw?.display_name || raw?.name ||
      [raw?.first_name, raw?.last_name].filter(Boolean).join(' ') || raw?.email || 'Unknown Agent',
    activeTickets: Number(raw?.active_tickets ?? raw?.activeTickets ?? 0) || 0,
  };
}

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function shortTicketId(id) {
  const text = String(id || '');
  return text.length > 8 ? `#${text.slice(-8).toUpperCase()}` : text;
}

function confidenceColor(value) {
  const pct = Math.round(Number(value || 0) * 100);
  if (pct >= 80) return 'text-emerald-600';
  if (pct >= 60) return 'text-amber-600';
  return 'text-rose-600';
}

function confidenceBarColor(value) {
  const pct = Math.round(Number(value || 0) * 100);
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

// --- Small components -------------------------------------------------------

function MetricCard({ icon: Icon, label, value, helper, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    rose: 'bg-rose-100 text-rose-700',
  };
  return (
    <div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">{label}</div>
          <div className="mt-2 text-[28px] font-extrabold tracking-tight text-[#1c2430]">{value}</div>
          <div className="mt-1 text-[11.5px] text-[#64748b]">{helper}</div>
        </div>
        <div className={`rounded-full p-2.5 ${tones[tone] || tones.slate}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function ConfidenceMeter({ value }) {
  const pct = Math.round(Number(value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#edf2ef]">
        <div className={`h-full rounded-full ${confidenceBarColor(value)} transition-all`}
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
      </div>
      <span className={`font-mono text-[11px] font-bold ${confidenceColor(value)}`}>{pct}%</span>
    </div>
  );
}

function AIInsightsDrawer({ ticket, agents, onAssign, onClose, assigning }) {
  if (!ticket) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0f172acc]">
      <button type="button" aria-label="Close drawer" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-[#dfe5e1] bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#eef4ef] text-[#14532d]">
                <FiZap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">AI RAG Diagnosis</div>
                <h2 className="mt-0.5 text-[16px] font-bold text-[#1c2430]">{shortTicketId(ticket.id)} — {ticket.title}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="min-h-11 min-w-11 rounded-full p-2 text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]">
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-[12px] border border-[#dfe5e1] bg-[#fafcfb] p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">AI Confidence</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[22px] font-extrabold text-[#1c2430]">{Math.round(Number(ticket.aiConfidence || 0) * 100)}%</div>
              <ConfidenceMeter value={ticket.aiConfidence} />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">Ticket</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[10px] bg-[#f8faf9] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#8b95a1]">Customer</div>
                <div className="mt-1 text-[13px] font-semibold text-[#1c2430]">{ticket.customer}</div>
                <div className="text-[11px] text-[#64748b]">{ticket.customerEmail || 'No email'}</div>
              </div>
              <div className="rounded-[10px] bg-[#f8faf9] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#8b95a1]">Created</div>
                <div className="mt-1 text-[12px] font-semibold text-[#1c2430]">{formatDate(ticket.createdAt)}</div>
              </div>
              <div className="rounded-[10px] bg-[#f8faf9] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#8b95a1]">Category</div>
                <div className="mt-1"><CategoryTag category={ticket.category} /></div>
              </div>
              <div className="rounded-[10px] bg-[#f8faf9] p-3">
                <div className="text-[10px] font-semibold uppercase text-[#8b95a1]">Priority</div>
                <div className="mt-1"><PriorityBadge priority={ticket.priority} /></div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.3px] text-emerald-200/60">Description</div>
            <div className="rounded-[10px] border border-[#dfe5e1] p-4 text-[12.5px] leading-6 text-[#475569]">
              {ticket.description || 'No description provided.'}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.3px] text-emerald-200/60">RAG Suggested Resolution Steps</div>
            {ticket.aiResolution && ticket.aiResolution.length ? (
              <ol className="space-y-2 rounded-lg border border-emerald-800/60 p-4">
                {ticket.aiResolution.map((step, index) => (
                  <li key={`${ticket._id}-step-${index}`} className="flex gap-3 text-[12.5px] leading-5 text-[#475569]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-400">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="rounded-[10px] border border-dashed border-[#dfe5e1] bg-[#fafcfb] p-4 text-[12px] text-[#8b95a1]">
                No RAG resolution steps are available yet.
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[#dfe5e1] bg-[#fafcfb] p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">Quick Assignment</div>
            {agents.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {agents.slice(0, 4).map((agent) => (
                  <button key={agent.id} type="button" onClick={() => onAssign(ticket, agent)} disabled={assigning}
                    className="flex min-h-11 items-center gap-3 rounded-[10px] border border-[#dfe5e1] bg-white px-3 py-2.5 text-left transition hover:border-[#14532d] hover:bg-[#eef4ef] disabled:cursor-not-allowed disabled:opacity-60">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#14532d] text-[10px] font-bold text-white">
                      {agent.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-semibold text-[#1c2430]">{agent.name}</div>
                      <div className="text-[10.5px] text-[#64748b]">{agent.activeTickets} active</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-[12px] text-[#8b95a1]">No agents available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page -------------------------------------------------------------

export default function ManagerDashboard() {
  const location = useLocation();
  const isUnassignedQueue = location.pathname.endsWith('/unassigned-queue');
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const agentsRef = useRef([]);
  agentsRef.current = agents;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [agentDrafts, setAgentDrafts] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(new URLSearchParams(location.search).get('search') || '');
  }, [location.search]);

  const loadUnassignedTickets = useCallback(async (showLoader = true, agentsList = null) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await API.get(`/manager/unassigned-tickets/${isUnassignedQueue ? '' : '?scope=all'}`);
      const payload = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const nextTickets = payload.map(normalizeTicket);
      setTickets(nextTickets);
      const agentsToUse = agentsList || agentsRef.current;
      setAgentDrafts((current) => {
        const next = { ...current };
        nextTickets.forEach((ticket) => {
          if (!next[ticket._id] && ticket.assignedAgent) {
            const match = agentsToUse.find((agent) =>
              (ticket.assignedEmail && agent.email === ticket.assignedEmail) ||
              agent.name === ticket.assignedAgent
            );
            if (match) next[ticket._id] = match.id;
          }
        });
        return next;
      });
    } catch {
      setTickets([]);
      toast.error('Failed to fetch unassigned tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isUnassignedQueue]);

  const loadAgents = useCallback(async () => {
    try {
      const response = await API.get('/manager/agents/');
      const payload = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const nextAgents = payload.map(normalizeAgent);
      setAgents(nextAgents);
      return nextAgents;
    } catch {
      setAgents([]);
      toast.error('Failed to fetch agents');
      return [];
    }
  }, []);

  useEffect(() => {
    loadAgents().then((loadedAgents) => loadUnassignedTickets(true, loadedAgents));
  }, [loadAgents, loadUnassignedTickets]);

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === 'ALL' ? true : ticket.status === statusFilter;
      const searchTarget = [ticket.id, ticket.title, ticket.customer, ticket.customerEmail, ticket.category, ticket.priority].join(' ').toLowerCase();
      return matchesStatus && (query ? searchTarget.includes(query) : true);
    });
  }, [searchTerm, statusFilter, tickets]);

  const metrics = useMemo(() => {
    const escalations = tickets.filter((t) => t.status === 'ESCALATED' || t.status === 'PENDING_HUMAN_REVIEW').length;
    return {
      totalUnassigned: tickets.length,
      activeAgents: agents.filter((agent) => agent.activeTickets > 0).length || agents.length,
      escalations,
    };
  }, [tickets, agents]);

  const handleAssign = async (ticket, agent) => {
    if (!agent?.id) {
      toast.error('Select an agent first.');
      return;
    }
    setAssigningId(ticket._id);
    try {
      await API.post('/manager/assign-ticket/', {
        ticket_id: ticket._id || ticket.id,
        agent_id: agent.id,
      });
      toast.success(`Ticket ${shortTicketId(ticket.id)} assigned to ${agent.name}`);
      setTickets((current) => current.filter((t) => t._id !== ticket._id));
      setAgentDrafts((current) => {
        const next = { ...current };
        delete next[ticket._id];
        return next;
      });
      if (selectedTicket?._id === ticket._id) {
        setSelectedTicket(null);
        setDrawerOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to assign ticket');
    } finally {
      setAssigningId(null);
    }
  };

  const statusOptions = useMemo(() => {
    const statuses = new Set(tickets.map((t) => t.status));
    return ['ALL', ...Array.from(statuses)];
  }, [tickets]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[18px] border border-[#dfe5e1] bg-white px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3px] text-[#8b95a1]">
            <FiShield className="h-3.5 w-3.5 text-[#14532d]" />
            {isUnassignedQueue ? 'Assignment Workbench' : 'Agent Manager Console'}
          </div>
          <h1 className="mt-1 text-[24px] font-bold tracking-tight text-[#1c2430]">{isUnassignedQueue ? 'Unassigned Queue' : 'Ticket Console'}</h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#64748b]">{isUnassignedQueue ? 'Prioritised tickets waiting for an owner. Assign work with clear workload and AI context.' : 'Review ticket ownership, routing reason, and RAG diagnosis before assigning or reassigning work.'}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => loadUnassignedTickets(false)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#dfe5e1] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#1c2430] transition hover:border-[#14532d]">
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FiInbox} label={isUnassignedQueue ? 'Waiting for Assignment' : 'Tickets in View'} value={metrics.totalUnassigned} helper={isUnassignedQueue ? 'Ready for an agent' : 'Across all ticket states'} tone="amber" />
        <MetricCard icon={FiUsers} label="Active Agents" value={metrics.activeAgents} helper="Currently handling tickets" tone="green" />
        <MetricCard icon={FiClock} label="Avg Assignment Time" value="< 1h" helper="Based on current queue age" tone="blue" />
        <MetricCard icon={FiAlertCircle} label="Escalations" value={metrics.escalations} helper="Require immediate attention" tone="rose" />
      </div>

      {/* Assignment Table */}
      <div className="mt-6 rounded-[14px] border border-[#dfe5e1] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#dfe5e1] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-[#1c2430]">{isUnassignedQueue ? 'Assignment-ready tickets' : 'Ticket ownership overview'}</h2>
            <div className="mt-1 text-[11.5px] text-[#64748b]">Sorted by priority, then AI diagnosis confidence.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => {
              const isActive = statusFilter === status;
              return (
                <button key={status} type="button" onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition ${
                    isActive ? 'bg-[#14532d] text-white' : 'border border-[#dfe5e1] bg-white text-[#334155] hover:border-[#14532d]'
                  }`}>
                  {status === 'ALL' ? 'All' : status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-[12px] text-[#64748b]">Loading unassigned ticket queue...</div>
        ) : filteredTickets.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1150px] w-full text-left text-[12px]">
              <thead className="bg-[#f8faf9] text-[10.5px] font-bold uppercase tracking-[0.4px] text-[#64748b]">
                <tr>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">AI Confidence</th>
                  <th className="px-3 py-3">Routing Reason</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Assigned Agent Email</th>
                  <th className="px-4 py-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const selectedAgentId = agentDrafts[ticket._id] || '';
                  return (
                    <tr key={ticket._id} className="border-b border-[#eef2f0] transition hover:bg-[#fafbfa]">
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => { setSelectedTicket(ticket); setDrawerOpen(true); }}
                          className="inline-flex min-h-11 items-center gap-2 font-mono font-bold text-[#14532d] hover:underline">
                          {shortTicketId(ticket.id)}
                          <FiEye className="h-3.5 w-3.5 text-[#8b95a1]" />
                        </button>
                        <div className="mt-1 max-w-[220px] truncate text-[11.5px] font-medium text-[#334155]">{ticket.title}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-[#1c2430]">{ticket.customer}</div>
                        <div className="mt-0.5 text-[10.5px] text-[#8b95a1]">{ticket.customerEmail || 'No email'}</div>
                      </td>
                      <td className="px-3 py-3"><CategoryTag category={ticket.category} /></td>
                      <td className="px-3 py-3"><ConfidenceMeter value={ticket.aiConfidence} /></td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex max-w-[220px] rounded-full px-2.5 py-1 text-[10.5px] font-bold ${routingReason(ticket).className}`}>
                          {routingReason(ticket).label}
                        </span>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={ticket.status} /></td>
                      <td className="px-3 py-3">
                        <div className="mb-1 text-[11px] font-semibold text-[#334155]">{ticket.assignedEmail || 'Unassigned'}</div>
                        <select aria-label={`Assign ${shortTicketId(ticket.id)}`} value={selectedAgentId}
                          onChange={(e) => setAgentDrafts((cur) => ({ ...cur, [ticket._id]: e.target.value }))}
                          className="min-h-11 w-52 rounded-[8px] border border-[#dfe5e1] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1c2430] outline-none focus:border-[#14532d]">
                          <option value="">Select agent...</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>{agent.email || agent.name} ({agent.activeTickets} active)</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button"
                          onClick={() => {
                            const agent = agents.find((a) => a.id === selectedAgentId);
                            if (agent) handleAssign(ticket, agent);
                          }}
                          disabled={!selectedAgentId || assigningId === ticket._id}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] bg-[#14532d] px-4 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-[#0f3e22] disabled:cursor-not-allowed disabled:opacity-40">
                          {assigningId === ticket._id ? (
                            <><FiRefreshCw className="h-3.5 w-3.5 animate-spin" /> Assigning...</>
                          ) : (
                            <><FiCheckCircle className="h-3.5 w-3.5" /> Assign</>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10">
            <FiCheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-[13px] font-semibold text-[#1c2430]">No unassigned tickets</div>
            <div className="mt-1 text-[11.5px] text-[#64748b]">New tickets routed for human review will appear here.</div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#dfe5e1] px-4 py-3 text-[11.5px] text-[#64748b]">
          <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
          <span>Sorted by priority → AI confidence</span>
        </div>
      </div>

      {/* Slide-over drawer */}
      <AIInsightsDrawer
        ticket={selectedTicket && drawerOpen ? selectedTicket : null}
        agents={agents}
        onAssign={handleAssign}
        onClose={() => setDrawerOpen(false)}
        assigning={assigningId !== null}
      />
    </div>
  );
}