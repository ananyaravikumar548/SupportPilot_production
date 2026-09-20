import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeaderBar from '../components/layout/TopHeaderBar';
import { FiGrid, FiCheckSquare, FiPlusSquare, FiBell, FiUser, FiSettings } from 'react-icons/fi';

const customerNav = [
  { label: 'Dashboard', path: '/customer/dashboard', icon: FiGrid },
  { label: 'My Tickets', path: '/customer/tickets', icon: FiCheckSquare },
  { label: 'Create Ticket', path: '/customer/create-ticket', icon: FiPlusSquare },
  { label: 'Notifications', path: '/customer/notifications', icon: FiBell },
  { label: 'Profile', path: '/customer/profile', icon: FiUser },
  { label: 'Settings', path: '/customer/settings', icon: FiSettings },
];

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar items={customerNav} theme="emerald" fixed />
      <div className="flex min-h-screen flex-col min-w-0 ml-[206px] lg:ml-[206px]">
        <TopHeaderBar title="CUSTOMER PORTAL" subtitle="Raise Tickets • Track Status • Get Resolutions" theme="emerald" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 shadow-lg lg:hidden">
          {customerNav.slice(0, 5).map(({ label, path, icon: Icon }) => <a key={path} href={path} className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-indigo-600"><Icon className="h-4 w-4" />{label.split(' ')[0]}</a>)}
        </nav>
      </div>
    </div>
  );
}
