import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiPaperclip, FiUploadCloud, FiX } from 'react-icons/fi';
import API from "../../api/auth";

export default function CreateTicket() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm();

  const [file, setFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const descriptionText = watch('description', '');

  // New (Impact/Context) watched values (frontend-only; NOT sent to backend)
  const impactWho = watch('impactWho', 'Just me');
  const impactBlocked = watch('impactBlocked', 'No');
  const impactUrgency = watch('impactUrgency', 'Normal');
  const workaroundAvailable = watch('workaroundAvailable', false);

  const preferredContact = watch('preferredContact', 'Email');

  const clearForm = () => {
    reset();
    setFile(null);
    setSubmitSuccess(false);
  };

  const onSubmit = async (data) => {
    try {
      // Keep backend payload exactly the same (no new fields sent)
      await API.post("/tickets/", {
        title: data.subject,
        description: data.description,
        category: data.category,
        priority: "MEDIUM",
      });

      toast.success("Ticket submitted successfully!");
      setSubmitSuccess(true);

      // Optional: auto-hide success banner after a few seconds
      setTimeout(() => setSubmitSuccess(false), 3500);

      clearForm();
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Failed to submit ticket");
      setSubmitSuccess(false);
    }
  };

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50';

  const StepHeader = ({ number, title, subtitle }) => (
    <div className="mb-3 mt-2 flex items-start gap-3">
      <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-emerald-700 text-[12px] font-extrabold text-white">
        {number}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
      </div>
    </div>
  );

  const Pill = ({ active, children, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg border px-3 py-2 text-xs font-semibold transition',
        active
          ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      ].join(' ')}
    >
      {children}
    </button>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="mx-auto max-w-4xl rounded-2xl border border-slate-100 bg-white p-6 shadow-soft sm:p-7"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Create New Ticket</h2>
          <p className="mt-1 text-sm text-slate-500">
            Describe your issue in detail. Our AI will route it to the right team.
          </p>
        </div>
        <span className="hidden rounded-lg bg-emerald-50 p-2 text-emerald-700 sm:block">
          <FiPaperclip />
        </span>
      </div>

      {/* Success banner (in addition to toast) */}
      {submitSuccess && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Ticket submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* 1) The issue */}
        <StepHeader number="1" title="The issue" subtitle="Tell us what’s happening" />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Subject
            <input
              {...register('subject', { required: 'Please add a subject' })}
              placeholder="Briefly describe your issue"
              className={`${fieldClass} mt-1.5`}
            />
            {errors.subject && (
              <span className="mt-1 block text-xs text-rose-600">{errors.subject.message}</span>
            )}
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Category
            <select
              {...register('category', { required: 'Please choose a category' })}
              defaultValue=""
              className={`${fieldClass} mt-1.5`}
            >
              <option value="" disabled>Select category</option>
              <option>Billing</option>
              <option>Technical</option>
              <option>Account</option>
              <option>General</option>
            </select>
            {errors.category && (
              <span className="mt-1 block text-xs text-rose-600">{errors.category.message}</span>
            )}
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Description
          <div className="relative mt-1.5">
            <textarea
              {...register('description', { required: 'Please describe the issue', maxLength: 1000 })}
              rows={6}
              placeholder="Include relevant details, error messages, and what you have already tried..."
              className={`${fieldClass} resize-none pb-7`}
            />
            <span className="absolute bottom-2.5 right-3 text-xs text-slate-400">
              {descriptionText.length}/1000
            </span>
          </div>
          {errors.description && (
            <span className="mt-1 block text-xs text-rose-600">{errors.description.message}</span>
          )}
        </label>

        {/* 2) Impact */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
          <StepHeader number="2" title="Impact" subtitle="A few questions that help set the priority" />

          {/* Hidden fields so RHF stores values */}
          <input type="hidden" {...register('impactWho')} />
          <input type="hidden" {...register('impactBlocked')} />
          <input type="hidden" {...register('preferredContact')} />

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-bold text-slate-700">Who is affected?</div>
              <div className="flex flex-wrap gap-2">
                {['Just me', 'My team', 'My department', 'Whole org'].map((opt) => (
                  <Pill
                    key={opt}
                    active={impactWho === opt}
                    onClick={() => setValue('impactWho', opt, { shouldDirty: true })}
                  >
                    {opt}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-bold text-slate-700">Is your work blocked?</div>
              <div className="flex flex-wrap gap-2">
                {['Yes, completely', 'Partially', 'No'].map((opt) => (
                  <Pill
                    key={opt}
                    active={impactBlocked === opt}
                    onClick={() => setValue('impactBlocked', opt, { shouldDirty: true })}
                  >
                    {opt}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-700 sm:mt-6">
                <input
                  type="checkbox"
                  {...register('workaroundAvailable')}
                  defaultChecked={!!workaroundAvailable}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-200"
                />
                A workaround is available
              </label>
            </div>
          </div>
        </div>

        {/* 3) Context */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
          <StepHeader number="3" title="Context" subtitle="Extra details to help resolve faster (optional)" />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Department <span className="font-normal text-slate-400">(optional)</span>
              <input
                {...register('department')}
                placeholder="e.g., Finance, Operations"
                className={`${fieldClass} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Location / site <span className="font-normal text-slate-400">(optional)</span>
              <select {...register('location')} defaultValue="" className={`${fieldClass} mt-1.5`}>
                <option value="">Select location</option>
                <option>Chennai</option>
                <option>Bangalore</option>
                <option>Hyderabad</option>
                <option>Remote</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Asset tag <span className="font-normal text-slate-400">(optional)</span>
              <input
                {...register('assetTag')}
                placeholder="e.g., LT-04821"
                className={`${fieldClass} mt-1.5`}
              />
            </label>

            <div>
              <div className="mb-1.5 text-sm font-semibold text-slate-700">
                Preferred contact <span className="font-normal text-slate-400">(optional)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Email', 'Phone', 'Teams'].map((opt) => (
                  <Pill
                    key={opt}
                    active={preferredContact === opt}
                    onClick={() => setValue('preferredContact', opt, { shouldDirty: true })}
                  >
                    {opt}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Existing Attachment */}
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-700">
            Attachment <span className="font-normal text-slate-400">(optional)</span>
          </p>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-3 text-sm transition hover:border-emerald-400 hover:bg-emerald-50">
            <FiUploadCloud className="h-5 w-5 text-emerald-700" />
            <span className="font-medium text-emerald-800">Upload a file</span>
            <span className="truncate text-slate-500">
              {file ? file.name : 'PDF, DOC, PNG or JPG up to 10MB'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={clearForm}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <FiX /> Cancel
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            type="submit"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Ticket'}
          </motion.button>
        </div>
      </form>
    </motion.section>
  );
}