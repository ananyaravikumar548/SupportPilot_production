import { useState } from 'react';
import { FiClock, FiGrid, FiLayers, FiDatabase } from 'react-icons/fi';

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('sla');

  const slaData = [
    { priority: 'P1 - Critical', response: '15 mins', resolution: '2 hours', calendar: '24/7' },
    { priority: 'P2 - High', response: '30 mins', resolution: '4 hours', calendar: '24/7' },
    { priority: 'P3 - Medium', response: '60 mins', resolution: '8 hours', calendar: 'Business Hours' },
    { priority: 'P4 - Low', response: '120 mins', resolution: '24 hours', calendar: 'Business Hours' },
  ];

  const categoriesData = [
    { name: 'Technical', code: 'CAT-TECH', description: 'Hardware, software bugs, and system outages' },
    { name: 'Billing', code: 'CAT-BILL', description: 'Invoices, payment gateways, and subscription queries' },
    { name: 'Access & Security', code: 'CAT-SEC', description: 'SSO, MFA, role permissions, and account locks' },
    { name: 'Network / VPN', code: 'CAT-NET', description: 'Connectivity, VPN setup, and latency issues' },
  ];

  const productsData = [
    { name: 'SupportPilot Portal', version: 'v2.4', tier: 'Enterprise' },
    { name: 'Identity Service', version: 'v1.8', tier: 'Core' },
    { name: 'Notification Engine', version: 'v3.1', tier: 'Core' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FiDatabase className="text-emerald-600" /> System Master Data & SLA Rules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized reference matrix for response metrics, classification, and product definitions
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('sla')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sla'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <FiClock className="text-sm" /> SLA Matrix
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <FiGrid className="text-sm" /> Categories
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <FiLayers className="text-sm" /> Supported Products
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'sla' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">First Response Target</th>
                    <th className="py-3 px-4">Resolution Target</th>
                    <th className="py-3 px-4">Calendar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slaData.map((row) => (
                    <tr key={row.priority} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{row.priority}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{row.response}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{row.resolution}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold">
                          {row.calendar}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categoriesData.map((cat) => (
                    <tr key={cat.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{cat.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{cat.code}</td>
                      <td className="py-3.5 px-4 text-slate-600">{cat.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Service Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productsData.map((prod) => (
                    <tr key={prod.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{prod.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{prod.version}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {prod.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}