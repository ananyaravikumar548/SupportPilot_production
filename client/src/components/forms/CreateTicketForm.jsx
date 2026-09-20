import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiPaperclip } from 'react-icons/fi';
import Button from '../common/Button';

export default function CreateTicketForm({ onSuccess }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);
  const descriptionText = watch('description', '');

  const onSubmit = (data) => {
    toast.success('Ticket submitted successfully!');
    reset();
    setFile(null);
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
          <input
            {...register('subject', { required: 'Subject is required' })}
            type="text"
            placeholder="Short summary of issue"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.subject && <p className="text-red-500 text-[10px] mt-1">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Select category</option>
            <option value="Billing">Billing</option>
            <option value="Technical">Technical</option>
            <option value="Account">Account</option>
            <option value="General">General</option>
          </select>
          {errors.category && <p className="text-red-500 text-[10px] mt-1">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
        <div className="relative">
          <textarea
            {...register('description', { 
              required: 'Description is required',
              maxLength: { value: 1000, message: 'Max 1000 characters allowed' }
            })}
            rows={4}
            placeholder="Describe your issue..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">
            {descriptionText.length}/1000
          </span>
        </div>
        {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment (Optional)</label>
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
          <label className="cursor-pointer bg-white px-3 py-1 text-xs border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-1">
            <FiPaperclip className="w-3.5 h-3.5" /> Choose file
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <span className="text-xs text-slate-500 truncate">{file ? file.name : 'No file chosen'}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={() => reset()}>Cancel</Button>
        <Button variant="primary" type="submit">Submit Ticket</Button>
      </div>
    </form>
  );
}