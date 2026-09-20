import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';

export default function Sidebar({ items = [], theme = 'purple', fixed = false }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Accept both "green" and "emerald" (so your app won't break)
  const isEmeraldTheme = theme === 'emerald' || theme === 'green';

  const initials = useMemo(() => {
    const name = user?.name || 'Support Agent';
    const parts = name.trim().split(' ').filter(Boolean);
    const a = parts[0]?.[0] || 'A';
    const b = parts[1]?.[0] || 'K';
    return (a + b).toUpperCase();
  }, [user?.name]);

  // Reference screenshot colors
  const shellBg = isEmeraldTheme ? 'bg-[#0f2b1d]' : 'bg-[#17153F]';
  const activeBorder = isEmeraldTheme ? 'border-l-[#1f7a45]' : 'border-l-indigo-500';
  const activeBg = isEmeraldTheme ? 'bg-[#1f7a45]/20' : 'bg-indigo-600/20';
  const badgeActiveBg = isEmeraldTheme ? 'bg-[#1f7a45]' : 'bg-indigo-600';

  return (
   <aside
  className={[
    fixed
      ? 'fixed inset-y-0 left-0 z-30 hidden lg:flex'
      : 'sticky top-0 flex',
    'h-screen overflow-y-auto shrink-0 flex-col py-[18px] w-[206px]',
    shellBg,
  ].join(' ')}
>
      {/* Logo / Brand (matches reference) */}
      <div className="mb-3 flex items-center gap-[9px] border-b border-white/10 px-[18px] pb-5">
        <div
          className={[
            'grid h-7 w-12 place-items-center rounded-md text-xs font-extrabold text-white',
            isEmeraldTheme ? 'bg-[#1f7a45]' : 'bg-indigo-600',
          ].join(' ')}
        >
          SP
        </div>

        <div>
          <div className="text-sm font-bold text-white leading-tight">SupportPilot</div>
          <div className="text-[7.5px] font-mono tracking-wider text-white/45">
            TICKET RESOLUTION
          </div>
        </div>
      </div>

      {/* Nav (reference look: border-left active, compact spacing) */}
      <nav className="flex-1">
        <div className="px-[18px] pb-1.5 pt-3 text-[18.5px] font-bold uppercase tracking-wider text-white/30">
          Work
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-[9px] border-l-[3px] px-[18px] py-2',
                  'text-[15.5px] font-medium transition',
                  isActive
                    ? `${activeBorder} ${activeBg} font-semibold text-white`
                    : 'border-l-transparent text-white/65 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              {Icon ? <Icon className="h-[15px] w-[15px] opacity-85" /> : null}
              <span className="truncate">{item.label}</span>

              {item.badge ? (
                <span
                  className={({ isActive }) =>
                    [
                      'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive ? badgeActiveBg : 'bg-white/10',
                    ].join(' ')
                  }
                >
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer user (reference: initials circle + name/role) */}
      <div className="mt-auto border-t border-white/10 px-[18px] pt-3.5">
        <div className="flex items-center gap-[9px] pb-2">
          <div
            className={[
              'grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white',
              isEmeraldTheme ? 'bg-[#1f7a45]' : 'bg-indigo-600',
            ].join(' ')}
            title={user?.name || 'Support Agent'}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user?.name || 'SupportPilot'}
            </div>
            <div className="text-[10.5px] text-white/40 truncate">
              {user?.role || user?.email || 'Agent'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="ml-auto p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
