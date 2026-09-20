import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ArticleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    title: '',
    category: 'Billing',
    status: 'published',
    content: '',
  });

  const [chunks, setChunks] = useState([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Split on headings (#) for local preview
  const handlePreviewChunks = () => {
    if (!form.content.trim()) return;
    const splitSections = form.content
      .split(/(?=# )/g)
      .filter(Boolean)
      .map((section, idx) => ({
        id: idx + 1,
        heading: section.split('\n')[0].replace('#', '').trim() || 'General',
        text: section.trim(),
        tokens: Math.round(section.length / 4),
      }));
    setChunks(splitSections);
    setIsPreviewing(true);
  };

  const saveArticle = async (statusOverride) => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('access');

    const payload = {
      title: form.title,
      category: form.category,
      content: form.content,
      status: statusOverride.toLowerCase(),
      assigned_team: form.category === 'VPN' || form.category === 'Technical' ? 'Network Team' : 'IT Helpdesk'
    };

    try {
      const response = await fetch('http://localhost:8000/api/articles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Article saved and indexed into Vector DB successfully!');
        navigate('/agent/knowledge');
      } else {
        const errorData = await response.json();
        alert(`Error saving article: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error('Failed to submit article:', err);
      alert('Network error while saving article.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Edit Knowledge Article' : 'Create Knowledge Article'}
        </h1>
        <button
          onClick={() => navigate('/agent/knowledge')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to KB
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Resolving Network Timeouts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="Technical">Technical</option>
              <option value="VPN">VPN</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Markdown Content</label>
          <textarea
            rows={10}
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="# Section Heading&#10;Describe troubleshooting steps here..."
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handlePreviewChunks}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50"
          >
            Preview Vector Chunks
          </button>
          
          <div className="space-x-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => saveArticle('draft')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => saveArticle('published')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Indexing...' : 'Publish & Index'}
            </button>
          </div>
        </div>
      </form>

      {/* Chunk Preview Modal/Section */}
      {isPreviewing && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Heading-Aware Vector Chunks ({chunks.length})
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {chunks.map((chunk) => (
              <div key={chunk.id} className="bg-white p-4 rounded border border-slate-300 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-500 font-sans border-b pb-1">
                  <span className="font-semibold text-slate-700">Heading: {chunk.heading}</span>
                  <span>~{chunk.tokens} tokens</span>
                </div>
                <p className="text-slate-600 whitespace-pre-wrap pt-1">{chunk.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}