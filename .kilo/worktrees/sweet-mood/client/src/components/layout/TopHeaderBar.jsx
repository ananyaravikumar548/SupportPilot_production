import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiBell, FiChevronDown, FiSearch, FiUser } from 'react-icons/fi';

export default function TopHeaderBar({ title, subtitle, theme = 'emerald' }) {
  const { user } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);

  const isEmeraldTheme = theme === 'emerald' || theme === 'green';

  return (
    <header
      className={[
        'min-h-[72px] text-white px-4 sm:px-8 shadow-md flex items-center justify-between',
        isEmeraldTheme ? 'bg-emerald-700' : 'bg-[#17153F]',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/25">
          SP
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-wide leading-tight">{title}</h1>
          <p className="text-xs text-white/75 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <FiSearch className="absolute left-3 top-2.5 text-white/60 text-sm" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="pl-9 pr-4 py-1.5 text-xs rounded-full bg-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 w-56"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <FiBell className="w-4 h-4 text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Profile */}
        <div className="relative flex items-center gap-2 pl-2 border-l border-white/20">
          <button
            onClick={() => setProfileOpen((v) => !v)}
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
            <div className="absolute right-0 top-11 w-40 rounded-xl border border-slate-100 bg-white p-1.5 text-sm text-slate-700 shadow-xl">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-50">
                <FiUser /> My profile
              </button>
              <button className="w-full rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}