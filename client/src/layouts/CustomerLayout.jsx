import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeaderBar from '../components/layout/TopHeaderBar';
import { FiGrid, FiCheckSquare, FiPlusSquare, FiBell, FiMail, FiUser, FiSettings } from 'react-icons/fi';

const customerNav = [
  {
    section: 'MAIN MENU',
    links: [
      { label: 'Dashboard', path: '/customer/dashboard', icon: FiGrid },
      { label: 'My Tickets', path: '/customer/tickets', icon: FiCheckSquare },
      { label: 'Create Ticket', path: '/customer/create-ticket', icon: FiPlusSquare },
      { label: 'Email Logs', path: '/customer/email-logs', icon: FiMail },
    ],
  },
  {
    section: 'ACCOUNT',
    links: [
      { label: 'Notifications', path: '/customer/notifications', icon: FiBell },
      { label: 'Profile', path: '/customer/profile', icon: FiUser },
      { label: 'Settings', path: '/customer/settings', icon: FiSettings },
    ],
  },
];

export default function CustomerLayout() {
  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar - Fixed viewport height so it doesn't get cut off on scroll */}
      <div className="h-screen sticky top-0 flex-shrink-0 z-30">
        <Sidebar 
          items={customerNav} 
          user={{ initials: 'CU', name: 'Customer User', role: 'End User' }} 
        />
      </div>

      {/* Main Content Area - Independent vertical scroll */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        <TopHeaderBar 
          title="CUSTOMER PORTAL" 
          subtitle="Raise Tickets • Track Status • Get Resolutions" 
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
