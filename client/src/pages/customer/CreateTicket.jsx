import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiPaperclip, FiUploadCloud, FiX, FiCpu } from 'react-icons/fi';
import API from "../../api/auth";

const CATEGORY_OPTIONS = ['VPN', 'Billing', 'Technical', 'Account', 'General'];

const normalizeCategory = (category) => {
  const value = String(category || '').trim().toLowerCase();
  const aliases = {
    vpn: 'VPN',
    billing: 'Billing',
    invoice: 'Billing',
    payment: 'Billing',
    technical: 'Technical',
    tech: 'Technical',
    infrastructure: 'Technical',
    account: 'Account',
    general: 'General',
  };
  return aliases[value] || CATEGORY_OPTIONS.find(
    (option) => option.toLowerCase() === value
  ) || '';
};

export default function CreateTicket() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      subject: '',
      category: '',
      description: '',
      whatTried: '',
      impactWho: 'Just me',
      impactBlocked: 'No',
      preferredContact: 'Email',
      workaroundAvailable: false,
    }
  });

  const [file, setFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const subjectText = watch('subject', '');
  const descriptionText = watch('description', '');

  // Impact/Context watched values
  const impactWho = watch('impactWho', 'Just me');
  const impactBlocked = watch('impactBlocked', 'No');
  const workaroundAvailable = watch('workaroundAvailable', false);
  const preferredContact = watch('preferredContact', 'Email');

  // Real-time Master Data Category Lookup
  useEffect(() => {
    if (!subjectText.trim() && !descriptionText.trim()) {
      setSuggestion(null);
      return;
    }

    const timer = setTimeout(() => {
      // Endpoint path adjusted to /preview-classify/ matching Django root routes
      API.post('/preview-classify/', {
        subject: subjectText,
        description: descriptionText
      })
      .then(res => {
        if (res.data) {
          setSuggestion(res.data);
          const detectedCategory = normalizeCategory(res.data.category);
          if (detectedCategory) {
            setValue('category', detectedCategory, {
              shouldValidate: true, 
              shouldTouch: true,
              shouldDirty: true 
            });
          }
        }
      })
      .catch(err => console.error('Preview classification failed:', err));
    }, 300);

    return () => clearTimeout(timer);
  }, [subjectText, descriptionText, setValue]);

  const clearForm = () => {
    reset(); 
    setFile(null);
    setSubmitSuccess(false);
    setSuggestion(null);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.subject,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: "MEDIUM",
        department: data.department || "General",
        affected_system: data.category || "General",
        what_tried: data.whatTried || "None reported",
        impact_who: impactWho,
        impact_blocked: impactBlocked,
        workaround_available: workaroundAvailable,
        location: data.location || "",
        asset_tag: data.assetTag || "",
        preferred_contact: preferredContact,
      };

      const response = await API.post("/tickets/", payload);

      toast.success("Ticket submitted! Our AI agent has emailed you a proposed solution.");
      setSubmitSuccess(true);

      // The automation continues server-side. Customers always return to their
      // own ticket list, where polling will show status and AI resolution updates.
      navigate('/customer/tickets', {
        replace: true,
        state: { submittedTicketId: response.data?.id || response.data?.ticket_id },
      });

    } catch (error) {
      console.error("Submission error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to submit ticket");
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
            Describe your issue in detail. Our AI will route it to the right team and fetch knowledge base solutions.
          </p>
        </div>
        <span className="hidden rounded-lg bg-emerald-50 p-2 text-emerald-700 sm:block">
          <FiPaperclip />
        </span>
      </div>

      {submitSuccess && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Ticket submitted! Our AI agent has emailed you a proposed solution.
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
              placeholder="Briefly describe your issue (e.g., VPN connection failure)"
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
              className={`${fieldClass} mt-1.5`}
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <span className="mt-1 block text-xs text-rose-600">{errors.category.message}</span>
            )}
          </label>
        </div>

        {/* Live AI Classification Badge */}
        {suggestion && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <FiCpu className="animate-pulse text-emerald-600 text-base" />
              <span>
                <strong>Master Data Auto-Matched Category:</strong>{' '}
                <span className="font-semibold underline underline-offset-2">{suggestion.category}</span>
                {suggestion.confidence && (
                  <span className="ml-1.5 text-[10px] text-emerald-700 font-medium">
                    ({Math.round(suggestion.confidence * 100)}% match)
                  </span>
                )}
              </span>
            </div>
            {suggestion.matched_by && (
              <span className="rounded bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900">
                {suggestion.matched_by}
              </span>
            )}
          </div>
        )}

        <label className="block text-sm font-semibold text-slate-700">
          Description
          <div className="relative mt-1.5">
            <textarea
              {...register('description', { required: 'Please describe the issue', maxLength: 1000 })}
              rows={4}
              placeholder="I cannot connect to company VPN since morning..."
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

        <label className="block text-sm font-semibold text-slate-700">
          What did you try? <span className="font-normal text-slate-400">(optional)</span>
          <input
            {...register('whatTried')}
            placeholder="e.g., Restarted laptop, toggled Wi-Fi"
            className={`${fieldClass} mt-1.5`}
          />
        </label>

        {/* 2) Impact */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
          <StepHeader number="2" title="Impact" subtitle="A few questions that help set the priority" />

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
              <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
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
          <StepHeader number="3" title="Context" subtitle="Extra details to help resolve faster" />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Department
              <input
                {...register('department')}
                placeholder="e.g., Finance, Operations"
                className={`${fieldClass} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Location / site
              <select {...register('location')} defaultValue="" className={`${fieldClass} mt-1.5`}>
                <option value="">Select location</option>
                <option>Bangalore</option>
                <option>Chennai</option>
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
              <div className="mb-1.5 text-sm font-semibold text-slate-700">Preferred contact</div>
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

        {/* Attachment Upload */}
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

        {/* Form Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={clearForm}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <FiX /> Cancel
          </button>

          <motion.button
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            disabled={isSubmitting}
            type="submit"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Ticket'}
          </motion.button>
        </div>
      </form>
    </motion.section>
  );
}
