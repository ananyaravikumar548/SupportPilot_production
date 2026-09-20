import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockArticles } from '../../mock/knowledge';

export default function AgentKnowledge() {
  const navigate = useNavigate();
  const [articles] = useState(mockArticles);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Knowledge Base</h1>
          <p className="text-sm text-gray-500">Manage support articles, vector indexing, and coverage gaps[cite: 1].</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => navigate('/agent/knowledge/gaps')}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          >
            View KB Gaps
          </button>
          <button
            onClick={() => navigate('/agent/knowledge/ingestion')}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          >
            Bulk Ingestion
          </button>
          <button
            onClick={() => navigate('/agent/knowledge/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            + New Article
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((art) => (
          <div key={art.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {art.category}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    art.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {art.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 hover:text-blue-600 cursor-pointer">{art.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{art.content}</p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t text-xs text-gray-400">
              <span>{art.views} Views</span>
              <button
                onClick={() => navigate(`/agent/knowledge/${art.id}/edit`)}
                className="text-blue-600 hover:underline font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}