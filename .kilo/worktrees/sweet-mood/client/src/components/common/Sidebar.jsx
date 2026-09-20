import { FiGrid, FiList, FiTarget, FiMenu, FiClock, FiFileText } from 'react-icons/fi';

const navItems = [
  { section: 'Work', links: [
    { label: 'Dashboard', icon: FiGrid, count: null, active: false },
    { label: 'All tickets', icon: FiList, count: 127, active: false },
    { label: 'My queue', icon: FiTarget, count: 14, active: true },
  ]},
  { section: 'Configuration', links: [
    { label: 'Taxonomy', icon: FiMenu, count: null, active: false },
    { label: 'SLA policies', icon: FiClock, count: null, active: false },
    { label: 'Audit log', icon: FiFileText, count: null, active: false },
  ]},
];

const Sidebar = ({ activeLabel = 'My queue', user = { initials: 'AK', name: 'Arun K.', role: 'Support Agent' } }) => {
  return (
    <aside className="flex h-full w-[206px] shrink-0 flex-col bg-[#0f2b1d] py-[18px]">
      {/* Logo */}
      <div className="mb-3 flex items-center gap-[9px] border-b border-white/10 px-[18px] pb-5">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-[#1f7a45] text-xs font-extrabold text-white">SP</div>
        <div>
          <div className="text-sm font-bold text-white leading-tight">SupportPilot</div>
          <div className="text-[7.5px] font-mono tracking-wider text-white/45">TICKET RESOLUTION</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="px-[18px] pb-1.5 pt-3 text-[9.5px] font-bold uppercase tracking-wider text-white/30">
              {group.section}
            </div>
            {group.links.map(({ label, icon: Icon, count }) => {
              const isActive = label === activeLabel;
              return (
                <a
                  key={label}
                  href="#"
                  className={`flex items-center gap-[9px] border-l-[3px] px-[18px] py-2 text-[12.5px] font-medium transition ${
                    isActive
                      ? 'border-l-[#1f7a45] bg-[#1f7a45]/20 font-semibold text-white'
                      : 'border-l-transparent text-white/65 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-[15px] w-[15px] opacity-85" />
                  {label}
                  {count !== null && (
                    <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-[#1f7a45]' : 'bg-white/10'}`}>
                      {count}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="mt-auto border-t border-white/10 px-[18px] pt-3.5">
        <div className="flex items-center gap-[9px] pb-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1f7a45] text-[11px] font-bold text-white">
            {user.initials}
          </div>
          <div>
            <div className="text-xs font-semibold text-white">{user.name}</div>
            <div className="text-[10.5px] text-white/40">{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
