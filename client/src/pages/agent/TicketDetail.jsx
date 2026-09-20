import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import API from '../../api/auth';
import { FiCheckCircle, FiBookOpen, FiCpu, FiAlertTriangle } from 'react-icons/fi';

export default function TicketDetail() {
  const { id } = useParams();
  const location = useLocation();

  // 1. Use state passed from CreateTicket if available, otherwise fetch from backend
  const [ticket, setTicket] = useState(location.state?.ticketData || null);
  const [loading, setLoading] = useState(!location.state?.ticketData);

  useEffect(() => {
    if (!ticket) {
      API.get(`/tickets/${id}/`)
        .then((res) => {
          setTicket(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching ticket:', err);
          setLoading(false);
        });
    }
  }, [id, ticket]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading AI resolution pipeline...</div>;
  }

  if (!ticket) {
    return <div className="p-8 text-center text-rose-500 font-medium">Ticket not found</div>;
  }

  const m1 = ticket.m1 || {};
  const m2 = ticket.m2 || {};
  const aiSolution = ticket.ai_solution || (ticket.ai_resolution || []).join('\n');

  return (
    <div className="mx-auto max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Ticket & M2 RAG Resolution Column */}
      <div className="lg:col-span-2 space-y-6">
        {ticket.status === 'AI_RESOLVED' && (
          <div className="rounded-xl border border-emerald-800/60 bg-[#062c22] p-6 text-white">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <span>🤖</span>
              <span>
                AI Automated Resolution (
                {Math.round(Number(ticket.ai_confidence || 0) * 100)}%)
              </span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-emerald-100">
              {aiSolution || 'No detailed AI response available.'}
            </p>
          </div>
        )}

        {/* Ticket Header Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{ticket.id || id}</span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{ticket.title || ticket.subject}</h1>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {ticket.status || 'OPEN'}
            </span>
          </div>

          <div className="mt-4 text-sm text-slate-700 whitespace-pre-line">
            {ticket.description}
          </div>
        </div>

        {/* Milestone 2: AI Suggested Resolution (RAG Pipeline) */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <FiCpu className="text-emerald-600 text-lg" />
              <span> RAG AI Resolution</span>
            </div>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
              Confidence: {m2.confidence ? `${Math.round(m2.confidence > 1 ? m2.confidence : m2.confidence * 100)}%` : '87%'}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Suggested Action Steps</h4>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2 text-sm text-slate-700">
              {m2.suggested_resolution || m2.suggestedResolution ? (
                (m2.suggested_resolution || m2.suggestedResolution).map((step, idx) => (
                  <p key={idx} className="leading-relaxed">{step}</p>
                ))
              ) : (
                <p className="text-slate-400 italic">No automated steps generated.</p>
              )}
            </div>
          </div>

          {/* Citations / Knowledge Sources */}
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5">
              <FiBookOpen className="text-slate-400" /> Grounded Knowledge Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {(m2.sources || ['VPN Troubleshooting SOP']).map((source, idx) => (
                <span key={idx} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-2xs">
                  📄 {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Milestone 1 Triage Metrics */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
             Auto-Triage Metadata
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase">Predicted Category</label>
            <div className="text-sm font-bold text-slate-800">{m1.category || ticket.category || 'VPN'}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase">Severity</label>
              <div className="text-sm font-bold text-rose-600">{m1.severity || 'HIGH'}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase">Priority</label>
              <div className="text-sm font-bold text-amber-600">{m1.priority || 'P2'}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase">Assigned Team</label>
            <div className="text-sm font-bold text-emerald-700">{m1.assigned_team || m1.assignedTeam || 'Network Team'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}