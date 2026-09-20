import { useContext, useEffect, useMemo, useState } from 'react';
import API from '../../api/auth';
import { AuthContext } from '../../context/AuthContext';
import { PriorityBadge, StatusBadge, CategoryTag } from '../../components/common/Badge';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiTag,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ['ALL', 'Open', 'Pending Assignment', 'Assigned', 'In Progress', 'Pending Agent Review', 'AI Resolved', 'Resolved', 'Escalated', 'Pending Human Review', 'Reopened'];
const PRIORITY_ORDER = ['P1', 'P2', 'P3', 'P4'];
const CATEGORY_FALLBACK = ['Technical', 'Billing', 'Account', 'General'];

function ShellCard({ title, right, children, className = '' }) {
  return (
    <div className={`rounded-[14px] border border-[#dfe5e1] bg-white shadow-sm ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between border-b border-[#dfe5e1] px-4 py-3">
          <h3 className="text-[13px] font-bold text-[#1c2430]">{title}</h3>
          {right ? <div>{right}</div> : null}
        </div>
      )}
      <div className={title || right ? 'p-4' : ''}>{children}</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, helper, tone = 'slate' }) {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[#8b95a1]">
            {label}
          </div>
          <div className="mt-2 text-[28px] font-extrabold tracking-tight text-[#1c2430]">{value}</div>
          <div className="mt-1 text-[11.5px] text-[#64748b]">{helper}</div>
        </div>
        <div className={`rounded-full p-2.5 ${toneClasses[tone] || toneClasses.slate}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function SummaryCountGrid({ items, emptyLabel }) {
  if (!items.length) {
    return (
      <div className="rounded-[10px] border border-dashed border-[#dfe5e1] bg-[#fafcfb] p-4 text-[12px] text-[#8b95a1]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-[12px] bg-[#f8faf9] p-3">
          <div className="text-[11px] font-semibold text-[#8b95a1]">{item.label}</div>
          <div className="mt-1 text-[22px] font-bold text-[#1c2430]">{item.count}</div>
        </div>
      ))}
    </div>
  );
}

function DistributionChart({ title, items, accent = '#14532d', emptyLabel }) {
  const maxValue = Math.max(...items.map((item) => item.count), 0);

  return (
    <ShellCard title={title}>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[#334155]">{item.label}</span>
                <span className="font-mono font-bold text-[#1c2430]">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf2ef]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${maxValue ? Math.max((item.count / maxValue) * 100, item.count ? 8 : 0) : 0}%`,
                    backgroundColor: item.color || accent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-[#dfe5e1] bg-[#fafcfb] p-4 text-[12px] text-[#8b95a1]">
          {emptyLabel}
        </div>
      )}
    </ShellCard>
  );
}

function DetailItem({ label, children }) {
  return (
    <div className="rounded-[10px] bg-[#f8faf9] p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.3px] text-[#8b95a1]">{label}</div>
      <div className="mt-1 text-[12.5px] text-[#1c2430]">{children}</div>
    </div>
  );
}

function TicketDetailModal({
  ticket,
  onClose,
  statusDraft,
  onStatusChange,
  resolutionNotes,
  onResolutionNotesChange,
  onSave,
  saving,
}) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172acc] p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#dfe5e1] px-5 py-4">
          <div>
            <div className="text-[11px] text-[#8b95a1]">Ticket details</div>
            <h2 className="mt-1 text-[20px] font-bold text-[#1c2430]">{ticket.subject}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 font-mono text-[11px] font-bold text-[#1d4ed8]">
                {ticket.id}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryTag category={ticket.category} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-5 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Customer">
              <div className="font-semibold">{ticket.customer}</div>
              <div className="mt-0.5 text-[11px] text-[#64748b]">{ticket.customerEmail || 'No email available'}</div>
            </DetailItem>

            <DetailItem label="Created date">{formatDate(ticket.createdAt)}</DetailItem>
            <DetailItem label="Current status">
              <StatusBadge status={ticket.status} />
            </DetailItem>
            <DetailItem label="Assigned agent">{ticket.assignedAgent || 'Unassigned'}</DetailItem>
            <DetailItem label="Assigned agent email">{ticket.assignedEmail || 'Unassigned'}</DetailItem>
            <DetailItem label="Routing method">{ticket.routingMethodLabel}</DetailItem>
            <DetailItem label="AI confidence">{Math.round(ticket.aiConfidence * 100)}%</DetailItem>
            <DetailItem label="Priority">
              <PriorityBadge priority={ticket.priority} />
            </DetailItem>
            <DetailItem label="Category">
              <CategoryTag category={ticket.category} />
            </DetailItem>
          </div>

          <div className="mt-4 rounded-[12px] border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-emerald-800">
              Why this ticket was assigned to you
            </div>
            <div className="mt-1 text-[13px] font-semibold text-emerald-950">
              {ticket.routingMethod === 'MANUAL_MANAGER_ASSIGNMENT'
                ? 'Manually assigned by Manager'
                : `Assigned via ${ticket.category} expertise matching`}
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <DetailItem label="Description">
              <div className="whitespace-pre-wrap leading-6 text-[#475569]">{ticket.description || 'No description provided.'}</div>
            </DetailItem>

            <div className="rounded-[12px] border border-[#dfe5e1] p-4">
              <div className="mb-3 text-[12px] font-bold text-[#1c2430]">Update ticket status</div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-[11.5px] font-semibold text-[#475569]">
                  Status
                  <select
                    value={statusDraft}
                    onChange={(event) => onStatusChange(event.target.value)}
                    className="rounded-[8px] border border-[#dfe5e1] bg-white px-3 py-2 text-[12px] font-medium text-[#1c2430] outline-none focus:border-[#14532d]"
                  >
                    {STATUS_OPTIONS.filter((option) => option !== 'ALL').map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <DetailItem label="SLA">{ticket.slaTimeRemaining || 'Not available'}</DetailItem>
              </div>

              {statusDraft === 'Resolved' && (
                <label className="mt-4 grid gap-1.5 text-[11.5px] font-semibold text-[#475569]">
                  Resolution notes
                  <textarea
                    value={resolutionNotes}
                    onChange={(event) => onResolutionNotesChange(event.target.value)}
                    placeholder="Describe how the issue was resolved."
                    rows={4}
                    className="w-full resize-none rounded-[8px] border border-[#dfe5e1] px-3 py-2 text-[12.5px] text-[#1c2430] outline-none focus:border-[#14532d]"
                  />
                </label>
              )}

              {ticket.resolutionNotes && statusDraft !== 'Resolved' && (
                <div className="mt-4 rounded-[10px] bg-[#f8faf9] p-3">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.3px] text-[#8b95a1]">Existing resolution notes</div>
                  <div className="mt-1 whitespace-pre-wrap text-[12px] text-[#475569]">{ticket.resolutionNotes}</div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-[8px] bg-[#14532d] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#0f3e22] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeStatus(value) {
  const cleanValue = String(value || '')
    .replace(/[_-]/g, ' ')
    .trim()
    .toLowerCase();

  if (cleanValue === 'in progress') return 'In Progress';
  if (cleanValue === 'escalated' || cleanValue === 'pending human review') return 'Escalated';
  if (cleanValue === 'resolved' || cleanValue === 'closed') return 'Resolved';
  return 'Open';
}

function normalizePriority(value) {
  const cleanValue = String(value || 'P4').trim().toUpperCase();
  return PRIORITY_ORDER.includes(cleanValue) ? cleanValue : 'P4';
}

function normalizeCategory(value) {
  const cleanValue = String(value || 'General').replace(/[_-]/g, ' ').trim();
  return cleanValue ? toTitleCase(cleanValue) : 'General';
}

function normalizeTicket(rawTicket) {
  return {
    ...rawTicket,
    _id: rawTicket?._id || rawTicket?.id || rawTicket?.ticketId,
    id: rawTicket?.ticketId || rawTicket?.ticket_id || rawTicket?.id || rawTicket?._id || 'N/A',
    subject: rawTicket?.subject || rawTicket?.title || 'Untitled ticket',
    description: rawTicket?.description || rawTicket?.message || rawTicket?.details || '',
    customer:
      rawTicket?.customer ||
      rawTicket?.customer_id ||
      rawTicket?.customerName ||
      rawTicket?.requester ||
      rawTicket?.customer_name ||
      rawTicket?.user?.name ||
      'Unknown customer',
    customerEmail:
      rawTicket?.customerEmail ||
      rawTicket?.email ||
      rawTicket?.customer_email ||
      rawTicket?.requesterEmail ||
      rawTicket?.user?.email ||
      '',
    priority: normalizePriority(rawTicket?.priority),
    category: normalizeCategory(rawTicket?.category),
    status: normalizeStatus(rawTicket?.status),
    createdAt: rawTicket?.createdAt || rawTicket?.created_at || rawTicket?.date || rawTicket?.timestamp || '',
    assignedAgent:
      rawTicket?.assigned_agent ||
      rawTicket?.assignedAgent ||
      rawTicket?.agent ||
      rawTicket?.owner ||
      '',
    assignedEmail: rawTicket?.assigned_email || rawTicket?.assignedEmail || '',
    aiConfidence: Number(rawTicket?.ai_confidence ?? rawTicket?.aiConfidence ?? 0) || 0,
    routingMethod: rawTicket?.routing_method || rawTicket?.routingMethod || '',
    routingMethodLabel: rawTicket?.routing_method === 'MANUAL_MANAGER_ASSIGNMENT'
      ? 'Manual Manager Assignment'
      : rawTicket?.routing_method === 'AUTOMATED_SKILL_BASED'
        ? `Auto (Skill-Match: ${normalizeCategory(rawTicket?.category)})`
        : rawTicket?.routing_method === 'UNMAPPED_CATEGORY'
          ? 'Unmapped Category (Pending Assignment)'
          : 'AI Processing',
    slaTimeRemaining: rawTicket?.slaTimeRemaining || rawTicket?.sla || rawTicket?.timeRemaining || 'Not set',
    resolutionNotes:
      rawTicket?.resolutionNotes ||
      rawTicket?.resolution_notes ||
      rawTicket?.notes ||
      '',
    aiResolution: rawTicket?.ai_resolution || rawTicket?.suggested_resolution || [],
    customerFeedback: rawTicket?.customer_feedback || '',
    assignedTeam: rawTicket?.assigned_team || '',
    requiresHumanReview: Boolean(rawTicket?.requires_human_review),
  };
}

async function persistTicketUpdate(ticketId, payload) {
  try {
    const response = await API.patch(`/tickets/${ticketId}/`, payload);
    return response?.data || null;
  } catch (firstError) {
    const response = await API.patch(`/tickets/${ticketId}`, payload);
    return response?.data || null;
  }
}

export default function AgentDashboard() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const [statusDraft, setStatusDraft] = useState('Open');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTickets = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await API.get('/agent/tickets/');
      const payload = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const nextTickets = payload.map(normalizeTicket);

      setTickets(nextTickets);
      setSelectedTicketId((currentId) =>
        nextTickets.some((ticket) => ticket._id === currentId) ? currentId : nextTickets[0]?._id || null
      );
    } catch (error) {
      setTickets([]);
      setSelectedTicketId(null);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets(true);
  }, []);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedTicketId) || null,
    [selectedTicketId, tickets]
  );

  useEffect(() => {
    if (!detailTicket) return;

    const updatedTicket = tickets.find((ticket) => ticket._id === detailTicket._id);
    if (updatedTicket) {
      setDetailTicket(updatedTicket);
    }
  }, [detailTicket, tickets]);

  useEffect(() => {
    const sourceTicket = detailTicket || selectedTicket;
    if (!sourceTicket) return;

    setStatusDraft(sourceTicket.status);
    setResolutionNotes(sourceTicket.resolutionNotes || '');
  }, [detailTicket, selectedTicket]);

  const categoryOptions = useMemo(() => {
    const categories = new Set(CATEGORY_FALLBACK);
    tickets.forEach((ticket) => categories.add(ticket.category));
    return ['ALL', ...Array.from(categories)];
  }, [tickets]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
      case 'AI Resolved':
      case 'Closed':
        return '#15803d'; // green
      case 'In Progress':
      case 'Assigned':
        return '#d97706'; // amber
      case 'Pending Agent Review':
      case 'Pending Human Review':
      case 'Escalated':
        return '#dc2626'; // red
      case 'Pending Assignment':
        return '#7c3aed'; // purple
      case 'Reopened':
        return '#0891b2'; // cyan
      default:
        return '#2563eb'; // blue for Open, etc.
    }
  };

  const statusCounts = useMemo(
    () =>
      STATUS_OPTIONS.filter((status) => status !== 'ALL').map((status) => ({
        label: status,
        count: tickets.filter((ticket) => ticket.status === status).length,
        color: getStatusColor(status),
      })),
    [tickets]
  );

  const priorityCounts = useMemo(
    () =>
      PRIORITY_ORDER.map((priority) => ({
        label: priority,
        count: tickets.filter((ticket) => ticket.priority === priority).length,
      })),
    [tickets]
  );

  const categoryCounts = useMemo(() => {
    const counts = tickets.reduce((accumulator, ticket) => {
      accumulator[ticket.category] = (accumulator[ticket.category] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count);
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === 'ALL' ? true : ticket.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' ? true : ticket.category === categoryFilter;
      const searchTarget = [
        ticket.id,
        ticket.subject,
        ticket.customer,
        ticket.status,
        ticket.category,
        ticket.priority,
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = query ? searchTarget.includes(query) : true;

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchTerm, statusFilter, tickets]);

  const handleOpenDetails = (ticket) => {
    setSelectedTicketId(ticket._id);
    setDetailTicket(ticket);
  };

  const handleCloseDetails = () => {
    setDetailTicket(null);
  };

  const handleSaveTicket = async () => {
    const targetTicket = detailTicket || selectedTicket;
    if (!targetTicket) return;

    setSaving(true);

    try {
      const nextStatus = statusDraft.toUpperCase().replace(/\s+/g, '_');
      const payload = { status: nextStatus };
      const serverPayload = await persistTicketUpdate(targetTicket._id, payload);
      const updatedTicket = normalizeTicket({
        ...targetTicket,
        ...serverPayload,
        status: serverPayload?.status || nextStatus,
        resolutionNotes:
          statusDraft === 'Resolved'
            ? resolutionNotes.trim() || targetTicket.resolutionNotes || ''
            : targetTicket.resolutionNotes || '',
      });

      setTickets((currentTickets) =>
        currentTickets.map((ticket) => (ticket._id === updatedTicket._id ? updatedTicket : ticket))
      );
      setSelectedTicketId(updatedTicket._id);
      setDetailTicket(updatedTicket);
      toast.success('Ticket updated successfully.');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleManualResolution = async () => {
    const targetTicket = detailTicket || selectedTicket;
    if (!targetTicket || !resolutionNotes.trim()) {
      toast.error('Enter a manual resolution before sending it.');
      return;
    }
    setSaving(true);
    try {
      const serverPayload = await persistTicketUpdate(targetTicket._id, {
        status: 'RESOLVED',
        manual_resolution: resolutionNotes.trim(),
      });
      const updatedTicket = normalizeTicket({ ...targetTicket, ...serverPayload, status: 'RESOLVED', resolutionNotes });
      setTickets((current) => current.filter((ticket) => ticket._id !== updatedTicket._id));
      setSelectedTicketId(null);
      setDetailTicket(null);
      toast.success('Manual resolution sent and ticket closed.');
    } catch (error) {
      toast.error('Unable to send manual resolution.');
    } finally {
      setSaving(false);
    }
  };

  const totalAssigned = tickets.length;
  const openTickets = statusCounts.find((item) => item.label === 'Open')?.count || 0;
  const inProgressTickets = statusCounts.find((item) => item.label === 'In Progress')?.count || 0;
  const resolvedTickets = statusCounts.find((item) => item.label === 'Resolved')?.count || 0;

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[18px] border border-[#dfe5e1] bg-white px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3px] text-[#8b95a1]">Support operations</div>
            <h1 className="mt-1 text-[24px] font-bold tracking-tight text-[#1c2430]">Workload: {user?.email || 'Support Agent'}</h1>
            <p className="mt-1 text-[12px] text-[#64748b]">
              Monitor ticket status, classification, and workload from one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => loadTickets(false)}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#dfe5e1] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#1c2430] transition hover:border-[#14532d]"
            >
              <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={FiUser}
            label="Total tickets assigned"
            value={totalAssigned}
            helper="All tickets returned from the current queue API"
            tone="blue"
          />
          <MetricCard
            icon={FiAlertCircle}
            label="Open tickets"
            value={openTickets}
            helper="Needs first response or active handling"
            tone="amber"
          />
          <MetricCard
            icon={FiClock}
            label="In progress tickets"
            value={inProgressTickets}
            helper="Currently being worked by agents"
            tone="slate"
          />
          <MetricCard
            icon={FiCheckCircle}
            label="Resolved tickets"
            value={resolvedTickets}
            helper="Closed with an available resolution"
            tone="green"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ShellCard title="Ticket counts by priority" right={<FiTag className="h-4 w-4 text-[#8b95a1]" />}>
            <SummaryCountGrid items={priorityCounts} emptyLabel="No priority data available." />
          </ShellCard>

          <ShellCard title="Ticket classification summary" right={<FiFilter className="h-4 w-4 text-[#8b95a1]" />}>
            <SummaryCountGrid items={categoryCounts} emptyLabel="No category data available." />
          </ShellCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <DistributionChart
            title="Tickets by status"
            items={statusCounts}
            accent="#14532d"
            emptyLabel="No ticket status data available."
          />
          <DistributionChart
            title="Tickets by category"
            items={categoryCounts}
            accent="#2563eb"
            emptyLabel="No ticket category data available."
          />
        </div>

        <div className="mt-4 rounded-[14px] border border-[#dfe5e1] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#dfe5e1] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#1c2430]">My ticket queue</h2>
              <div className="mt-1 text-[11.5px] text-[#64748b]">
                Filter tickets by status and category, then open any record for full details.
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition ${
                        isActive
                          ? 'bg-[#14532d] text-white'
                          : 'border border-[#dfe5e1] bg-white text-[#334155] hover:border-[#14532d]'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-[8px] border border-[#dfe5e1] bg-white px-3 py-2 text-[12px] font-medium text-[#1c2430] outline-none focus:border-[#14532d]"
              >
                <option value="ALL">All Categories</option>
                {categoryOptions
                  .filter((category) => category !== 'ALL')
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center text-[12px] text-[#64748b]">Loading ticket queue...</div>
          ) : filteredTickets.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-[12px]">
                <thead className="bg-[#f8faf9] text-[10.5px] font-bold uppercase tracking-[0.4px] text-[#64748b]">
                  <tr>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Assigned Agent Email</th>
                    <th className="px-3 py-3">Routing Method</th>
                    <th className="px-3 py-3">AI Confidence</th>
                    <th className="px-3 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className={`border-b border-[#eef2f0] transition hover:bg-[#fafbfa] ${
                        selectedTicketId === ticket._id ? 'bg-[#eef4ef]/80' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#14532d]">{ticket.id}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketId(ticket._id)}
                          className="max-w-[280px] truncate text-left font-semibold text-[#1c2430] hover:text-[#14532d]"
                        >
                          {ticket.subject}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-[#1c2430]">{ticket.customer}</div>
                        <div className="mt-0.5 text-[10.5px] text-[#8b95a1]">{ticket.customerEmail || 'No email'}</div>
                      </td>
                      <td className="px-3 py-3">
                        <CategoryTag category={ticket.category} />
                      </td>
                      <td className="px-3 py-3">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-3 py-3 text-[11px] font-semibold text-[#334155]">{ticket.assignedEmail || 'Unassigned'}</td>
                      <td className="px-3 py-3 text-[11px] text-[#475569]">{ticket.routingMethodLabel}</td>
                      <td className="px-3 py-3 font-mono text-[11px] font-bold text-[#334155]">{Math.round(ticket.aiConfidence * 100)}%</td>
                      <td className="px-3 py-3 text-[11px] text-[#475569]">{formatDate(ticket.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(ticket)}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#dfe5e1] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[#1c2430] transition hover:border-[#14532d] hover:text-[#14532d]"
                        >
                          <FiEye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-10 text-center">
              <div className="text-[13px] font-semibold text-[#1c2430]">No tickets match the current filters.</div>
              <div className="mt-1 text-[11.5px] text-[#64748b]">
                Try a different status, category, or search keyword.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#dfe5e1] px-4 py-3 text-[11.5px] text-[#64748b]">
            <span>
              Showing {filteredTickets.length} of {tickets.length} tickets
            </span>
            <span>{searchTerm ? `Search: "${searchTerm}"` : 'Search across ticket, subject, customer, status, category, and priority'}</span>
          </div>
        </div>

        {selectedTicket && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <ShellCard
              title="Selected ticket overview"
              right={
                <div className="flex gap-2">
                  <StatusBadge status={selectedTicket.status} />
                  <PriorityBadge priority={selectedTicket.priority} />
                </div>
              }
            >
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailItem label="Ticket ID">{selectedTicket.id}</DetailItem>
                  <DetailItem label="Category">
                    <CategoryTag category={selectedTicket.category} />
                  </DetailItem>
                  <DetailItem label="Customer">
                    <div className="font-semibold">{selectedTicket.customer}</div>
                    <div className="mt-0.5 text-[11px] text-[#64748b]">{selectedTicket.customerEmail || 'No email available'}</div>
                  </DetailItem>
                  <DetailItem label="Created date">{formatDate(selectedTicket.createdAt)}</DetailItem>
                </div>

                <DetailItem label="Subject">
                  <div className="font-semibold">{selectedTicket.subject}</div>
                </DetailItem>

                <DetailItem label="Description">
                  <div className="whitespace-pre-wrap leading-6 text-[#475569]">
                    {selectedTicket.description || 'No description provided.'}
                  </div>
                </DetailItem>

                {['Escalated', 'Reopened'].includes(selectedTicket.status) && (
                  <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                      {selectedTicket.status === 'Reopened' ? 'Reopened - Customer Feedback Requires Attention' : 'Escalated - Human Intervention Required'}
                    </div>
                    <div className="mt-2 text-[12px] text-amber-900">Customer feedback: {selectedTicket.customerFeedback || 'Customer rejected the automated resolution.'}</div>
                    <div className="mt-3 text-[11px] font-bold text-[#1c2430]">Failed RAG recommendation</div>
                    <ol className="mt-1 list-decimal space-y-1 pl-4 text-[12px] text-[#475569]">
                      {selectedTicket.aiResolution.map((step, index) => <li key={`${selectedTicket._id}-rag-${index}`}>{step}</li>)}
                    </ol>
                  </div>
                )}
              </div>
            </ShellCard>

            <ShellCard title="Quick actions">
              <div className="space-y-4">
                <label className="grid gap-1.5 text-[11.5px] font-semibold text-[#475569]">
                  Update status
                  <select
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    className="rounded-[8px] border border-[#dfe5e1] bg-white px-3 py-2 text-[12px] font-medium text-[#1c2430] outline-none focus:border-[#14532d]"
                  >
                    {STATUS_OPTIONS.filter((option) => option !== 'ALL').map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                {(statusDraft === 'Resolved' || ['Escalated', 'Reopened'].includes(selectedTicket.status)) && (
                  <label className="grid gap-1.5 text-[11.5px] font-semibold text-[#475569]">
                    Resolution notes
                    <textarea
                      value={resolutionNotes}
                      onChange={(event) => setResolutionNotes(event.target.value)}
                      placeholder="Describe how the issue was resolved."
                      rows={4}
                      className="w-full resize-none rounded-[8px] border border-[#dfe5e1] px-3 py-2 text-[12.5px] text-[#1c2430] outline-none focus:border-[#14532d]"
                    />
                  </label>
                )}

                <div className="rounded-[12px] bg-[#f8faf9] p-3">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.3px] text-[#8b95a1]">Current queue context</div>
                  <div className="mt-2 grid gap-2 text-[12px] text-[#334155]">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Priority</span>
                      <PriorityBadge priority={selectedTicket.priority} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SLA remaining</span>
                      <span className="font-semibold text-[#1c2430]">{selectedTicket.slaTimeRemaining}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned agent</span>
                      <span className="font-semibold text-[#1c2430]">{selectedTicket.assignedAgent || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned agent email</span>
                      <span className="font-semibold text-[#1c2430]">{selectedTicket.assignedEmail || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Routing method</span>
                      <span className="font-semibold text-[#1c2430]">{selectedTicket.routingMethodLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI confidence</span>
                      <span className="font-semibold text-[#1c2430]">{Math.round(selectedTicket.aiConfidence * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {['Escalated', 'Reopened'].includes(selectedTicket.status) && (
                    <button
                      type="button"
                      onClick={handleManualResolution}
                      disabled={saving || !resolutionNotes.trim()}
                      className="flex-1 rounded-[8px] bg-amber-600 px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Sending...' : 'Send Manual Resolution & Close'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveTicket}
                    disabled={saving}
                    className="flex-1 rounded-[8px] bg-[#14532d] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#0f3e22] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save ticket'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDetails(selectedTicket)}
                    className="rounded-[8px] border border-[#dfe5e1] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#1c2430] transition hover:border-[#14532d]"
                  >
                    View details
                  </button>
                </div>
              </div>
            </ShellCard>
          </div>
        )}
      </div>

      <TicketDetailModal
        ticket={detailTicket}
        onClose={handleCloseDetails}
        statusDraft={statusDraft}
        onStatusChange={setStatusDraft}
        resolutionNotes={resolutionNotes}
        onResolutionNotesChange={setResolutionNotes}
        onSave={handleSaveTicket}
        saving={saving}
      />
    </div>
  );
}
