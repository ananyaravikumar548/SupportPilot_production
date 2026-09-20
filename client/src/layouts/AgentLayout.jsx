import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeaderBar from '../components/layout/TopHeaderBar';
import { AuthContext } from '../context/AuthContext';
import { FiShield, FiGrid, FiList, FiBookOpen, FiBarChart2, FiSettings } from 'react-icons/fi';

function buildAgentNav(user) {
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  return [
    {
      section: 'WORKFLOW',
      links: [
        { label: 'Dashboard', path: '/agent/dashboard', icon: FiGrid },
        { label: 'Ticket Queue', path: '/agent/tickets', icon: FiList },
        { label: 'Knowledge Base', path: '/agent/knowledge', icon: FiBookOpen },
      ],
    },
    {
      section: 'ANALYTICS & SETTINGS',
      links: [
        ...(isAdmin
          ? [{ label: 'Manager Console', path: '/manager/dashboard', icon: FiShield }]
          : []),
        { label: 'Reports', path: '/agent/reports', icon: FiBarChart2 },
        { label: 'Settings', path: '/agent/settings', icon: FiSettings },
      ],
    },
  ];
}

export default function AgentLayout() {
  const { user } = useContext(AuthContext);
  const agentNav = buildAgentNav(user);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Sidebar - Pinned full viewport height */}
      <div className="h-screen sticky top-0 flex-shrink-0 z-30">
        <Sidebar 
          items={agentNav} 
          user={{ initials: 'AG', name: 'Agent User', role: 'Support Specialist' }} 
        />
      </div>

      {/* Main Content Area - Scrollable pane */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        <TopHeaderBar 
          title="AGENT DASHBOARD" 
          subtitle="Manage Tickets • AI Assistance • SLA Tracking" 
          showNotifications={false}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}