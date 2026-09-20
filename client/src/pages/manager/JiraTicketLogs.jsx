import { useEffect, useMemo, useState, useCallback } from 'react';
import API from '../../api/auth';
import { toast } from 'react-toastify';
import { FiActivity, FiExternalLink, FiRefreshCw, FiSearch } from 'react-icons/fi';

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const STATUS_TONES = {
  Done: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'In Progress': 'bg-amber-50 text-amber-700 border border-amber-200',
  'To Do': 'bg-slate-50 text-slate-600 border border-slate-200',
  Blocked: 'bg-rose-50 text-rose-700 border border-rose-200',
  Escalated: 'bg-rose-50 text-rose-700 border border-rose-200',
};

function statusTone(status) {
  const label = String(status || '').trim();
  return STATUS_TONES[label] || 'bg-slate-50 text-slate-600 border border-slate-200';
}

export default function JiraTicketLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadJiraLogs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await API.get('/manager/jira-tickets/', {
        params: searchTerm ? { search: searchTerm } : undefined,
      });
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setLogs(payload);
    } catch (err) {
      console.error('Jira logs fetch error:', err);
      setLogs([]);
      toast.error('Failed to fetch Jira ticket logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadJiraLogs(true);
  }, [loadJiraLogs]);

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const q = searchTerm.toLowerCase();
    return logs.filter(
      (log) =>
        String(log.jira_issue_key || '').toLowerCase().includes(q) ||
        String(log.ticket_id || '').toLowerCase().includes(q) ||
        String(log.ticket_title || '').toLowerCase().includes(q) ||
        String(log.ticket_category || '').toLowerCase().includes(q) ||
        String(log.jira_status || '').toLowerCase().includes(q)
    );
  }, [logs, searchTerm]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[18px] border border-[#dfe5e1] bg-white px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3px] text-[#8b95a1]">
            <FiActivity className="h-3.5 w-3.5 text-[#14532d]" />
            Jira Sync Log
          </div>
          <h1 className="mt-1 text-[24px] font-bold tracking-tight text-[#1c2430]">
            Jira Ticket Logs
          </h1>
          <p className="mt-1 text-[12px] text-[#64748b]">
            Sync history for tickets escalated to Jira.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-[280px]">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a1]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Jira key, ticket name, or ID"
              className="w-full rounded-[10px] border border-[#dfe5e1] bg-white py-2.5 pl-10 pr-3 text-[12px] outline-none focus:border-[#14532d]"
            />
          </label>
          <button
            type="button"
            onClick={() => loadJiraLogs(false)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#dfe5e1] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#1c2430] transition hover:border-[#14532d]"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        <div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">Total Syncs</div>
              <div className="mt-2 text-[28px] font-extrabold tracking-tight text-[#1c2430]">
                {logs.length}
              </div>
            </div>
            <div className="rounded-full bg-[#eef4ef] p-2.5 text-[#14532d]">
              <FiActivity className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">Done</div>
              <div className="mt-2 text-[28px] font-extrabold tracking-tight text-[#1c2430]">
                {logs.filter((l) => l.jira_status === 'Done').length}
              </div>
            </div>
            <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-700">
              <FiActivity className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]">Pending</div>
              <div className="mt-2 text-[28px] font-extrabold tracking-tight text-[#1c2430]">
                {logs.filter((l) => l.jira_status !== 'Done').length}
              </div>
            </div>
            <div className="rounded-full bg-amber-100 p-2.5 text-amber-700">
              <FiActivity className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-[14px] border border-[#dfe5e1] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#dfe5e1] px-4 py-3.5">
          <h2 className="text-[15px] font-bold text-[#1c2430]">Sync History</h2>
          <span className="text-[11.5px] text-[#64748b]">
            {filteredLogs.length} of {logs.length} records
          </span>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-[12px] text-[#64748b]">
            Loading Jira ticket logs...
          </div>
        ) : filteredLogs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-[12px]">
              <thead className="bg-[#f8faf9] text-[10.5px] font-bold uppercase tracking-[0.4px] text-[#64748b]">
                <tr>
                  <th className="px-4 py-3">Jira Issue Key</th>
                  <th className="px-3 py-3">Ticket</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Jira Status</th>
                  <th className="px-3 py-3">Ticket Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f0]">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="transition hover:bg-[#fafbfa]">
                    <td className="px-4 py-3 font-mono font-medium text-[#14532d]">
                      {log.jira_issue_key || '—'}
                    </td>
                    <td className="px-3 py-3 text-[#334155]">
                      <div className="max-w-[300px] truncate font-semibold text-[#1c2430]">{log.ticket_title || 'Ticket details unavailable'}</div>
                      <div className="mt-0.5 font-mono text-[10.5px] text-[#64748b]">{log.ticket_id || 'ID unavailable'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-[#334155]">{log.ticket_priority || '—'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusTone(log.jira_status)}`}
                      >
                        {log.jira_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[#475569]">{log.ticket_status ? log.ticket_status.replace(/_/g, ' ') : '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      <div className="flex items-center justify-between gap-3">
                        <span>{formatDate(log.last_updated)}</span>
                        {(log.jira_url || log.jira_link || log.url) && (
                          <a
                            href={log.jira_url || log.jira_link || log.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[#b8d7c2] px-2.5 py-1.5 text-[10px] font-semibold text-[#14532d] transition hover:border-[#14532d] hover:bg-[#eef7f0]"
                          >
                            <FiExternalLink className="h-3.5 w-3.5" />
                            View in Jira
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#eef4ef]">
              <FiActivity className="h-6 w-6 text-[#14532d]" />
            </div>
            <div className="text-[13px] font-semibold text-[#1c2430]">
              No Jira ticket logs found
            </div>
            <div className="mt-1 text-[11.5px] text-[#8b95a1]">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Tickets escalated to Jira will appear here once synced.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
