import { useState } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Button from '../common/Button';

export default function ResponseForm({ onSubmitSuccess }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    toast.success('Response submitted!');
    setMessage('');
    if (onSubmitSuccess) onSubmitSuccess(message);
  };

  return (
    <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-100">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your response..."
          rows={3}
          className="w-full pl-3 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-slate-400">
            <button type="button" className="p-1 hover:text-indigo-600 transition-colors"><FiPaperclip className="w-4 h-4" /></button>
            <button type="button" className="p-1 hover:text-indigo-600 transition-colors"><FiSmile className="w-4 h-4" /></button>
          </div>
          <Button variant="primary" size="sm" type="submit">
            <FiSend className="w-3 h-3 mr-1" /> Send
          </Button>
        </div>
      </div>
    </form>
  );
}