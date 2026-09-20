 import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeaderBar from '../components/layout/TopHeaderBar';
import { FiInbox, FiUsers, FiShield, FiBarChart2, FiSettings, FiActivity } from 'react-icons/fi';

const managerNav = [
  {
    section: 'COMMAND CENTER',
    links: [
      { label: 'Manager Console', path: '/manager/dashboard', icon: FiShield },
      { label: 'Unassigned Queue', path: '/manager/unassigned-queue', icon: FiInbox },
      { label: 'Agents', path: '/manager/agents', icon: FiUsers },
      { label: 'Jira Ticket Logs', path: '/manager/jira-logs', icon: FiActivity },
    ],
  },
  {
    section: 'ANALYTICS & SETTINGS',
    links: [
      { label: 'Reports', path: '/manager/reports', icon: FiBarChart2 },
      { label: 'Settings', path: '/manager/settings', icon: FiSettings },
    ],
  },
];

export default function ManagerLayout() {
  const location = useLocation();
  const headerByPath = [
    {
      match: '/manager/unassigned-queue',
      title: 'UNASSIGNED QUEUE',
      subtitle: 'Prioritize tickets • Assign ownership • Monitor queue health',
    },
    {
      match: '/manager/agents',
      title: 'AGENT WORKFORCE',
      subtitle: 'Review availability • Monitor workload • Balance assignments',
    },
    {
      match: '/manager/jira-logs',
      title: 'JIRA TICKET LOGS',
      subtitle: 'Track linked issues • Review sync status • Follow escalations',
    },
    {
      match: '/manager/reports',
      title: 'MANAGER REPORTS',
      subtitle: 'Analyze ticket volume • Resolution progress • Operational risk',
    },
    {
      match: '/manager/settings',
      title: 'MANAGER SETTINGS',
      subtitle: 'Configure assignment rules • Alerts • SLA preferences',
    },
  ];
  const header = headerByPath.find(({ match }) => location.pathname.startsWith(match)) || {
    title: 'MANAGER CONSOLE',
    subtitle: 'Ticket Assignment • Agent Workload • AI Diagnosis',
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Container - Sticky & Fixed Viewport Height */}
      <div className="h-screen sticky top-0 flex-shrink-0 z-30">
        <Sidebar 
          items={managerNav} 
          user={{ initials: 'MG', name: 'Manager User', role: 'Agent Manager' }} 
        />
      </div>

      {/* Main Content Area - Scrollable Container */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        <TopHeaderBar 
          title={header.title}
          subtitle={header.subtitle}
          showNotifications={false}
        />
        <main key={location.pathname} className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}