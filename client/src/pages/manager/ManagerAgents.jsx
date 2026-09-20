import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiActivity, FiMail, FiRefreshCw, FiSearch, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../api/auth';

const displayName = (agent) => agent.display_name || [agent.first_name, agent.last_name].filter(Boolean).join(' ') || agent.email || 'Unnamed agent';

export default function ManagerAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const loadAgents = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await API.get('/manager/agents/');
      setAgents(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch {
      setAgents([]);
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAgents(true); }, [loadAgents]);

  const filtered = useMemo(() => agents.filter((agent) => {
    const haystack = `${displayName(agent)} ${agent.email || ''}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }), [agents, query]);
  const totalLoad = agents.reduce((sum, agent) => sum + Number(agent.active_tickets || 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 rounded-[18px] border border-[#dfe5e1] bg-white px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3px] text-[#8b95a1]"><FiUsers className="text-[#14532d]" /> Workforce</div><h1 className="mt-1 text-[24px] font-bold tracking-tight text-[#1c2430]">Agents</h1><p className="mt-1 text-[12px] text-[#64748b]">Monitor availability and active workload before routing new tickets.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row"><label className="relative min-w-[250px]"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b95a1]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents" className="w-full rounded-[10px] border border-[#dfe5e1] py-2.5 pl-9 pr-3 text-[12px] outline-none focus:border-[#14532d]" /></label><button type="button" onClick={() => loadAgents(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#dfe5e1] px-4 text-[12px] font-semibold hover:border-[#14532d]"><FiRefreshCw className={refreshing ? 'animate-spin' : ''} /> Refresh</button></div>
      </header>
      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-wide text-[#8b95a1]">Available agents</div><div className="mt-2 text-3xl font-extrabold text-[#1c2430]">{agents.length}</div></div><div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-wide text-[#8b95a1]">Tickets in progress</div><div className="mt-2 text-3xl font-extrabold text-[#1c2430]">{totalLoad}</div></div><div className="rounded-[14px] border border-[#dfe5e1] bg-white p-4 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-wide text-[#8b95a1]">Average workload</div><div className="mt-2 text-3xl font-extrabold text-[#1c2430]">{agents.length ? (totalLoad / agents.length).toFixed(1) : '0.0'}</div></div></div>
      <section className="overflow-hidden rounded-[14px] border border-[#dfe5e1] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#dfe5e1] px-5 py-4"><div><h2 className="text-[15px] font-bold text-[#1c2430]">Current team workload</h2><p className="mt-1 text-[11px] text-[#64748b]">{filtered.length} of {agents.length} agents</p></div><FiActivity className="text-[#14532d]" /></div>{loading ? <div className="p-12 text-center text-[12px] text-[#64748b]">Loading agent roster...</div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-[12px]"><thead className="bg-[#f8faf9] text-[10px] font-bold uppercase tracking-wide text-[#64748b]"><tr><th className="px-5 py-3">Agent</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Active tickets</th><th className="px-5 py-3 text-right">Capacity signal</th></tr></thead><tbody className="divide-y divide-[#eef2f0]">{filtered.map((agent) => { const load = Number(agent.active_tickets || 0); return <tr key={agent.id || agent.email} className="hover:bg-[#fafbfa]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f2eb] font-bold text-[#14532d]">{displayName(agent).slice(0, 2).toUpperCase()}</div><div><div className="font-semibold text-[#1c2430]">{displayName(agent)}</div><div className="text-[11px] text-[#64748b]">Support agent</div></div></div></td><td className="px-4 py-4 text-[#475569]"><span className="inline-flex items-center gap-2"><FiMail />{agent.email || 'No email'}</span></td><td className="px-4 py-4"><span className="font-bold text-[#1c2430]">{load}</span><span className="ml-1 text-[#64748b]">tickets</span></td><td className="px-5 py-4 text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${load >= 8 ? 'bg-rose-50 text-rose-700' : load >= 4 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{load >= 8 ? 'High load' : load >= 4 ? 'Balanced' : 'Available'}</span></td></tr>; })}</tbody></table></div> : <div className="p-12 text-center text-[12px] text-[#64748b]">No agents match this search.</div>}</section>
    </div>
  );
}
