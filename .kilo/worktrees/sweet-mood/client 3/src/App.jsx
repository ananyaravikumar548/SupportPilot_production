import { useState } from 'react'

const tickets = [
  { id: '#1042', title: 'Unable to reset my password', customer: 'Olivia Martin', time: '4m ago', priority: 'High', status: 'Open', color: 'bg-rose-500', initials: 'OM' },
  { id: '#1041', title: 'Question about annual billing', customer: 'Liam Chen', time: '18m ago', priority: 'Medium', status: 'In progress', color: 'bg-violet-500', initials: 'LC' },
  { id: '#1040', title: 'Exported report is missing data', customer: 'Ava Rodriguez', time: '32m ago', priority: 'High', status: 'Open', color: 'bg-amber-500', initials: 'AR' },
  { id: '#1039', title: 'How do I add a teammate?', customer: 'Noah Williams', time: '1h ago', priority: 'Low', status: 'Resolved', color: 'bg-sky-500', initials: 'NW' },
]

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    ticket: <path d="M20 12a2 2 0 0 0 0-4V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3Z M9 3v14"/>,
    chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m8 15 3-3 3 2 5-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56v.1h-3v-.1a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.04 15 1.7 1.7 0 0 0 5.5 14H5v-3h.5a1.7 1.7 0 0 0 1.54-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.1-2.1.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.72 4.8v-.1h3v.1a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.1 2.1-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.54 1h.06v3h-.06a1.7 1.7 0 0 0-1.54 1Z"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    spark: <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/>,
  }
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin()
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-indigo-700 p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3 text-lg font-semibold"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-xl font-bold text-indigo-700">S</div> Supportly</div>
        <div className="relative z-10 my-auto max-w-md"><span className="rounded-full border border-indigo-400 bg-indigo-600/50 px-3 py-1 text-xs font-semibold tracking-wide">SMARTER SUPPORT</span><h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">Every customer conversation, beautifully organized.</h1><p className="mt-5 text-base leading-7 text-indigo-100">Give your team one calm, intelligent place to solve customer requests faster.</p></div>
        <div className="relative z-10 flex items-center gap-4 text-sm text-indigo-100"><div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-indigo-700 bg-amber-300 text-xs font-bold text-amber-900">A</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-indigo-700 bg-rose-300 text-xs font-bold text-rose-900">J</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-indigo-700 bg-sky-300 text-xs font-bold text-sky-900">M</span></div> Trusted by support teams everywhere</div>
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full border-[54px] border-indigo-500/50"/><div className="absolute -top-20 right-20 h-52 w-52 rounded-full bg-violet-500/30 blur-3xl"/>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md"><div className="mb-10 flex items-center gap-3 lg:hidden"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-xl font-bold text-white">S</div><span className="text-lg font-semibold">Supportly</span></div><div className="mb-8"><p className="text-sm font-semibold text-indigo-600">WELCOME BACK</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sign in to your workspace</h2><p className="mt-2 text-sm text-slate-500">Enter your details to access your support dashboard.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Work email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"/></label><label className="block"><span className="mb-2 flex justify-between text-sm font-medium text-slate-700">Password <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</button></span><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 pr-16 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-xs font-semibold text-slate-500 hover:text-slate-800">{showPassword ? 'Hide' : 'Show'}</button></div></label><label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-indigo-600"/> Remember me for 30 days</label><button type="submit" className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200">Sign in</button></form>
          <p className="mt-8 text-center text-sm text-slate-500">Need an account? <button className="font-semibold text-indigo-600 hover:text-indigo-700">Contact your administrator</button></p>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [filter, setFilter] = useState('All tickets')
  const [items, setItems] = useState(tickets)
  const nav = [['Overview', 'grid'], ['Tickets', 'ticket'], ['Analytics', 'chart'], ['Settings', 'settings']]
  const visibleTickets = filter === 'All tickets' ? items : items.filter((item) => item.status === filter)

  const addTicket = () => setItems([{ id: `#${1043 + items.length - tickets.length}`, title: 'New support request', customer: 'New customer', time: 'Just now', priority: 'Medium', status: 'Open', color: 'bg-emerald-500', initials: 'NC' }, ...items])

  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
          <div className="mb-10 flex items-center gap-3 px-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">S</div><span className="text-lg font-semibold tracking-tight">Supportly</span></div>
          <nav className="space-y-1">{nav.map(([label, icon]) => <button key={label} onClick={() => setActiveNav(label)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeNav === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon name={icon}/>{label}{label === 'Tickets' && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">12</span>}</button>)}</nav>
          <div className="mt-auto rounded-xl bg-slate-900 p-4 text-white"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Icon name="spark" className="h-4 w-4 text-amber-300"/> AI assistant</div><p className="text-xs leading-5 text-slate-300">Let AI draft replies and route tickets faster.</p><button className="mt-3 text-xs font-semibold text-white underline underline-offset-4">Learn more</button></div>
          <div className="mt-6 flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">AR</div><div><p className="text-sm font-medium">Ananya Ravi</p><p className="text-xs text-slate-500">Admin</p></div><button onClick={() => setIsLoggedIn(false)} className="ml-auto text-xs font-medium text-slate-400 hover:text-slate-700">Log out</button></div>
        </aside>

        <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="mb-8 flex items-center justify-between gap-4"><div><p className="mb-1 text-sm font-medium text-indigo-600">Tuesday, July 29</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good morning, Ananya</h1><p className="mt-1 text-sm text-slate-500">Here’s what’s happening with your support queue.</p></div><button onClick={addTicket} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><Icon name="plus" className="h-4 w-4"/> <span className="hidden sm:inline">New ticket</span></button></header>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Open tickets', '24', '+12% from last week', 'text-indigo-600'], ['In progress', '8', '3 need your attention', 'text-amber-600'], ['Resolved today', '18', '+5% from yesterday', 'text-emerald-600'], ['Avg. response time', '12m', '2m faster than average', 'text-sky-600']].map(([label, value, detail, accent]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p><p className={`mt-2 text-xs font-medium ${accent}`}>{detail}</p></article>)}</div>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-semibold">Recent tickets</h2><p className="mt-1 text-sm text-slate-500">Keep track of the latest customer conversations.</p></div><div className="flex gap-2"><label className="relative"><Icon name="search" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><input className="w-40 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-52" placeholder="Search tickets"/></label><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-indigo-500"><option>All tickets</option><option>Open</option><option>In progress</option><option>Resolved</option></select></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[690px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-medium">Ticket</th><th className="px-5 py-3 font-medium">Priority</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Updated</th><th className="px-5 py-3"></th></tr></thead><tbody>{visibleTickets.map((ticket) => <tr key={ticket.id} className="border-t border-slate-100 transition hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className={`grid h-9 w-9 place-items-center rounded-full ${ticket.color} text-xs font-bold text-white`}>{ticket.initials}</div><div><p className="font-medium text-slate-800">{ticket.title}</p><p className="mt-0.5 text-xs text-slate-500">{ticket.id} · {ticket.customer}</p></div></div></td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${ticket.priority === 'High' ? 'text-rose-600' : ticket.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'}`}><span className={`h-1.5 w-1.5 rounded-full ${ticket.priority === 'High' ? 'bg-rose-500' : ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`}/>{ticket.priority}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : ticket.status === 'In progress' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>{ticket.status}</span></td><td className="px-5 py-4 text-slate-500">{ticket.time}</td><td className="px-5 py-4"><button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`More options for ${ticket.id}`}><Icon name="dots" className="h-5 w-5"/></button></td></tr>)}</tbody></table></div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm"><span className="text-slate-500">Showing {visibleTickets.length} of {items.length} tickets</span><button className="font-medium text-indigo-600 hover:text-indigo-700">View all tickets →</button></div>
          </section>
        </section>
      </div>
    </main>
  )
}
