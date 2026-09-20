import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeaderBar from '../components/layout/TopHeaderBar';
import { FiGrid, FiList, FiBookOpen, FiBarChart2, FiSettings } from 'react-icons/fi';

const agentNav = [
  { label: 'Dashboard', path: '/agent/dashboard', icon: FiGrid },
  { label: 'Ticket Queue', path: '/agent/tickets', icon: FiList },
  { label: 'Knowledge Base', path: '/agent/knowledge', icon: FiBookOpen },
  { label: 'Reports', path: '/agent/reports', icon: FiBarChart2 },
  { label: 'Settings', path: '/agent/settings', icon: FiSettings },
];

export default function AgentLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar items={agentNav} theme="emerald" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeaderBar title="AGENT DASHBOARD" subtitle="Manage Tickets • AI Assistance • SLA Tracking" theme="emerald" />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}