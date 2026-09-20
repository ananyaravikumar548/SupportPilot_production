import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ items = [], user = { initials: 'AD', name: 'Admin User', role: 'System Admin' } }) {
  const navigate = useNavigate();
  const auth = useAuth?.();

  const handleLogout = () => {
    if (auth && auth.logout) {
      auth.logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#062e21] text-white py-4 select-none">
      {/* Logo */}
      <div className="mb-4 flex items-center gap-3 border-b border-emerald-900/60 px-5 pb-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-sm font-black text-white shadow-md">
          SP
        </div>
        <div>
          <div className="text-base font-bold text-white leading-tight">SupportPilot</div>
          <div className="text-[10px] font-mono tracking-widest text-emerald-300/60 uppercase">
            Ticket Resolution
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-4">
        {Array.isArray(items) && items.length > 0 && typeof items[0] === 'object' && 'links' in items[0] ? (
          items.map((group) => (
            <div key={group.section || group.title}>
              {/* Section Header */}
              <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-emerald-400/60">
                {group.section || group.title}
              </div>
              <div className="space-y-1">
                {group.links.map(({ label, path, icon: Icon, count }) => (
                  <NavLink
                    key={label}
                    to={path}
                    /* Updated text-sm for larger sidebar links */
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-800/90 text-white shadow-inner'
                          : 'text-slate-200 hover:bg-emerald-900/50 hover:text-white'
                      }`
                    }
                  >
                    {Icon && <Icon className="text-base shrink-0 opacity-85" />}
                    <span className="truncate">{label}</span>
                    {count !== undefined && count !== null && (
                      <span className="ml-auto rounded-full bg-emerald-900/80 px-2 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-700/50">
                        {count}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {items.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-800/90 text-white shadow-inner'
                      : 'text-slate-200 hover:bg-emerald-900/50 hover:text-white'
                  }`
                }
              >
                {Icon && <Icon className="text-base shrink-0 opacity-85" />}
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="mt-auto border-t border-emerald-900/60 px-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm">
              {user.initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <div className="text-xs text-emerald-300/60 truncate">{user.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-emerald-300/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <FiLogOut className="text-lg" />
          </button>
        </div>
      </div>
    </aside>
  );
}