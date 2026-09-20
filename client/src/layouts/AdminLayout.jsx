import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeaderBar from '../components/layout/TopHeaderBar';
import { FiGrid, FiInbox, FiUsers, FiFolder, FiDatabase, FiBarChart2, FiSettings, FiShield, FiAward } from 'react-icons/fi';

const adminNavItems = [
  {
    section: 'WORK',
    links: [
      { label: 'Overview', path: '/admin/dashboard', icon: FiGrid },
      { label: 'Tickets', path: '/admin/tickets', icon: FiInbox },
      { label: 'Users', path: '/admin/users', icon: FiUsers },
      { label: 'Manager Console', path: '/manager/dashboard', icon: FiAward },
    ],
  },
  {
    section: 'CONFIGURATION',
    links: [
      { label: 'Categories', path: '/admin/categories', icon: FiFolder },
      { label: 'Master Data', path: '/admin/master-data', icon: FiDatabase },
      { label: 'Reports', path: '/admin/reports', icon: FiBarChart2 },
      { label: 'Settings', path: '/admin/settings', icon: FiSettings },
      { label: 'Audit Logs', path: '/admin/audit-logs', icon: FiShield },
    ],
  },
];

export default function AdminLayout() {
  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Container - Sticky & Fixed Viewport Height */}
      <div className="h-screen sticky top-0 flex-shrink-0 z-30">
        <Sidebar 
          items={adminNavItems} 
          user={{ initials: 'AD', name: 'Admin User', role: 'System Admin' }} 
        />
      </div>

      {/* Main Content Area - Scrollable Container */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        <TopHeaderBar 
          title="ADMIN DASHBOARD" 
          subtitle="System Overview • Analytics • User Management" 
          showSearch={false}
          showNotifications={false}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}