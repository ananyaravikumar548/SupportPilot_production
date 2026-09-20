// Design tokens from the mentor's mockup
const PRIORITY_COLORS = {
  P1: '#b91c1c', // critical - red
  P2: '#c2410c', // high - orange
  P3: '#b45309', // medium - amber
  P4: '#475569', // low - slate
};

// Maps your existing High/Medium/Low/Critical strings to the design's P1-P4 codes.
// If your data already uses P1-P4, it's used directly.
const normalizeToPCode = (priority) => {
  if (!priority) return 'P4';
  const p = priority.toString().trim().toUpperCase();
  if (['P1', 'P2', 'P3', 'P4'].includes(p)) return p;
  if (p === 'CRITICAL') return 'P1';
  if (p === 'HIGH') return 'P2';
  if (p === 'MEDIUM') return 'P3';
  if (p === 'LOW') return 'P4';
  return 'P4';
};

export const PriorityBadge = ({ priority }) => {
  const code = normalizeToPCode(priority);
  return (
    <span
      className="inline-block rounded-[5px] px-[7px] py-[3px] font-mono text-[10.5px] font-extrabold text-white"
      style={{ backgroundColor: PRIORITY_COLORS[code] }}
    >
      {code}
    </span>
  );
};

// Generic pill tag — matches .tag / .t-ok / .t-warn / .t-dan / .t-neu / .t-info / .t-br
const TAG_STYLES = {
  ok: 'bg-[#f0fdf4] text-[#15803d]',
  warn: 'bg-[#fffbeb] text-[#b45309]',
  danger: 'bg-[#fef2f2] text-[#b91c1c]',
  neutral: 'bg-slate-100 text-slate-600',
  info: 'bg-[#eff6ff] text-[#1d4ed8]',
  brand: 'bg-[#eef4ef] text-[#14532d]',
};

const STATUS_TONE_MAP = {
  Open: 'info',
  'In Progress': 'warn',
  Resolved: 'ok',
  Closed: 'neutral',
};

export const StatusBadge = ({ status }) => {
  const tone = STATUS_TONE_MAP[status] || 'neutral';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10.5px] font-bold ${TAG_STYLES[tone]}`}>
      {status}
    </span>
  );
};

// For category pills, e.g. <CategoryTag category="VPN" />
export const CategoryTag = ({ category, tone = 'brand' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10.5px] font-bold ${TAG_STYLES[tone]}`}>
    {category}
  </span>
);
