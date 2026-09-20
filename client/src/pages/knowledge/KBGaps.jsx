import React, { useState } from 'react';
import { mockKbGaps } from '../../mock/knowledge';
import { useNavigate } from 'react-router-dom';

export default function KBGaps() {
  const [gaps] = useState(mockKbGaps);
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Knowledge Base Coverage Gaps</h1>
          <p className="text-sm text-gray-500">
            Missing documentation topics automatically flagged when AI lacks sufficiency context[cite: 1].
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {gaps.map((gap) => (
          <div key={gap.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                  {gap.occurrenceCount} Unanswered Queries
                </span>
                <span className="text-xs text-gray-400 font-mono">Category: {gap.category}</span>
              </div>
              <h3 className="font-semibold text-gray-800">Missing Topic: {gap.subCategory}</h3>
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-600">Sample Failed Queries:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {gap.sampleQueries.map((query, i) => (
                    <li key={i}>{query}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => navigate('/agent/knowledge/new')}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 whitespace-nowrap"
            >
              + Create Article
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}