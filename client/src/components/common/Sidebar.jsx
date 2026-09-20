import { NavLink } from 'react-router-dom';

export default function Sidebar({ items = [], theme = 'emerald', user = { initials: 'AD', name: 'Admin User', role: 'System Admin' } }) {
  return (
    <aside className="flex h-full w-[206px] shrink-0 flex-col bg-[#0f2b1d] py-[18px] select-none">
      {/* Logo */}
      <div className="mb-3 flex items-center gap-[9px] border-b border-white/10 px-[18px] pb-5">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-[#1f7a45] text-xs font-extrabold text-white shadow-sm">
          SP
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-white">SupportPilot</div>
          <div className="text-[7.5px] font-mono tracking-wider text-white/45 uppercase">
            TICKET RESOLUTION
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {Array.isArray(items) && items.length > 0 && typeof items[0] === 'object' && 'links' in items[0] ? (
          // Grouped format
          items.map((group) => (
            <div key={group.section || group.title}>
              <div className="px-[18px] pb-1.5 pt-3 text-[9.5px] font-bold uppercase tracking-wider text-white/30">
                {group.section || group.title}
              </div>
              {group.links.map(({ label, path, icon: Icon, count }) => (
                <NavLink
                  key={label}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-[9px] border-l-[3px] px-[18px] py-2 text-[12.5px] font-medium transition-colors ${
                      isActive
                        ? 'border-l-[#1f7a45] bg-[#1f7a45]/20 font-semibold text-white'
                        : 'border-l-transparent text-white/65 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {Icon && <Icon className="h-[15px] w-[15px] opacity-85 shrink-0" />}
                  <span className="truncate">{label}</span>
                  {count !== undefined && count !== null && (
                    <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/80">
                      {count}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))
        ) : (
          // Flat items array fallback
          <div>
            <div className="px-[18px] pb-1.5 pt-3 text-[9.5px] font-bold uppercase tracking-wider text-white/30">
              WORK
            </div>
            {items.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-[9px] border-l-[3px] px-[18px] py-2 text-[12.5px] font-medium transition-colors ${
                    isActive
                      ? 'border-l-[#1f7a45] bg-[#1f7a45]/20 font-semibold text-white'
                      : 'border-l-transparent text-white/65 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {Icon && <Icon className="h-[15px] w-[15px] opacity-85 shrink-0" />}
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="mt-auto border-t border-white/10 px-[18px] pt-3.5">
        <div className="flex items-center gap-[9px]">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1f7a45] text-[11px] font-bold text-white shadow-sm">
            {user.initials}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10.5px] text-white/40 truncate">{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}