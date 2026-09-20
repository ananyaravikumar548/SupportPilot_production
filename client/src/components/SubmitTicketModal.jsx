import React, { useState } from 'react';

export default function SubmitTicketModal({ onClose, onSuccess }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTicket = {
      id: `#TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category: category || 'General (Auto-detected)',
      priority: priority || 'Medium (Auto-detected)',
      status: 'Open',
      date: 'Just Now',
      description,
    };

    onSuccess(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-lg">Submit New Ticket</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject *</label>
            <input
              type="text"
              required
              placeholder="Enter a clear and concise subject"
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category (Optional)</label>
              <select
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Select category (or let AI classify)</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="Account">Account</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority (Optional)</label>
              <select
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="">Select priority (or let AI detect)</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Please provide detailed information about your issue..."
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Attachment (Optional)</label>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}