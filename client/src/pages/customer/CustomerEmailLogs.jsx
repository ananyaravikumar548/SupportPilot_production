import { useCallback, useEffect, useState } from 'react';
import { FiMail, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { fetchCustomerEmailLogs } from '../../services/api';
import API from '../../services/api';

const STATUS_STYLES = {
  SENT: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 ring-rose-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function CustomerEmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [eventFilter, setEventFilter] = useState('ALL');

  const loadLogs = useCallback(async () => {
    try {
      const response = await fetchCustomerEmailLogs();
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Unable to load customer email logs:', error);
      toast.error('Unable to load email logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  const visibleLogs = eventFilter === 'ALL'
    ? logs
    : logs.filter((log) => log.event_type === eventFilter);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const submitFeedback = async (accepted) => {
    if (!selectedLog) return;
    setSubmittingFeedback(true);
    try {
      await API.patch(`/tickets/${selectedLog.ticket_id}/`, accepted
        ? { status: 'RESOLVED', customer_feedback: 'ACCEPTED' }
        : { status: 'ESCALATED', customer_feedback: 'REJECTED_NEEDS_HUMAN' });
      toast.success(accepted ? 'Ticket resolved and closed. Thank you!' : 'Your ticket has been escalated to a support specialist.');
      setSelectedLog(null);
      loadLogs();
    } catch (error) {
      console.error('Email resolution feedback failed:', error);
      toast.error('Unable to submit ticket feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-soft sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#021d17]">Email Logs</h2>
          <p className="mt-1 text-sm text-slate-500">Review every system email sent to your account.</p>
        </div>
        <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><FiMail /></span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {['ALL', 'CREATED', 'AI_RESOLVED', 'ASSIGNED', 'ESCALATED', 'RESOLVED', 'REOPENED'].map((eventType) => (
          <button
            key={eventType}
            type="button"
            onClick={() => setEventFilter(eventType)}
            className={`rounded-full border px-3 py-1.5 text-xs font-mono font-semibold ${
              eventFilter === eventType
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {eventType}
          </button>
        ))}
      </div>

      <div>
        <div className="space-y-4">
          {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading email logs...</p>
            : visibleLogs.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No email logs found.</p>
            : visibleLogs.map((log) => (
              <div key={log.id} onClick={() => setSelectedLog(log)} className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 text-[#021d17] space-y-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-700">{log.event_type || log.email_type}</span>
                    <span className="text-xs text-slate-500">To: {log.recipient}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-700">{formatDateTime(log.sent_at)}</span>
                </div>
                <h4 className="text-sm font-semibold text-[#021d17]">{log.subject}</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: log.body }} />
                <Badge value={log.status} styles={STATUS_STYLES} />
              </div>
            ))}
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/35" onClick={() => setSelectedLog(null)}>
          <aside
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 text-[#021d17] shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Email details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">System email</p>
                <h3 className="mt-1 text-xl font-bold text-[#021d17]">{selectedLog.subject}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close email details"><FiX /></button>
            </div>

            <dl className="grid gap-4 border-y border-slate-200 py-5 text-sm sm:grid-cols-2">
              <Detail label="Ticket Title" value={selectedLog.ticket_title} />
              <Detail label="Ticket ID" value={selectedLog.ticket_id} />
              <Detail label="Date / Time" value={formatDateTime(selectedLog.sent_at)} />
              <Detail label="Email Type" value={selectedLog.email_type} />
              <Detail label="Delivery Status" value={selectedLog.status} />
            </dl>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-[#021d17]">Email body</h4>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700" dangerouslySetInnerHTML={{ __html: selectedLog.body }} />
              {(selectedLog.event_type === 'AI_RESOLVED' || selectedLog.email_type === 'RESOLUTION') && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button disabled={submittingFeedback} onClick={() => submitFeedback(true)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">Accept & Close Ticket</button>
                  <button disabled={submittingFeedback} onClick={() => submitFeedback(false)} className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 disabled:opacity-60">Request Human Support / Escalate</button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function Badge({ value, styles }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[value] || 'bg-slate-50 text-slate-600 ring-slate-200'}`}>{value}</span>;
}

function Detail({ label, value }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words font-medium text-[#021d17]">{value}</dd></div>;
}
