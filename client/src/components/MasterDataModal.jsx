import React, { useState, useEffect } from 'react';
import API from '../api/auth'; // Adjust path if your auth/axios setup is located elsewhere
import { FiDatabase, FiClock, FiGrid, FiLayers, FiX } from 'react-icons/fi';

export default function MasterDataModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('sla');
  const [data, setData] = useState({ sla_policies: [], categories: [], applications: [], teams: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      API.get('/tickets/master-data/')
        .then(res => setData(res.data))
        .catch(err => console.error('Error fetching master data:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <FiDatabase className="text-emerald-600 text-lg" />
            <h3 className="font-bold text-slate-800">System Master Data & SLA Rules</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500">
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b text-xs font-semibold text-slate-600 bg-slate-100/60">
          <button
            onClick={() => setActiveTab('sla')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 ${activeTab === 'sla' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent'}`}
          >
            <FiClock /> SLA Matrix
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 ${activeTab === 'categories' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent'}`}
          >
            <FiGrid /> Categories
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 ${activeTab === 'apps' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent'}`}
          >
            <FiLayers /> Supported Products
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-sm text-slate-400">Loading Master Data...</div>
          ) : (
            <>
              {/* TAB 1: SLA MATRIX */}
              {activeTab === 'sla' && (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Priority</th>
                      <th className="p-2">First Response Target</th>
                      <th className="p-2">Resolution Target</th>
                      <th className="p-2">Calendar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.sla_policies.length > 0 ? (
                      data.sla_policies.map((sla, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-800">{sla.priority}</td>
                          <td className="p-2">{sla.first_response_minutes} mins</td>
                          <td className="p-2">{sla.resolution_minutes / 60} hours</td>
                          <td className="p-2"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{sla.calendar_type}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="p-4 text-center text-slate-400">No SLA policies found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 2: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-3">
                  {data.categories.length > 0 ? (
                    data.categories.map((cat, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-slate-50/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-slate-800">{cat.name} ({cat.code})</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{cat.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {cat.keywords?.map((kw, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-xs">No categories found.</div>
                  )}
                </div>
              )}

              {/* TAB 3: PRODUCTS */}
              {activeTab === 'apps' && (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Application / Product</th>
                      <th className="p-2">Auto Category Hint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.applications.length > 0 ? (
                      data.applications.map((app, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-800">{app.name}</td>
                          <td className="p-2"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">{app.category_hint}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="2" className="p-4 text-center text-slate-400">No application rules found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}