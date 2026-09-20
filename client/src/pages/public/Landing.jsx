import { Link } from 'react-router-dom';
import { FiArrowRight, FiBarChart2, FiGitBranch, FiShield } from 'react-icons/fi';

const features = [
  {
    icon: FiBarChart2,
    label: 'AI RESOLUTION',
    title: 'Resolve more, automatically.',
    description: 'A real-time 75% confidence threshold lets AI close the tickets it can solve and surface the rest with context.',
    accent: 'from-emerald-400/20 to-transparent',
  },
  {
    icon: FiGitBranch,
    label: 'SKILL ROUTING',
    title: 'The right expert, every time.',
    description: 'Balance workloads and match categories intelligently so every ticket reaches the agent best equipped to help.',
    accent: 'from-teal-400/20 to-transparent',
  },
  {
    icon: FiShield,
    label: 'MANAGER AUDIT',
    title: 'Stay in control.',
    description: 'Live sync logs, Jira integration tracking, and human-in-the-loop controls keep your operation accountable.',
    accent: 'from-cyan-400/20 to-transparent',
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-white via-emerald-50/60 to-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.13),transparent_70%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-emerald-100 py-5">
          <Link to="/" className="flex items-center gap-3" aria-label="SupportPilot home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/40 bg-emerald-400/15 text-sm font-black tracking-tight text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.25)]">
              SP
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">SupportPilot</span>
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600"
          >
            Sign In
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              AUTONOMOUS SUPPORT OPERATIONS
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.04em] text-slate-900 sm:text-6xl lg:text-7xl">
              Support that{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                resolves itself.
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Autonomous multi-agent triage, vector-backed RAG knowledge, and intelligent escalation routing for enterprise support teams.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(16,185,129,0.24)] transition hover:bg-emerald-500 hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
              >
                Get Started
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-emerald-200 bg-white/70 px-6 py-3.5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-white"
              >
                Explore Features
              </a>
            </div>
          </div>

          <div className="relative hidden min-h-[330px] lg:block">
            <div className="absolute inset-10 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute right-3 top-3 h-64 w-64 rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.16em] text-slate-500">
                <span>LIVE QUEUE HEALTH</span>
                <span className="text-emerald-400">● ONLINE</span>
              </div>
              <div className="mt-8 text-5xl font-bold tracking-tight text-slate-900">75<span className="text-emerald-600">%</span></div>
              <p className="mt-1 text-sm text-slate-500">auto-resolution trigger</p>
              <div className="mt-8 flex h-16 items-end gap-1.5">
                {[35, 48, 42, 68, 53, 74, 62, 88, 77, 96].map((height, index) => (
                  <span key={index} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/30 to-emerald-300" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">✓</span>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Ticket #4821 resolved</p>
                  <p className="mt-1 text-[11px] text-slate-500">Billing agent · 2m ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-4 border-t border-emerald-100 py-8 md:grid-cols-3">
          {features.map(({ icon: Icon, label, title, description, accent }) => (
            <article key={label} className={`rounded-2xl border border-emerald-100 bg-gradient-to-br ${accent} bg-white/80 p-6 shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md`}>
              <Icon className="h-5 w-5 text-emerald-300" />
              <p className="mt-7 text-[10px] font-bold tracking-[0.18em] text-emerald-300">{label}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
