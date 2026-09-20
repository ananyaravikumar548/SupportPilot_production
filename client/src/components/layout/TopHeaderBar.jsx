import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiChevronDown, FiSearch } from 'react-icons/fi';

export default function TopHeaderBar({
  title,
  subtitle,
  theme = 'emerald',
  showNotifications = true,
  showSearch = true,
}) {
  const { user, logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const isEmeraldTheme = theme === 'emerald' || theme === 'green';
  const role = user?.role?.toLowerCase();
  const routes = {
    tickets: role === 'customer' ? '/customer/tickets' : role === 'agent' ? '/agent/tickets' : role === 'admin' ? '/admin/tickets' : '/manager/dashboard',
    notifications: role === 'customer' ? '/customer/notifications' : role === 'agent' ? '/agent/dashboard' : role === 'admin' ? '/admin/audit-logs' : '/manager/dashboard',
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`${routes.tickets}?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  return (
    <header
      className={[
        'relative z-40 flex min-h-[72px] flex-wrap items-center justify-between gap-3 px-4 py-3 text-white shadow-md sm:px-8',
        isEmeraldTheme ? 'bg-emerald-700' : 'bg-[#17153F]',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/25">
          SP
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-wide leading-tight sm:text-xl">{title}</h1>
          <p className="truncate text-xs font-medium text-white/75">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className={`${searchOpen ? 'absolute left-4 right-4 top-[72px] z-50 block sm:static sm:w-56' : 'hidden sm:block sm:w-56'} relative`}>
          <button
            type="submit"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Search tickets"
          >
            <FiSearch className="text-sm" />
          </button>
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-56 rounded-full bg-white/15 py-1.5 pl-9 pr-4 text-xs text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Search tickets"
          />
          </form>
        )}
        {showSearch && <button
          type="button"
          onClick={() => setSearchOpen((value) => !value)}
          className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 sm:hidden"
          aria-label="Toggle ticket search"
        >
          <FiSearch className="h-4 w-4" />
        </button>}

        {showNotifications && (
          <button
            type="button"
            onClick={() => navigate(routes.notifications)}
            className="relative rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
            aria-label="Open notifications"
          >
            <FiBell className="w-4 h-4 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
        )}

        {/* Profile */}
        <div className="relative flex items-center gap-2 pl-2 border-l border-white/20">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
            className="flex items-center gap-1 rounded-full transition hover:bg-white/10 p-1"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full border border-white/40 object-cover"
            />
            <FiChevronDown className="hidden h-3 w-3 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-60 rounded-xl border border-slate-100 bg-white p-1.5 text-sm text-slate-700 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate font-semibold text-slate-900">
                  {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Support Agent'}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email || 'No email available'}</p>
                <p className="mt-1 text-[11px] capitalize text-emerald-700">
                  {user?.role?.replace('_', ' ') || 'agent'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}