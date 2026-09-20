import { FiBook, FiSearch } from 'react-icons/fi';

const articles = [
  { id: 1, title: 'How to handle Payment Gateway Failures', category: 'Billing', views: '1.2k' },
  { id: 2, title: 'Troubleshooting SSO and Login Authorization', category: 'Account', views: '840' },
  { id: 3, title: 'Resolving Mobile App Crash Logs', category: 'Technical', views: '2.4k' },
];

export default function AgentKnowledge() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <FiBook className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Agent Knowledge Base</h2>
          <p className="text-xs text-slate-500">Quick guides and resolution templates for fast support</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((art) => (
          <div key={art.id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 font-semibold rounded">
              {art.category}
            </span>
            <h3 className="text-xs font-bold text-slate-800 mt-2 line-clamp-2">{art.title}</h3>
            <p className="text-[10px] text-slate-400 mt-3">{art.views} views</p>
          </div>
        ))}
      </div>
    </div>
  );
}